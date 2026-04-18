const Order = require('../models/Order');
const InventoryStock = require('../models/InventoryStock');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  // TOTAL SALES + ORDERS
  const totals = await Order.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$grandTotal' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  // TODAY SALES
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const today = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: todayStart },
      },
    },
    {
      $group: {
        _id: null,
        todayRevenue: { $sum: '$grandTotal' },
        todayOrders: { $sum: 1 },
      },
    },
  ]);

  // LOW STOCK COUNT
  const stock = await InventoryStock.find({});
  const lowStock = stock.filter(
    (item) => item.quantityOnHand <= item.reorderPoint
  );

  // TOP PRODUCTS
  const topProducts = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalQuantity: { $sum: '$items.quantity' },
        revenue: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        },
        sku: { $first: '$items.sku' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
  ]);

  res.json({
    totalRevenue: totals[0]?.totalRevenue || 0,
    totalOrders: totals[0]?.totalOrders || 0,
    todayRevenue: today[0]?.todayRevenue || 0,
    todayOrders: today[0]?.todayOrders || 0,
    lowStockCount: lowStock.length,
    topProducts,
  });
});