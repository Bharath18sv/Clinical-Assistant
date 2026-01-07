import mongoose from "mongoose";
import { Admin } from "../models/admin.models.js";
import dotenv from "dotenv";

dotenv.config();

const resetSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete all existing admins
    const deleteResult = await Admin.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing admin(s)`);

    // Create new super admin with known credentials
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

    console.log("\n✅ Super admin created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    admin@sca.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Role:     super_admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (error) {
    console.error("Error resetting super admin:", error);
    process.exit(1);
  }
};

resetSuperAdmin();
