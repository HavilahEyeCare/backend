import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../controllers/blogController.js";
import upload from "../middleware/uploadMiddleware.js"; // multer middleware

const router = express.Router();

// GET all posts
router.get("/", getPosts);

// GET a single post by slug
router.get("/slug/:slug", getPostBySlug);

// POST create post (staff/admin) with file uploads
// coverImage -> single, sectionImages -> multiple
router.post(
  "/",
  protect,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "sectionImages", maxCount: 20 },
  ]),
  createPost
);

// PUT update post (staff/admin) with optional file uploads
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "sectionImages", maxCount: 20 },
  ]),
  updatePost
);

// DELETE post (admin only)
router.delete("/:id", protect, adminOnly, deletePost);

export default router;
