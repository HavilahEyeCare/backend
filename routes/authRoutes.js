import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  deleteUser,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new user (admin only)
router.post("/register", protect, adminOnly, registerUser);

// Login user
router.post("/login", loginUser);

// Get current logged-in user
router.get("/me", protect, getMe);

// Admin routes
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
