import mongoose from "mongoose";
import dotenv from "dotenv";
import inquirer from "inquirer";
import User from "./models/userModel.js";
import BlogPost from "./models/blogModel.js";
import Testimonial from "./models/testimonialModel.js";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Helper: Create admin user
const createAdmin = async () => {
  const adminUser = new User({
    name: process.env.ADMIN_NAME || "Clinic Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD, // Will be hashed by userModel pre-save
    role: "admin",
  });
  await adminUser.save();
  console.log("✅ Admin user created:", adminUser.email);
};

// Seed admin only
const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ role: "admin" }).select("+password");
    if (adminExists) {
      console.log("⚠️ Admin already exists:", adminExists.email);
      process.exit();
    }

    await createAdmin();
    process.exit();
  } catch (err) {
    console.error("❌ Seeder error:", err.message);
    process.exit(1);
  }
};

// Reset helper with confirmation
const confirmAndClear = async (message, model, reseedAdmin = false) => {
  const { confirm } = await inquirer.prompt([
    { type: "confirm", name: "confirm", message, default: false },
  ]);

  if (!confirm) {
    console.log("❌ Reset cancelled.");
    process.exit();
  }

  await model.deleteMany({});
  console.log(`✅ Cleared ${model.collection.name} collection`);

  if (reseedAdmin) {
    await createAdmin();
  }
};

// Reset all collections
const resetAll = async () => {
  await connectDB();

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message:
        "⚠️ This will DELETE all users, blog posts, and testimonials. Continue?",
      default: false,
    },
  ]);

  if (!confirm) {
    console.log("❌ Reset cancelled.");
    process.exit();
  }

  await User.deleteMany({});
  await BlogPost.deleteMany({});
  await Testimonial.deleteMany({});

  console.log("✅ Database cleared. Seeding admin...");
  await createAdmin();

  process.exit();
};

// CLI handler
const arg = process.argv[2];

switch (arg) {
  case "-r":
    resetAll();
    break;
  case "-u":
    connectDB().then(() =>
      confirmAndClear(
        "⚠️ Delete ALL users? (Admin will be re-created)",
        User,
        true
      ).then(() => process.exit())
    );
    break;
  case "-b":
    connectDB().then(() =>
      confirmAndClear("⚠️ Delete ALL blog posts?", BlogPost).then(() =>
        process.exit()
      )
    );
    break;
  case "-t":
    connectDB().then(() =>
      confirmAndClear("⚠️ Delete ALL testimonials?", Testimonial).then(() =>
        process.exit()
      )
    );
    break;
  default:
    seedAdmin();
    break;
}
