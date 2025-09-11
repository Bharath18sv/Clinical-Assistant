import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.models.js";

export const verifyAdminJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request, token in the cookies or header is not found");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await Admin.findById(decodedToken?._id).select("-password");

    if (!admin) {
      throw new ApiError(401, "Invalid Access Token");
    }

    if (!admin.isActive) {
      throw new ApiError(401, "Admin account is deactivated");
    }

    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
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

    if (!req.admin.permissions[permission]) {
      throw new ApiError(403, `Permission denied: ${permission} required`);
    }

    next();
  });
};
