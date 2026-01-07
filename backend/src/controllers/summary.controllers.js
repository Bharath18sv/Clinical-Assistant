import { Summary } from "../models/summary.models.js";
import { Patient } from "../models/patient.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Prescription } from "../models/prescription.models.js";
import { Alert } from "../models/alerts.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new summary
const createSummary = asyncHandler(async (req, res) => {
  const { patientId, periodStart, periodEnd, textSummary, keyAlerts, prescriptions } = req.body;
  const doctorId = req.user?._id;

  if (!doctorId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!patientId || !periodStart || !periodEnd || !textSummary) {
    throw new ApiError(400, "patientId, periodStart, periodEnd, and textSummary are required");
  }

  // Verify patient exists and belongs to doctor
  const patient = await Patient.findOne({ _id: patientId, doctorId });
  if (!patient) {
    throw new ApiError(404, "Patient not found or not assigned to this doctor");
  }

  // Validate dates
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  if (start >= end) {
    throw new ApiError(400, "periodStart must be before periodEnd");
  }

  const summary = await Summary.create({
    patientId,
    doctorId,
    periodStart: start,
    periodEnd: end,
    textSummary,
    keyAlerts: keyAlerts || [],
    prescriptions: prescriptions || [],
  });

  const populatedSummary = await Summary.findById(summary._id)
    .populate("patientId", "fullname email age gender")
    .populate("doctorId", "fullname email specialization")
    .populate("keyAlerts")
    .populate("prescriptions");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedSummary, "Summary created successfully"));
});

// Get all summaries for a doctor
const getDoctorSummaries = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id;

  if (!doctorId) {
    throw new ApiError(401, "Unauthorized");
  }

  const { page = 1, limit = 10, patientId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { doctorId };
  if (patientId) {
    query.patientId = patientId;
  }

  const [summaries, total] = await Promise.all([
    Summary.find(query)
      .populate("patientId", "fullname email age gender")
      .populate("doctorId", "fullname email specialization")
      .populate("keyAlerts")
      .populate("prescriptions")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Summary.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summaries,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      "Summaries fetched successfully"
    )
  );
});

// Get a single summary by ID
const getSummaryById = asyncHandler(async (req, res) => {
  const { summaryId } = req.params;
  const doctorId = req.user?._id;

  if (!doctorId) {
    throw new ApiError(401, "Unauthorized");
  }

  const summary = await Summary.findOne({ _id: summaryId, doctorId })
    .populate("patientId", "fullname email age gender allergies chronicConditions")
    .populate("doctorId", "fullname email specialization")
    .populate("keyAlerts")
    .populate("prescriptions");

  if (!summary) {
    throw new ApiError(404, "Summary not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Summary fetched successfully"));
});

// Update a summary
const updateSummary = asyncHandler(async (req, res) => {
  const { summaryId } = req.params;
  const { periodStart, periodEnd, textSummary, keyAlerts, prescriptions } = req.body;
  const doctorId = req.user?._id;

  if (!doctorId) {
    throw new ApiError(401, "Unauthorized");
  }

  const summary = await Summary.findOne({ _id: summaryId, doctorId });
  if (!summary) {
    throw new ApiError(404, "Summary not found");
  }

  // Update fields if provided
  if (periodStart) summary.periodStart = new Date(periodStart);
  if (periodEnd) summary.periodEnd = new Date(periodEnd);
  if (textSummary) summary.textSummary = textSummary;
  if (keyAlerts !== undefined) summary.keyAlerts = keyAlerts;
  if (prescriptions !== undefined) summary.prescriptions = prescriptions;

  // Validate dates if both are present
  if (summary.periodStart >= summary.periodEnd) {
    throw new ApiError(400, "periodStart must be before periodEnd");
  }

  await summary.save();

  const updatedSummary = await Summary.findById(summaryId)
    .populate("patientId", "fullname email age gender")
    .populate("doctorId", "fullname email specialization")
    .populate("keyAlerts")
    .populate("prescriptions");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSummary, "Summary updated successfully"));
});

// Delete a summary
const deleteSummary = asyncHandler(async (req, res) => {
  const { summaryId } = req.params;
  const doctorId = req.user?._id;

  if (!doctorId) {
    throw new ApiError(401, "Unauthorized");
  }

  const summary = await Summary.findOneAndDelete({ _id: summaryId, doctorId });
  if (!summary) {
    throw new ApiError(404, "Summary not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Summary deleted successfully"));
});

// Get summaries for a specific patient
const getPatientSummaries = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const doctorId = req.user?._id;

  if (!doctorId) {
    throw new ApiError(401, "Unauthorized");
  }

  // Verify patient belongs to doctor
  const patient = await Patient.findOne({ _id: patientId, doctorId });
  if (!patient) {
    throw new ApiError(404, "Patient not found or not assigned to this doctor");
  }

  const summaries = await Summary.find({ patientId, doctorId })
    .populate("doctorId", "fullname email specialization")
    .populate("keyAlerts")
    .populate("prescriptions")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { summaries, total: summaries.length },
        "Patient summaries fetched successfully"
      )
    );
});

export {
  createSummary,
  getDoctorSummaries,
  getSummaryById,
  updateSummary,
  deleteSummary,
  getPatientSummaries,
};
