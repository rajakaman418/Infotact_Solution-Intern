const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderLineItem = require('../models/OrderLineItem');
const Product = require('../models/Product');
const InventoryStock = require('../models/InventoryStock');
const InventoryLedger = require('../models/InventoryLedger');
const Promotion = require('../models/Promotion');
const TaxRule = require('../models/TaxRule');
const ApiError = require('../utils/ApiError');

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function calculatePromotion(code, subtotal, storeId) {
  if (!code) return { discount: 0, promotionCode: '' };

  const promo = await Promotion.findOne({
    code: code.toUpperCase(),
    active: true,
    startsAt: { $lte: new Date() },
    endsAt: { $gte: new Date() },
    $or: [{ applicableStoreIds: { $size: 0 } }, { applicableStoreIds: storeId }],
  });

  if (!promo || subtotal < promo.minCartValue) {
    return { discount: 0, promotionCode: '' };
  }

  let discount = promo.type === 'flat' ? promo.value : (subtotal * promo.value) / 100;
  if (promo.maxDiscount !== null) discount = Math.min(discount, promo.maxDiscount);
  return { discount, promotionCode: promo.code };
}

async function calculateTax(storeId, taxableAmount) {
  const rule = await TaxRule.findOne({ storeId, active: true }).sort({ createdAt: -1 });
  if (!rule) return 0;
  return (taxableAmount * rule.rate) / 100;
}

async function createPOSOrder(payload, user) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { storeId, customerId = null, items, paymentMethod, promotionCode } = payload;
    if (!Array.isArray(items) || !items.length) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    let subtotal = 0;
    const lineItemsToCreate = [];

    for (const item of items) {
      const { productId, variantId, quantity } = item;
      if (!quantity || quantity < 1) throw new ApiError(400, 'Quantity must be at least 1');

      const product = await Product.findById(productId).session(session);
      if (!product) throw new ApiError(404, 'Product not found');

      const variant = product.variants.id(variantId);
      if (!variant || !variant.isActive) throw new ApiError(404, 'Variant not found');

      const stock = await InventoryStock.findOne({ storeId, productId, variantId }).session(session);
      if (!stock) throw new ApiError(404, `No stock record for SKU ${variant.sku}`);
      if (stock.quantityOnHand < quantity) throw new ApiError(400, `Insufficient stock for SKU ${variant.sku}`);

      const lineSubtotal = variant.price * quantity;
      subtotal += lineSubtotal;

      lineItemsToCreate.push({
        productId,
        variantId,
        sku: variant.sku,
        title: product.title,
        variantLabel: `${variant.size || ''} ${variant.color || ''}`.trim(),
        quantity,
        unitPrice: variant.price,
      });
    }

    const { discount, promotionCode: appliedCode } = await calculatePromotion(promotionCode, subtotal, storeId);
    const taxableAmount = Math.max(subtotal - discount, 0);
    const taxTotal = await calculateTax(storeId, taxableAmount);
    const grandTotal = taxableAmount + taxTotal;

    const order = await Order.create(
      [{
        orderNumber: generateOrderNumber(),
        channel: 'pos',
        storeId,
        customerId,
        cashierId: user._id,
        subtotal,
        discountTotal: discount,
        taxTotal,
        grandTotal,
        promotionCode: appliedCode,
        payments: [{ method: paymentMethod || 'cash', amount: grandTotal }],
      }],
      { session }
    );

    const orderId = order[0]._id;

    for (const line of lineItemsToCreate) {
      const stock = await InventoryStock.findOne({
        storeId,
        productId: line.productId,
        variantId: line.variantId,
      }).session(session);

      const beforeQty = stock.quantityOnHand;
      const afterQty = beforeQty - line.quantity;
      stock.quantityOnHand = afterQty;
      await stock.save({ session });

      await OrderLineItem.create([{ ...line, orderId, lineTotal: line.unitPrice * line.quantity }], { session });
      await InventoryLedger.create([{
        storeId,
        productId: line.productId,
        variantId: line.variantId,
        sku: line.sku,
        type: 'sale',
        quantityChange: -line.quantity,
        beforeQty,
        afterQty,
        referenceType: 'order',
        referenceId: orderId,
        createdBy: user._id,
      }], { session });
    }

    await session.commitTransaction();
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function refundOrder(orderId, user) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.status === 'refunded') throw new ApiError(400, 'Order already refunded');

    const lineItems = await OrderLineItem.find({ orderId }).session(session);

    for (const line of lineItems) {
      const stock = await InventoryStock.findOne({
        storeId: order.storeId,
        productId: line.productId,
        variantId: line.variantId,
      }).session(session);

      if (!stock) throw new ApiError(404, `Stock not found for SKU ${line.sku}`);

      const beforeQty = stock.quantityOnHand;
      const afterQty = beforeQty + line.quantity;
      stock.quantityOnHand = afterQty;
      await stock.save({ session });

      await InventoryLedger.create([{
        storeId: order.storeId,
        productId: line.productId,
        variantId: line.variantId,
        sku: line.sku,
        type: 'refund',
        quantityChange: line.quantity,
        beforeQty,
        afterQty,
        referenceType: 'refund',
        referenceId: order._id,
        createdBy: user._id,
      }], { session });
    }

    order.status = 'refunded';
    await order.save({ session });
    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { createPOSOrder, refundOrder };
