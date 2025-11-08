import mongoose from "mongoose";

// Schema for testimonials
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: "", // optional but avoids undefined
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null, // optional numeric rating
    },
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
