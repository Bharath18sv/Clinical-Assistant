import { SymptomLog } from "../models/symptomLogs.models";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

// Create a new symptom log
export const createSymptomLog = asyncHandler(async (req, res) => {
  const { patientId, date, symptoms, vitals } = req.body;

  if (!patientId || !symptoms || symptoms.length === 0) {
    throw new ApiError(400, "patientId and at least one symptom are required");
  }

  const newLog = new SymptomLog({
    patientId,
    date: date ? new Date(date) : undefined,
    symptoms,
    vitals,
  });

  await newLog.save();

  return res
    .status(201)
    .json(new ApiResponse(201, newLog, "Symptom log created successfully"));
});

// Get all symptom logs of a patient
export const getSymptomLogs = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const symptomLogs = await SymptomLog.find({
    $or: [{ patientId: userId }, { doctorId: userId }],
  });

  if (!symptomLogs) {
    throw new ApiError(404, "Symptom logs not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, symptomLogs, "Symptom logs fetched successfully"));
});

// Get a specific symptom log by ID
export const getSymptomLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const log = await SymptomLog.findById(id).populate("vitals");
  if (!log) {
    throw new ApiError(404, "Symptom log not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Symptom log fetched successfully"));
});
