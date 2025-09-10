import { Router } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";

const router = Router();

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.accessToken ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "")
        : null);

    if (!token) {
      return res
        .status(200)
        .json(new ApiResponse(200, { role: null, user: null }, "No session"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const role = decoded?.role;
    let user = null;
    if (role === "admin") {
      user = await Admin.findById(decoded._id).select(
        "-password -refreshToken"
      );
    } else if (role === "doctor") {
      user = await Doctor.findById(decoded._id).select(
        "-password -refreshToken"
      );
    } else if (role === "patient") {
      user = await Patient.findById(decoded._id).select(
        "-password -refreshToken"
      );
    }

    if (!user) {
      return res
        .status(200)
        .json(new ApiResponse(200, { role: null, user: null }, "No user"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { role, user }, "Session active"));
  } catch (e) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { role: null, user: null }, "Invalid session")
      );
  }
});

export default router;
