import express from "express";
import {
  createTestimonial,
  getTestimonials,
  deleteTestimonial,
} from "../controllers/testimonialController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Public routes
 * - POST / → add a new testimonial
 * - GET  / → get testimonials (supports pagination & limit)
 */
router.route("/")
  .post(createTestimonial)  // Public: patients/clients can add
  .get(getTestimonials);    // Public: anyone can view

/**
 * Private/Admin routes
 * - DELETE /:id → delete a testimonial
 */
router.route("/:id")
  .delete(protect, adminOnly, deleteTestimonial); // Admin only

export default router;
