import express from "express";
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../controllers/blogController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:slug", getPostBySlug);

// Protected routes (staff/admin only)
router.post("/", protect, admin, createPost);
router.put("/:id", protect, admin, updatePost);
router.delete("/:id", protect, admin, deletePost);

export default router;
