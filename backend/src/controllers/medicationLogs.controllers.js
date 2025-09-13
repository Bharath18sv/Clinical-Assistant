import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const logSymptoms = asyncHandler(async (req, res) => {
  // TODO: Implement symptom logging
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Symptom logged successfully"));
});

const logMedication = asyncHandler(async (req, res) => {
  // TODO: Implement medication logging
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Medication logged successfully"));
});

const getMyLogs = asyncHandler(async (req, res) => {
  // TODO: Implement get logs functionality
  return res
    .status(200)
    .json(new ApiResponse(200, [], "Logs fetched successfully"));
});

export { logSymptoms, logMedication, getMyLogs };
