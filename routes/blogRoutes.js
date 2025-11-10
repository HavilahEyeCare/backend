import express from "express";
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../controllers/blogController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:slug", getPostBySlug);

// Protected routes (staff/admin only)
router.post("/", protect, adminOnly, createPost);
router.put("/:id", protect, adminOnly, updatePost);
router.delete("/:id", protect, adminOnly, deletePost);

export default router;
