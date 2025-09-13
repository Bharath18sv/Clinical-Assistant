import { Patient } from "../models/patient.models";
import { Vitals } from "../models/vitals.models.js";
import { Doctor } from "../models/doctor.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVitals = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;

  if (!userId) {
    throw new ApiError(400, "User ID is required, user is not authorized");
  }

  const vitals = await Vitals.find({
    $or: [{ doctorId: userId }, { patientId: userId }],
  });

  if (!vitals || vitals.length === 0) {
    return ApiResponse(404, null, "No vitals found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vitals, "Vitals fetched successfully"));
});

const addVitals = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;
  const { patientId, bloodPressure, sugar } = req.body; // no need to send takenAt from frontend

  if (!userId) {
    throw new ApiError(400, "User ID is required, user is not authorized");
  }

  const doctor = await Doctor.findById(userId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const newVitals = new Vitals({
    doctor: doctor._id,
    patient: patient._id,
    bloodPressure,
    sugar,
    takenAt: new Date(),
  });

  await newVitals.save();

  res
    .status(200)
    .json(new ApiResponse(200, newVitals, "Vitals added successfully"));
});

export { getVitals, addVitals };
