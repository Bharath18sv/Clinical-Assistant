import { SymptomLog } from "../models/symptomLogs.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create a new symptom log
export const createSymptomLog = asyncHandler(async (req, res) => {
  console.log("req.body in symptom log: ", req.body);
  const { doctorId, patientId, date, symptoms, vitals } = req.body;

  if (!patientId || !symptoms || symptoms.length === 0) {
    throw new ApiError(400, "patientId and at least one symptom are required");
  }
  if (!doctorId) {
    throw new ApiError(400, "doctorId is required");
  }

  const newLog = new SymptomLog({
    doctorId,
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
    .json(
      new ApiResponse(200, symptomLogs, "Symptom logs fetched successfully")
    );
});

// Get all symptom logs for a specific patient
export const getSymptomLogForPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.user._id;

  const symptomLogs = await SymptomLog.find({ patientId });

  if (!symptomLogs) {
    throw new ApiError(404, "Symptom logs not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, symptomLogs, "Symptom logs fetched successfully")
    );
});

// Get all the symptom logs of a doctor of all their patients
export const getSymptomLogsForDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.user._id;

  const symptomLogs = await SymptomLog.find({ doctorId });

  if (!symptomLogs) {
    throw new ApiError(404, "Symptom logs not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, symptomLogs, "Symptom logs fetched successfully")
    );
});

// get specific symptom log of a doctor by patient
export const getSymptomLogOfDoctorByPatient = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { patientId } = req.user._id;

  console.log("patientId : ", patientId);
  console.log("doctorId : ", doctorId);

  const symptomLog = await SymptomLog.findOne({ doctorId, patientId });
  console.log("symptomLog data : ", symptomLog);

  if (!symptomLog) {
    return res
      .status(204)
      .json(new ApiResponse(204, symptomLog, "No symptom log found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, symptomLog, "Symptom log fetched successfully"));
});

export const getSymptomLogsOfPatientByDoctor = asyncHandler(
  async (req, res) => {
    const { doctorId } = req.user._id;
    const { patientId } = req.params;

    const symptomLogs = await SymptomLog.find({ doctorId, patientId });

    if (!symptomLogs) {
      throw new ApiError(404, "Symptom logs not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, symptomLogs, "Symptom logs fetched successfully")
      );
  }
);

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

export const getRecentSymptomLogs = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const symptomLogs = await SymptomLog.find({
    $or: [{ patientId: userId }, { doctorId: userId }],
  })
    .sort({ date: -1 })
    .limit(5);

  if (!symptomLogs) {
    throw new ApiError(404, "Symptom logs not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        symptomLogs,
        "Recent symptom logs fetched successfully"
      )
    );
});

export const updateSymptomLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { symptoms, vitals } = req.body;

  const log = await SymptomLog.findById(id);
  if (!log) throw new ApiError(404, "Symptom log not found");

  if (log.patientId.toString() !== req.user._id.toString())
    throw new ApiError(403, "You are not allowed to update this log");

  if (symptoms) log.symptoms = symptoms;
  if (vitals) log.vitals = vitals;

  await log.save();
  return res.status(200).json(new ApiResponse(200, log, "Symptom log updated"));
});

export const filterSymptomLogs = asyncHandler(async (req, res) => {
  const { startDate, endDate, severity } = req.query;
  const filter = { patientId: req.user._id };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (severity) filter["symptoms.severity"] = severity;

  const logs = await SymptomLog.find(filter).sort({ date: -1 });
  return res.status(200).json(new ApiResponse(200, logs, "Filtered logs"));
});

export const getDoctorListForPatient = asyncHandler(async (req, res) => {
  const patientId = req.user._id;

  const doctors = await SymptomLog.distinct("doctorId", { patientId });

  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctor list fetched successfully"));
});

export const getPatientListForDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;

  const patients = await SymptomLog.distinct("patientId", { doctorId });

  return res
    .status(200)
    .json(new ApiResponse(200, patients, "Patient list fetched successfully"));
});
