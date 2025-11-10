import mongoose from "mongoose";
import slugify from "slugify";

// Subdocument schema for sections (matches PostEditor structure)
const sectionSchema = new mongoose.Schema({
  heading: { type: String, trim: true },
  subheading: { type: String, trim: true },
  content: { type: String, trim: true },
  list: [{ type: String, trim: true }],
  images: [{ type: String, trim: true }], // store Cloudinary URLs
});

// Main BlogPost schema
const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a blog title"],
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
    },

    excerpt: {
      type: String,
      trim: true,
      default: "",
    },

    sections: [sectionSchema],

    coverImage: {
      type: String,
      // default:
      //   "https://res.cloudinary.com/djyunjvjh/image/upload/v1762777621/default-cover.jpg_sprflp.jpg",
    },

    category: {
      type: String,
      enum: [
        "Eye Care Tips",
        "Glaucoma",
        "Cataract",
        "News & Events",
        "Technology",
        "General Health",
      ],
      required: [true, "Please select a category"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    published: {
      type: Boolean,
      default: true,
    },

    // Optional: keep Cloudinary public_id for deletion support
    coverPublicId: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving
blogPostSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

export default BlogPost;
