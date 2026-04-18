const mongoose = require('mongoose');
const InventoryStock = require('../models/InventoryStock');
const InventoryLedger = require('../models/InventoryLedger');
const Order = require('../models/Order');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createPOSOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, storeId, customerId } = req.body;

    if (!storeId) {
      throw new Error('storeId is required');
    }

    if (!items || !Array.isArray(items) || !items.length) {
      throw new Error('No items in cart');
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { productId, variantId, sku, quantity, price } = item;

      if (!productId || !variantId || !sku || quantity === undefined || price === undefined) {
        throw new Error(
          'Each item must include productId, variantId, sku, quantity, and price'
        );
      }

      const qty = Number(quantity);
      const unitPrice = Number(price);

      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error(`Invalid quantity for SKU: ${sku}`);
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(`Invalid price for SKU: ${sku}`);
      }

      const stock = await InventoryStock.findOne({
        storeId,
        productId,
        variantId,
      }).session(session);

      if (!stock) {
        throw new Error(`Stock not found for SKU: ${sku}`);
      }

      if (stock.quantityOnHand < qty) {
        throw new Error(`Insufficient stock for SKU: ${sku}`);
      }

      const beforeQty = stock.quantityOnHand;
      stock.quantityOnHand -= qty;
      await stock.save({ session });
      const afterQty = stock.quantityOnHand;

      subtotal += unitPrice * qty;

      orderItems.push({
        productId,
        variantId,
        sku,
        quantity: qty,
        price: unitPrice,
      });

      await InventoryLedger.create(
        [
          {
            storeId,
            productId,
            variantId,
            sku,
            type: 'sale',
            quantityChange: -qty,
            beforeQty,
            afterQty,
            referenceType: 'order',
            referenceId: null,
            note: 'POS checkout',
            createdBy: req.user._id,
          },
        ],
        { session }
      );
    }

    const discountTotal = 0;
    const taxTotal = 0;
    const grandTotal = subtotal - discountTotal + taxTotal;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const orderDocs = await Order.create(
      [
        {
          orderNumber,
          channel: 'pos',
          storeId,
          customerId: customerId || null,
          cashierId: req.user._id,
          status: 'completed',
          subtotal,
          discountTotal,
          taxTotal,
          grandTotal,
          promotionCode: '',
          payments: [
            {
              method: 'cash',
              amount: grandTotal,
              reference: '',
            },
          ],
          items: orderItems,
        },
      ],
      { session }
    );

    const order = orderDocs[0];

    await InventoryLedger.updateMany(
      {
        createdBy: req.user._id,
        referenceType: 'order',
        referenceId: null,
        note: 'POS checkout',
      },
      { $set: { referenceId: order._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Checkout successful',
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      message: error.message,
    });
  }
});

exports.refundOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'refunded') {
      throw new Error('Order already refunded');
    }

    if (!order.items || !order.items.length) {
      throw new Error('Order has no items to refund');
    }

    for (const item of order.items) {
      const stock = await InventoryStock.findOne({
        storeId: order.storeId,
        productId: item.productId,
        variantId: item.variantId,
      }).session(session);

      if (!stock) {
        throw new Error(`Stock not found for SKU: ${item.sku}`);
      }

      const beforeQty = stock.quantityOnHand;
      stock.quantityOnHand += Number(item.quantity);
      await stock.save({ session });
      const afterQty = stock.quantityOnHand;

      await InventoryLedger.create(
        [
          {
            storeId: order.storeId,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            type: 'refund',
            quantityChange: Number(item.quantity),
            beforeQty,
            afterQty,
            referenceType: 'order',
            referenceId: order._id,
            note: 'Order refund',
            createdBy: req.user._id,
          },
        ],
        { session }
      );
    }

    order.status = 'refunded';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Order refunded successfully',
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      message: error.message,
    });
  }
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json(order);
});

exports.listOrders = asyncHandler(async (req, res) => {
  const {
    storeId,
    status,
    customerId,
    cashierId,
    channel,
    orderNumber,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (parsedPage - 1) * parsedLimit;

  const filter = {};

  if (storeId) filter.storeId = storeId;
  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  if (cashierId) filter.cashierId = cashierId;
  if (channel) filter.channel = channel;

  if (orderNumber) {
    filter.orderNumber = { $regex: orderNumber, $options: 'i' };
  }

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const [items, totalItems] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Order.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalItems,
      totalPages: Math.ceil(totalItems / parsedLimit),
      hasNextPage: parsedPage * parsedLimit < totalItems,
      hasPrevPage: parsedPage > 1,
    },
    filters: {
      storeId: storeId || null,
      status: status || null,
      customerId: customerId || null,
      cashierId: cashierId || null,
      channel: channel || null,
      orderNumber: orderNumber || null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const allowedStatuses = ['pending', 'completed', 'cancelled', 'refunded'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  await order.save();

  res.json({
    message: 'Order status updated successfully',
    order,
  });
});