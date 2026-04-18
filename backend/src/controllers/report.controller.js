const Order = require('../models/Order');
const InventoryStock = require('../models/InventoryStock');
const asyncHandler = require('../middlewares/asyncHandler');

exports.salesSummary = asyncHandler(async (req, res) => {
  const summary = await Order.aggregate([
    {
      $group: {
        _id: '$storeId',
        totalSales: { $sum: '$grandTotal' },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  res.json({ items: summary });
});

exports.inventoryValuation = asyncHandler(async (req, res) => {
  const items = await InventoryStock.find({}).select('storeId sku quantityOnHand');
  res.json({ items });
});

exports.salesReport = asyncHandler(async (req, res) => {
  const { storeId, startDate, endDate } = req.query;

  const match = { status: 'completed' };

  if (storeId) {
    match.storeId = storeId;
  }

  if (startDate || endDate) {
    match.createdAt = {};

    if (startDate) {
      match.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  // Summary
  const summary = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$grandTotal' },
        totalOrders: { $sum: 1 },
        totalItemsSold: {
          $sum: {
            $reduce: {
              input: '$items',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.quantity'] },
            },
          },
        },
      },
    },
  ]);

  // Top products
  const topProducts = await Order.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        },
        sku: { $first: '$items.sku' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
  ]);

  // Daily sales
  const dailySales = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  res.json({
    message: 'Sales report generated',
    summary: summary[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalItemsSold: 0,
    },
    topProducts,
    dailySales,
  });
});