import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ONLY ADMIN
router.get("/", verifyToken, checkRole("admin"), getDashboardStats);

export default router;