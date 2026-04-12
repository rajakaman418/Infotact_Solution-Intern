import Product from "../models/Product.js";
import InventoryLog from "../models/InventoryLog.js";

// ✅ CREATE PRODUCT (ADMIN)
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price required" });
    }

    const product = await Product.create({
      name,
      price,
      stock,
      category,
    });

    // 🔥 Inventory Log (Initial Stock)
    if (stock > 0) {
      await InventoryLog.create({
        product: product._id,
        change: stock,
        type: "ADD",
      });
    }

    res.status(201).json({
      success: true,
      product,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET PRODUCTS (SEARCH + PAGINATION)
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      products,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // 🔥 LOG STOCK CHANGE
    if (req.body.stock !== undefined) {
      const change = req.body.stock - oldProduct.stock;

      if (change !== 0) {
        await InventoryLog.create({
          product: updatedProduct._id,
          change,
          type: change > 0 ? "ADD" : "REMOVE",
        });
      }
    }

    res.json({
      success: true,
      product: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ LOW STOCK ALERT
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    });

    res.json({
      success: true,
      products,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ INVENTORY LOGS
export const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find()
      .populate("product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      logs,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};