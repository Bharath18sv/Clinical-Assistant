import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.models.js";

export const verifyAdminJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, "Token not found");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const admin = await Admin.findById(decodedToken?._id).select("-password");

    if (!admin || !admin.isActive) {
      throw new ApiError(401, "Invalid admin");
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.log("Admin auth error:", error.message);
    throw new ApiError(401, "Authentication failed");
  }
});

export const requireAdminRole = (requiredRole = "admin") => {
  return asyncHandler(async (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(401, "Admin authentication required");
    }

    if (requiredRole === "super_admin" && req.admin.role !== "super_admin") {
      throw new ApiError(403, "Super admin access required");
    }

    next();
  });
};

export const checkPermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(401, "Admin authentication required");
    }

    if (req.admin.role === "super_admin") {
      return next(); // Super admin has all permissions
    }

    if (!req.admin.permissions || !req.admin.permissions[permission]) {
      throw new ApiError(403, `Permission denied: ${permission} required`);
    }

    next();
  });
};
