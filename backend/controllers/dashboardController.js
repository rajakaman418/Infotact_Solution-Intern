import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
  try {

    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 🔥 TOTAL REVENUE
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // 🔥 MONTHLY CHART DATA
    const monthlyData = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      monthlyData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};