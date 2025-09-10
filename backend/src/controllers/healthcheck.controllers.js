import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { SymptomLog } from "../models/symptomLogs.models.js";
import { MedicationLog } from "../models/medicationLogs.schema.js";
import { Alert } from "../models/alerts.models.js";

const healthCheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "OK", "Healthcare check passed"));
});

// Patient: log symptoms for the day
const logSymptoms = asyncHandler(async (req, res) => {
  const patientId = req.user?._id || req.user?.id;
  if (!patientId) throw new ApiError(401, "Unauthorized");

  const { symptoms, vitalsId } = req.body;
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    throw new ApiError(400, "symptoms array required");
  }

  const log = await SymptomLog.create({
    patientId,
    symptoms,
    vitals: vitalsId || undefined,
  });

  // Simple critical symptom alerting
  const criticalSymptoms = new Set([
    "chest pain",
    "shortness of breath",
    "severe rash",
    "fainting",
    "confusion",
  ]);
  const hasCritical = symptoms.some((s) =>
    criticalSymptoms.has(String(s).toLowerCase())
  );
  if (hasCritical) {
    await Alert.create({
      patientId,
      type: "Critical Symptom",
      severity: "high",
      description: `Critical symptom reported: ${symptoms.join(", ")}`,
      linkedRecordId: log._id,
      status: "pending",
    });
  }

  res.status(201).json(new ApiResponse(201, log, "Symptoms logged"));
});

// Patient: log medication intake
const logMedication = asyncHandler(async (req, res) => {
  const patientId = req.user?._id || req.user?.id;
  if (!patientId) throw new ApiError(401, "Unauthorized");

  const { prescriptionId, medicationName, date, timeOfDay, status } = req.body;
  if (!prescriptionId || !medicationName || !timeOfDay || !status) {
    throw new ApiError(
      400,
      "prescriptionId, medicationName, timeOfDay, status required"
    );
  }

  const log = await MedicationLog.create({
    prescriptionId,
    medicationName,
    date: date ? new Date(date) : new Date(),
    timeOfDay,
    status,
    takenAt: status === "taken" ? new Date() : undefined,
  });

  // Missed dose alert (medium)
  if (status === "missed") {
    await Alert.create({
      patientId,
      type: "Medication Missed",
      severity: "medium",
      description: `Missed ${medicationName} (${timeOfDay})`,
      linkedRecordId: log._id,
    });
  }

  res.status(201).json(new ApiResponse(201, log, "Medication log saved"));
});

// Patient: fetch my recent logs
const getMyLogs = asyncHandler(async (req, res) => {
  const patientId = req.user?._id || req.user?.id;
  if (!patientId) throw new ApiError(401, "Unauthorized");

  const [symptomLogs, medicationLogs] = await Promise.all([
    SymptomLog.find({ patientId }).sort({ date: -1 }).limit(50),
    MedicationLog.find({}).sort({ createdAt: -1 }).limit(100),
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, { symptomLogs, medicationLogs }, "Logs fetched")
    );
});

export { healthCheck, logSymptoms, logMedication, getMyLogs };
