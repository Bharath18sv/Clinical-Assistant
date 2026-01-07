import mongoose from "mongoose";
import { Admin } from "../models/admin.models.js";
import dotenv from "dotenv";
import connectDB from "../db/index.js";

dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    // await mongoose.connect(process.env.MONGODB_URI);
    await connectDB();

    // Find all admins
    const admins = await Admin.find({}).select("-password -refreshToken");
    
    console.log("\n=== All Admins in Database ===");
    console.log(`Total admins found: ${admins.length}\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Fullname: ${admin.fullname}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  IsActive: ${admin.isActive}`);
      console.log(`  Created: ${admin.createdAt}`);
      console.log("---");
    });

    // Specifically check for the super admin
    const superAdmin = await Admin.findOne({ email: "admin@sca.com" });
    
    if (superAdmin) {
      console.log("\n✅ Super Admin Found!");
      console.log(`Email: ${superAdmin.email}`);
      console.log(`Role: ${superAdmin.role}`);
      console.log(`IsActive: ${superAdmin.isActive}`);
    } else {
      console.log("\n❌ Super Admin NOT found with email: admin@sca.com");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking admin:", error);
    process.exit(1);
  }
};

checkAdmin();
