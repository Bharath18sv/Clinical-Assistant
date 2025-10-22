import { Patient } from "../models/patient.models.js";
import { Vitals } from "../models/vitals.models.js";
import { Doctor } from "../models/doctor.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getVitalsById = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user._id;
  console.log("Getting vitals for user ID:", userId);

  if (!userId) {
    throw new ApiError(400, "User ID is required, user is not authorized");
  }

  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const vitals = await Vitals.find({
    $or: [{ doctor: userId }, { patient: userId }],
  }).populate("doctor patient");

  if (!vitals || vitals.length === 0) {
    return res
      .status(204)
      .json(new ApiResponse(204, null, "No vitals found for this user"));
  }

  console.log("vitals found:", vitals);

  return res
    .status(200)
    .json(new ApiResponse(200, vitals, "Vitals fetched successfully"));
});

const addVitals = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    patientId,
    bloodPressure,
    sugar,
    weight,
    height,
    heartRate,
    temperature,
    oxygenSaturation,
    respiratoryRate,
  } = req.body;

  console.log("req.body in addVitals:", req.body);

  if (!userId) {
    throw new ApiError(400, "User ID is required, user is not authorized");
  }

  // Validate doctor
  const doctor = await Doctor.findById(userId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Validate patient ID format
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw new ApiError(400, "Invalid patient ID format");
  }

  // Validate patient
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Build vitals object only with available fields
  const vitalsData = {
    doctor: doctor._id,
    patient: patient._id,
    takenAt: new Date(),
  };

  if (bloodPressure) vitalsData.bloodPressure = bloodPressure;
  if (sugar) vitalsData.sugar = sugar;
  if (height) vitalsData.height = height;
  if (weight) vitalsData.weight = weight;
  if (heartRate) vitalsData.heartRate = heartRate;
  if (temperature) vitalsData.temperature = temperature;
  if (oxygenSaturation) vitalsData.oxygenSaturation = oxygenSaturation;
  if (respiratoryRate) vitalsData.respiratoryRate = respiratoryRate;

  console.log("vitalsData to be saved:", vitalsData);

  // Save new vitals
  const newVitals = new Vitals(vitalsData);
  await newVitals.save();

  res
    .status(201)
    .json(new ApiResponse(201, newVitals, "Vitals added successfully"));
});

const getAllVitals = asyncHandler(async (req, res) => {
  const vitals = await Vitals.find().populate("doctor patient");

  if (!vitals || vitals.length === 0) {
    return res
      .status(204)
      .json(new ApiResponse(204, null, "No vitals found in the system"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vitals, "All vitals fetched successfully"));
});

const getLatestVitals = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!patientId || patientId === 'undefined') {
    throw new ApiError(400, "Patient ID is required");
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw new ApiError(400, "Invalid patient ID format");
  }

  const latestVitals = await Vitals.findOne({ patient: patientId })
    .sort({ takenAt: -1 })
    .populate("doctor patient");

  if (!latestVitals) {
    return res
      .status(204)
      .json(
        new ApiResponse(204, null, "No latest vitals found for this patient")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, latestVitals, "Latest vitals fetched successfully")
    );
});

export { getVitalsById, addVitals, getAllVitals, getLatestVitals };
