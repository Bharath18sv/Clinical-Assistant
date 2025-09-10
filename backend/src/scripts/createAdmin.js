import mongoose from "mongoose";
import { Admin } from "../models/admin.models.js";
import dotenv from "dotenv";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ role: "super_admin" });

    if (existingAdmin) {
      console.log("Super admin already exists");
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await Admin.create({
      email: "admin@sca.com",
      password: "admin123",
      fullname: "Super Admin",
      role: "super_admin",
      permissions: {
        manageDoctors: true,
        managePatients: true,
        manageAdmins: true,
        viewAnalytics: true,
        systemSettings: true,
      },
      isActive: true,
    });

    console.log("Super admin created successfully:");
    console.log("Email:", superAdmin.email);
    console.log("Password: admin123");
    console.log("Role:", superAdmin.role);

    process.exit(0);
  } catch (error) {
    console.error("Error creating super admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
