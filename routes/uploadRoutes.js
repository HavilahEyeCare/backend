import express from "express";
import cloudinary from "../config/cloudinaryConfig.js";

const router = express.Router();

// Upload via Base64 (no multer needed)
router.post("/", async (req, res) => {
  try {
    const { image } = req.body; // base64 or remote file URL
    if (!image) return res.status(400).json({ error: "No image provided" });

    const result = await cloudinary.uploader.upload(image, {
      folder: "havilah_blog",
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
});

export default router;
