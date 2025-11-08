import Testimonial from "../models/testimonialModel.js";

/**
 * @desc    Add a new testimonial (patient/public)
 * @route   POST /testimonials
 * @access  Public
 */
export const createTestimonial = async (req, res) => {
  try {
    const { name, location, message, rating } = req.body;

    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    const testimonial = new Testimonial({
      name,
      location: location || "",
      message,
      rating: rating || null,
    });

    const createdTestimonial = await testimonial.save();
    res.status(201).json(createdTestimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get testimonials (supports pagination & limit)
 * @route   GET /testimonials?page=1&limit=6
 * @access  Public
 */
export const getTestimonials = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    const total = await Testimonial.countDocuments();

    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      testimonials,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a testimonial
 * @route   DELETE /testimonials/:id
 * @access  Private/Admin
 */
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Only admins can delete
    if (req.user && req.user.role === "admin") {
      await testimonial.deleteOne();
      return res.json({ message: "Testimonial removed" });
    }

    res.status(401).json({ message: "Not authorized" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
