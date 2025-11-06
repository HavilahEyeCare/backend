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
import axios from "axios";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const app = express();

// =================== MIDDLEWARE ===================
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// =================== CORS ===================
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Dev
      "https://www.havilaheyecare.com", // ✅ Production domain
    ],
    credentials: true,
  })
);

// =================== API ROUTES ===================
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/upload", uploadRoutes);

// =================== DIRNAME FIX ===================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =================== FRONTEND SERVE ===================
if (process.env.NODE_ENV === "production") {
  // Serve built Vite frontend
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  // ✅ Catch-all route for React Router
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  });
} else {
  // ✅ For local testing
  app.get("/", (req, res) => {
    res.send("API is running locally...");
  });
}

// =================== ERROR HANDLERS ===================
app.use(notFound);
app.use(errorHandler);

// =================== KEEP BACKEND AWAKE ===================
const WAKE_URL = process.env.RENDER_URL || "https://api.havilaheyecare.com";
setInterval(async () => {
  try {
    await axios.get(WAKE_URL);
    console.log("🌤️ Render backend pinged to stay awake");
  } catch (err) {
    console.log("⚠️ Wake-up ping failed:", err.message);
  }
}, 14 * 60 * 1000); // every 14 minutes

// =================== START SERVER ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
