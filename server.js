import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import cors from "cors";
import morgan from "morgan";
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
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173", // Dev
//       "https://www.havilaheyecare.com", // ✅ Your production domain
//     ],
//     credentials: true,
//   })
// );
// =================== CORS ===================
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://havilaheyecare.com", // ✅ Your actual live frontend
  "https://www.havilaheyecare.com", // Just in case both work
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// =================== API ROUTES ===================
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/upload", uploadRoutes);

// =================== BASE TEST ROUTE ===================
app.get("/", (req, res) => {
  res.send("✅ Havilah Eye Care API is running...");
});

// =================== ERROR HANDLERS ===================
app.use(notFound);
app.use(errorHandler);

// =================== KEEP BACKEND AWAKE ===================
const WAKE_URL = process.env.RENDER_URL || "https://backend-x0u1.onrender.com";
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
