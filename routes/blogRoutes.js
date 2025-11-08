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

// GET all posts
router.get("/", getPosts);

// GET a single post by slug
router.get("/slug/:slug", getPostBySlug);

// POST create post (staff/admin)
router.post("/", protect, createPost);

// PUT update post (staff/admin)
router.put("/:id", protect, updatePost);

// DELETE post (admin only)
router.delete("/:id", protect, adminOnly, deletePost);

export default router;
