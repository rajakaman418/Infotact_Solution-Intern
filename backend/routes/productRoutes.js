import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getInventoryLogs,
} from "../controllers/productController.js";

import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 All routes require login
router.use(verifyToken);

// 📦 CREATE PRODUCT (Admin only)
router.post("/", checkRole("admin"), createProduct);

// 📦 GET PRODUCTS (All users)
router.get("/", getProducts);

// ✏️ UPDATE PRODUCT (Admin only)
router.put("/:id", checkRole("admin"), updateProduct);

// ❌ DELETE PRODUCT (Admin only)
router.delete("/:id", checkRole("admin"), deleteProduct);

// ⚠️ LOW STOCK ALERT (Admin only)
router.get("/low-stock", checkRole("admin"), getLowStockProducts);

// 📜 INVENTORY LOGS (Admin only)
router.get("/logs", checkRole("admin"), getInventoryLogs);

export default router;