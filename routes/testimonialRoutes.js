import express from "express";
import {
  createTestimonial,
  getTestimonials,
  deleteTestimonial,
} from "../controllers/testimonialController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(createTestimonial)   // Public: patients can add
  .get(getTestimonials);     // Public: everyone can see

router.route("/:id")
  .delete(protect,adminOnly, deleteTestimonial); // Admin only

export default router;
