import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getAllUsers, deleteUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", protect,  adminOnly, registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

// ...
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
