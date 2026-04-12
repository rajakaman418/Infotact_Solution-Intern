import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ONLY ADMIN
router.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// ADMIN + MANAGER
router.get("/manager", verifyToken, checkRole("admin", "manager"), (req, res) => {
  res.json({ message: "Welcome Manager/Admin" });
});

// ALL LOGGED IN USERS
router.get("/cashier", verifyToken, (req, res) => {
  res.json({ message: "Welcome User" });
});

export default router;