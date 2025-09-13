import mongoose from "mongoose";
import { Admin } from "../models/admin.models.js";
import dotenv from "dotenv";

dotenv.config();

const showAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const admin = await Admin.findOne({ role: "super_admin" });
    
    if (admin) {
      console.log("Admin found:");
      console.log("Email:", admin.email);
      console.log("Full name:", admin.fullname);
      console.log("Role:", admin.role);
      console.log("Active:", admin.isActive);
      console.log("Created:", admin.createdAt);
    } else {
      console.log("No admin found");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

showAdmin();