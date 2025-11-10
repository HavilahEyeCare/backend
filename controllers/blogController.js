// backend/controllers/blogController.js
import asyncHandler from "express-async-handler";
import BlogPost from "../models/blogModel.js";
import slugify from "slugify";

/**
 * @desc    Create a new blog post
 * @route   POST /blog
 * @access  Private (staff/admin)
 */
export const createPost = asyncHandler(async (req, res) => {
  const { title, sections, excerpt, category, coverImage } = req.body;

  // Validate required fields
  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }
  if (!category) {
    res.status(400);
    throw new Error("Category is required");
  }
  if (!coverImage) {
    res.status(400);
    throw new Error("Cover image is required");
  }

  // Parse sections if sent as string
  let parsedSections = [];
  if (sections) {
    try {
      parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections;
    } catch {
      res.status(400);
      throw new Error("Invalid sections format");
    }
  }

  const slug = slugify(title, { lower: true, strict: true }) + "-" + Date.now();

  const post = await BlogPost.create({
    title,
    slug,
    excerpt: excerpt || "",
    category,
    sections: parsedSections, // sections already contain image URLs
    coverImage, // directly from frontend
    author: req.user._id,
  });

  res.status(201).json(post);
});

/**
 * @desc    Update a blog post
 * @route   PUT /blog/:id
 * @access  Private (staff/admin)
 */
export const updatePost = asyncHandler(async (req, res) => {
  const { title, sections, excerpt, category, coverImage } = req.body;

  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (title) {
    post.title = title;
    post.slug = slugify(title, { lower: true, strict: true }) + "-" + Date.now();
  }

  if (excerpt !== undefined) post.excerpt = excerpt;
  if (category) post.category = category;
  if (coverImage) post.coverImage = coverImage;

  if (sections) {
    try {
      post.sections = typeof sections === "string" ? JSON.parse(sections) : sections;
    } catch {
      res.status(400);
      throw new Error("Invalid sections format");
    }
  }

  const updatedPost = await post.save();
  res.json(updatedPost);
});

/**
 * @desc    Get all posts with pagination
 * @route   GET /blog
 * @access  Public
 */
export const getPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const sort =
    req.query.sort === "newest" || !req.query.sort
      ? { createdAt: -1 }
      : { createdAt: 1 };

  const count = await BlogPost.countDocuments();
  const posts = await BlogPost.find({})
    .populate("author", "name email")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ posts, page, pages: Math.ceil(count / limit), total: count });
});

/**
 * @desc    Get single post by slug
 * @route   GET /blog/slug/:slug
 * @access  Public
 */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug }).populate(
    "author",
    "name email"
  );

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.json(post);
});

/**
 * @desc    Delete a blog post
 * @route   DELETE /blog/:id
 * @access  Private (admin only)
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  await post.deleteOne();
  res.json({ message: "Post removed successfully" });
});
