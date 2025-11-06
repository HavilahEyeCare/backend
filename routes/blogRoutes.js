import express from "express";
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../controllers/blogController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinaryConfig.js";
import BlogPost from "../models/blogModel.js"; // ✅ Needed for manual creation
import slugify from "slugify";

const router = express.Router();

/**
 * Blog CRUD
 * - GET    /api/blog              → fetch all posts
 * - POST   /api/blog              → create post (requires login)
 * - GET    /api/blog/slug/:slug   → fetch single post by slug
 * - PUT    /api/blog/:id          → update post (requires login)
 * - DELETE /api/blog/:id          → delete post (admin only)
 */

// GET all posts
router.get("/", getPosts);

// GET a post by slug
router.get("/slug/:slug", getPostBySlug);

// POST create post
router.post("/", protect, async (req, res) => {
  try {
    const { title, category, coverImage, sections } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!category)
      return res.status(400).json({ message: "Category is required" });

    let uploadedCover = null;

    // If the frontend sends a base64 image string
    if (coverImage && coverImage.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(coverImage, {
        folder: "havilah_blog",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      uploadedCover = uploaded.secure_url;
    } else if (coverImage && typeof coverImage === "string") {
      uploadedCover = coverImage; // already a URL
    }

    // sections is already an array from frontend — don’t JSON.parse
    const post = await BlogPost.create({
      title,
      slug: slugify(title, { lower: true, strict: true }),
      category,
      coverImage: uploadedCover || "",
      sections: Array.isArray(sections) ? sections : [],
      author: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("❌ Create post error:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// PUT update post
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, category, coverImage, sections } = req.body;

    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (title) {
      post.title = title;
      post.slug = slugify(title, { lower: true, strict: true });
    }

    if (category) post.category = category;

    if (coverImage && coverImage.startsWith("data:")) {
      const uploaded = await cloudinary.uploader.upload(coverImage, {
        folder: "havilah_blog",
        resource_type: "image",
      });
      post.coverImage = uploaded.secure_url;
    } else if (coverImage && typeof coverImage === "string") {
      post.coverImage = coverImage;
    }

    if (Array.isArray(sections)) post.sections = sections;

    const updated = await post.save();
    res.json(updated);
  } catch (error) {
    console.error("❌ Update post error:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
});

// DELETE post (admin only)
router.delete("/:id", protect, adminOnly, deletePost);

export default router;
