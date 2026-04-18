const InventoryStock = require('../models/InventoryStock');
const InventoryLedger = require('../models/InventoryLedger');
const StockTransfer = require('../models/StockTransfer');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getStock = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.storeId) filter.storeId = req.query.storeId;
  if (req.query.sku) filter.sku = req.query.sku;

  const items = await InventoryStock.find(filter).sort({ updatedAt: -1 });

  res.json({ items });
});

exports.getLowStockItems = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.storeId) filter.storeId = req.query.storeId;

  const items = await InventoryStock.find(filter).sort({ quantityOnHand: 1 });
  const lowStock = items.filter((item) => item.quantityOnHand <= item.reorderPoint);

  res.json({ items: lowStock });
});

exports.getLedger = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.storeId) filter.storeId = req.query.storeId;
  if (req.query.sku) filter.sku = req.query.sku;

  const items = await InventoryLedger.find(filter)
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ items });
});

exports.addStock = asyncHandler(async (req, res) => {
  const { productId, variantId, sku, storeId, quantity, reorderPoint, note } = req.body;

  if (!productId || !variantId || !sku || !storeId || quantity === undefined) {
    return res.status(400).json({
      message: 'productId, variantId, sku, storeId, and quantity are required',
    });
  }

  const qty = Number(quantity);

  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({
      message: 'quantity must be a number greater than 0',
    });
  }

  let stock = await InventoryStock.findOne({
    storeId,
    productId,
    variantId,
  });

  let beforeQty = 0;
  let afterQty = 0;

  if (!stock) {
    stock = await InventoryStock.create({
      storeId,
      productId,
      variantId,
      sku,
      quantityOnHand: qty,
      reorderPoint: reorderPoint ?? 5,
    });

    afterQty = stock.quantityOnHand;
  } else {
    beforeQty = stock.quantityOnHand;
    stock.quantityOnHand += qty;

    if (reorderPoint !== undefined) {
      stock.reorderPoint = reorderPoint;
    }

    await stock.save();
    afterQty = stock.quantityOnHand;
  }

  await InventoryLedger.create({
    storeId,
    productId,
    variantId,
    sku,
    type: 'restock',
    quantityChange: qty,
    beforeQty,
    afterQty,
    referenceType: 'manual',
    referenceId: null,
    note: note || 'Manual stock addition',
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: 'Stock added successfully',
    item: stock,
  });
});

exports.createTransfer = asyncHandler(async (req, res) => {
  const transfer = await StockTransfer.create({
    ...req.body,
    requestedBy: req.user._id,
  });

  res.status(201).json(transfer);
});