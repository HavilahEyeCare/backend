import asyncHandler from "express-async-handler";
import BlogPost from "../models/blogModel.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinaryConfig.js";

/**
 * @desc    Create a new blog post
 * @route   POST /api/blog
 * @access  Private (staff/admin)
 */
export const createPost = asyncHandler(async (req, res) => {
  const { title, sections, excerpt, category, coverImage } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }

  if (!category) {
    res.status(400);
    throw new Error("Category is required");
  }

  let parsedSections = [];
  if (sections) {
    try {
      parsedSections =
        typeof sections === "string" ? JSON.parse(sections) : sections;
    } catch {
      res.status(400);
      throw new Error("Invalid sections format");
    }
  }

  // ✅ Upload cover image to Cloudinary if it’s a Base64 or local file
  let uploadedCover = null;
  if (coverImage && coverImage.startsWith("data:image")) {
    const uploadResult = await cloudinary.uploader.upload(coverImage, {
      folder: "havilah_blog/covers",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    uploadedCover = uploadResult.secure_url;
  }

  // ✅ Auto-generate slug
  const slug = slugify(title, { lower: true, strict: true });

  const post = await BlogPost.create({
    title,
    slug,
    excerpt: excerpt || "",
    category,
    sections: parsedSections,
    coverImage: uploadedCover || coverImage || undefined,
    author: req.user._id,
  });

  res.status(201).json(post);
});

/**
 * @desc    Get all posts
 * @route   GET /api/blog
 * @access  Public
 */
export const getPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find({})
    .populate("author", "name email")
    .sort({ createdAt: -1 });
  res.json(posts);
});

/**
 * @desc    Get single post by slug
 * @route   GET /api/blog/slug/:slug
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
 * @desc    Update a post
 * @route   PUT /api/blog/:id
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
    post.slug = slugify(title, { lower: true, strict: true });
  }

  if (excerpt !== undefined) post.excerpt = excerpt;
  if (category) post.category = category;

  if (sections) {
    try {
      post.sections =
        typeof sections === "string" ? JSON.parse(sections) : sections;
    } catch {
      res.status(400);
      throw new Error("Invalid sections format");
    }
  }

  // ✅ Upload new cover image if a base64 string is sent
  if (coverImage && coverImage.startsWith("data:image")) {
    const uploadResult = await cloudinary.uploader.upload(coverImage, {
      folder: "havilah_blog/covers",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    post.coverImage = uploadResult.secure_url;
  } else if (coverImage) {
    post.coverImage = coverImage; // in case it’s already a Cloudinary URL
  }

  const updatedPost = await post.save();
  res.json(updatedPost);
});

/**
 * @desc    Delete a post
 * @route   DELETE /api/blog/:id
 * @access  Private (admin only)
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // ✅ Optionally remove Cloudinary cover
  if (post.coverImage && post.coverImage.includes("res.cloudinary.com")) {
    const publicIdMatch = post.coverImage.match(/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (publicIdMatch) {
      const publicId = publicIdMatch[1];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Cloudinary cleanup failed:", err.message);
      }
    }
  }

  await post.deleteOne();
  res.json({ message: "Post removed successfully" });
});
