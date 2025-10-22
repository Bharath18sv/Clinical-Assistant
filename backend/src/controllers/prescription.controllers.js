// 1. Prescription Controllers
// 	Create Prescription
// 	•	Doctor creates for a patient.
// 	•	Body contains medications array.
// 	Get Prescriptions
// 	•	By patient (all prescriptions for a patient).
// 	•	By doctor (all prescriptions given by a doctor).
// 	•	Latest prescription.
// 	Update Prescription
// 	•	Modify medications, notes.
// 	Delete Prescription (optional).

import { asyncHandler } from "../utils/asyncHandler.js";
import { Prescription } from "../models/prescription.models.js";
import { MedicationLog } from "../models/medicationLogs.models.js";
import { Patient } from "../models/patient.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

// ML-based ADR Detection
const detectADR = async (patientId, medications) => {
  try {
    const patient = await Patient.findById(patientId);
    if (!patient) return [];

    const response = await axios.post('http://localhost:5001/predict-adr', {
      medications: medications,
      patient: {
        age: patient.age,
        allergies: patient.allergies || [],
        chronicConditions: patient.chronicConditions || []
      }
    }, { timeout: 5000 });

    if (response.data.success) {
      return response.data.interactions || [];
    }
    return [];
  } catch (error) {
    console.error('ML ADR service error:', error.message);
    return fallbackADRDetection(patientId, medications);
  }
};

const fallbackADRDetection = async (patientId, medications) => {
  const patient = await Patient.findById(patientId);
  if (!patient) return [];

  const adrAlerts = [];
  const allergySet = new Set((patient.allergies || []).map(a => a.toLowerCase()));
  
  for (const med of medications) {
    const medName = (med.name || '').toLowerCase();
    if (allergySet.has(medName)) {
      adrAlerts.push({
        type: 'allergy',
        severity: 'high',
        medications: [med.name],
        message: `Patient is allergic to ${med.name}`,
        recommendation: 'Discontinue immediately'
      });
    }
  }
  return adrAlerts;
};

// Helper function to create scheduled medication logs
const createScheduledMedicationLogs = async (prescription) => {
  const logs = [];
  const startDate = new Date();
  const endDate = new Date();

  // Calculate end date based on the longest medication duration
  const maxDuration = Math.max(
    ...prescription.medications.map((med) => parseInt(med.duration) || 30)
  );
  endDate.setDate(startDate.getDate() + maxDuration);

  for (const medication of prescription.medications) {
    if (
      medication.status === "active" &&
      medication.schedule &&
      medication.schedule.length > 0
    ) {
      const duration = parseInt(medication.duration) || 30;

      // Create logs for each day in the duration
      for (let dayOffset = 0; dayOffset < duration; dayOffset++) {
        const logDate = new Date(startDate);
        logDate.setDate(startDate.getDate() + dayOffset);

        // Create a log for each scheduled time of day
        for (const timeOfDay of medication.schedule) {
          const existingLog = await MedicationLog.findOne({
            prescriptionId: prescription._id,
            medicationName: medication.name,
            date: logDate.toISOString().split("T")[0],
            timeOfDay: timeOfDay,
          });

          // Only create if log doesn't already exist
          if (!existingLog) {
            const log = new MedicationLog({
              prescriptionId: prescription._id,
              patientId: prescription.patientId,
              doctorId: prescription.doctorId,
              medicationName: medication.name,
              dosage: parseInt(medication.dosage) || 0,
              date: logDate,
              timeOfDay: timeOfDay,
              status: "pending", // Set as pending initially
            });

            logs.push(log);
          }
        }
      }
    }
  }

  // Bulk insert all logs
  if (logs.length > 0) {
    await MedicationLog.insertMany(logs);
    console.log(`Created ${logs.length} scheduled medication logs`);
  }

  return logs;
};

export const createPrescription = asyncHandler(async (req, res) => {
  console.log("prescription data in controller:", req.body);
  const { title, patientId, medications } = req.body;
  const doctorId = req.user._id; // Assuming req.user is populated with authenticated user's info

  if (!title || !patientId || !medications || medications.length === 0) {
    throw new ApiError(400, "Title, Patient ID and medications are required");
  }

  const newPrescription = new Prescription({
    title,
    doctorId,
    patientId,
    medications,
  });

  const savedPrescription = await newPrescription.save();

  // Run ML ADR detection
  let adrAlerts = [];
  try {
    adrAlerts = await detectADR(patientId, medications);
  } catch (error) {
    console.error("Error in ADR detection:", error);
  }

  // Automatically create scheduled medication logs
  try {
    await createScheduledMedicationLogs(savedPrescription);
  } catch (error) {
    console.error("Error creating scheduled medication logs:", error);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { prescription: savedPrescription, adrAlerts },
        adrAlerts.length > 0 ? `Prescription created with ${adrAlerts.length} ADR warnings` : "Prescription created successfully"
      )
    );
});

export const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  console.log("patientId in server:", patientId);

  if (!patientId || patientId === 'undefined') {
    throw new ApiError(400, "Patient ID is required");
  }

  const prescriptions = await Prescription.find({ patientId }).sort({
    createdAt: -1,
  });
  console.log("patient prescriptions:", prescriptions);

  if (!prescriptions || prescriptions.length === 0) {
    return res
      .status(204)
      .json(
        new ApiResponse(204, null, "No prescriptions found for this patient")
      );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescriptions,
        "Prescriptions retrieved successfully"
      )
    );
});

export const getPrescriptionsByDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.user._id; // Assuming req.user is populated with authenticated user's info

  const prescriptions = await Prescription.find({ doctorId })
    .sort({
      createdAt: -1,
    })
    .populate("patientId", "name email gender fullname profilePic"); // Populate patient details

  if (!prescriptions || prescriptions.length === 0) {
    return res
      .status(204)
      .json(
        new ApiResponse(204, null, "No prescriptions found for this doctor")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescriptions,
        "Prescriptions retrieved successfully"
      )
    );
});

export const getLatestPrescription = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) {
    throw new ApiError(400, "Patient ID is required");
  }

  const latestPrescription = await Prescription.findOne({ patientId })
    .sort({ createdAt: -1 })
    .limit(1);

  if (!latestPrescription) {
    return res
      .status(204)
      .json(
        new ApiResponse(204, null, "No prescriptions found for this patient")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        latestPrescription,
        "Latest prescription retrieved successfully"
      )
    );
});

export const updatePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, medications, notes, status } = req.body;
  const doctorId = req.user._id;

  if (!id) {
    throw new ApiError(400, "Prescription ID is required");
  }

  const prescription = await Prescription.findById(id);
  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  // ✅ Authorization check
  if (prescription.doctorId.toString() !== doctorId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to update this prescription"
    );
  }

  // ✅ Update fields safely
  if (title) prescription.title = title;
  if (notes) prescription.notes = notes;
  if (medications) prescription.medications = medications;

  // ✅ If status changes, propagate to all medications inside prescription
  if (status) {
    prescription.status = status;

    // Update medication statuses too
    prescription.medications = prescription.medications.map((med) => ({
      ...med,
      status,
    }));
  }

  const updatedPrescription = await prescription.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPrescription,
        "Prescription updated successfully"
      )
    );
});

export const deletePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctorId = req.user._id; // Assuming req.user is populated with authenticated user's info

  if (!id) {
    throw new ApiError(400, "Prescription ID is required");
  }

  const prescription = await Prescription.findById(id);

  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  if (prescription.doctorId.toString() !== doctorId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this prescription"
    );
  }

  await prescription.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Prescription deleted successfully"));
});

export const getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Prescription ID is required");
  }

  const prescription = await Prescription.findById(id);

  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, prescription, "Prescription retrieved successfully")
    );
});

export const checkADR = asyncHandler(async (req, res) => {
  const { patientId, medications } = req.body;
  
  if (!patientId || !medications) {
    throw new ApiError(400, "Patient ID and medications are required");
  }
  
  const adrAlerts = await detectADR(patientId, medications);
  
  return res
    .status(200)
    .json(
      new ApiResponse(200, { adrAlerts }, "ADR check completed")
    );
});
