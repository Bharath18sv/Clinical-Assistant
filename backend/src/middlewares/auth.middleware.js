import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  // Check token in cookies or headers
  const authHeader = req.header("Authorization");
  const token =
    req.cookies?.accessToken ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null);

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decodedToken.role === "doctor") {
      const doctor = await Doctor.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (!doctor) {
        throw new ApiError(
          401,
          "Unauthorized User, User with this access token is not found"
        );
      }
      req.user = doctor;
    } else if (decodedToken.role === "patient") {
      const patient = await Patient.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (!patient) {
        throw new ApiError(
          401,
          "Unauthorized User, User with this access token is not found"
        );
      }
      req.user = patient;
    } else {
      throw new ApiError(401, "Invalid user role");
    }

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
});
