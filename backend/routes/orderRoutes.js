import express from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Any logged-in user can create order (cashier)
router.post("/", verifyToken, createOrder);

// View orders (admin/manager later restrict)
router.get("/", verifyToken, getOrders);

export default router;