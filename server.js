import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

import axios from "axios";


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: "20mb" })); // ✅ allow base64 uploads
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Dev logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// CORS for frontend access
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://www.havilaheyecare.com", // ✅ add your production domain later
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/upload", uploadRoutes); // ✅ Cloudinary upload route

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ❌ No longer needed since Cloudinary stores all uploads
// app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
// Serve frontend (Vite build)
const frontendPath = path.join(__dirname, "/frontend/dist"); // Adjust if your build folder name differs
app.use(express.static(frontendPath));

// All non-API routes → React router
app.get("*", (req, res) => {
  res.sendFile(path.resolve(frontendPath, "index.html"));
});

// Error Handling
app.use(notFound);
app.use(errorHandler);


// =================== PRODUCTION SETTINGS ===================

// Serve frontend (optional if hosting backend + frontend separately)
if (process.env.NODE_ENV === "production") {
  app.get("/", (req, res) => {
    res.send("✅ API running smoothly on Render!");
  });
}

// =================== KEEP BACKEND AWAKE ===================
// This ensures Render does not sleep your API or MongoDB connection

const WAKE_URL = process.env.RENDER_URL || "https://api.havilaheyecare.com";

setInterval(async () => {
  try {
    await axios.get(WAKE_URL);
    console.log("🌤️ Render backend pinged to stay awake");
  } catch (err) {
    console.log("⚠️ Wake-up ping failed:", err.message);
  }
}, 10 * 60 * 1000); // ping every 14 minutes


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
