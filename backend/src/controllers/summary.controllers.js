import { Summary } from "../models/summary.models";
import { Patient } from "../models/patient.models.js";
import { Doctor } from "../models/doctor.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Controller to create a new summary
const createSummary = asyncHandler(async (req, res) => {
  const { patientId, doctorId, content, periodStart, periodEnd, textSummary } = req.body;

  if (!patientId || !doctorId || !content || !date) {
    throw new ApiError(400, "All fields are required");
  }

  const summary = new Summary({
    patientId,
    doctorId,
    content,
    date,
  });

  await summary.save();

  return res
    .status(201)
    .json(new ApiResponse(201, summary, "Summary created successfully"));
});
