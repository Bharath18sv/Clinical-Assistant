import { asyncHandler } from "../utils/asyncHandler.js";
import { Prescription } from "../models/prescription.models.js";
import { MedicationLog } from "../models/medicationLogs.models.js";
import { Patient } from "../models/patient.models.js";
import { ADRAlert } from "../models/adrAlerts.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Import services correctly
import { ADRDetectionService } from "../services/adrDetectionService.js";
import { NotificationService } from "../services/notificationService.js";

import axios from "axios";

// ML-based ADR Detection
const detectADR = async (patientId, medications) => {
  try {
    const patient = await Patient.findById(patientId);
    console.log("Detecting ADR for the patient: ", patient?.fullname);
    if (!patient) return [];

    console.log("Running ml adr alert.....");
    const response = await axios.post(
      process.env.ADR_SERVICE_URL,
      {
        medications: medications,
        patient: {
          age: patient.age,
          allergies: patient.allergies || [],
          chronicConditions: patient.chronicConditions || [],
        },
      },
      { timeout: 5000 }
    );

    console.log("Response from ML ADR alert: ", response.data);

    if (response.data.success) {
      return response.data.interactions || [];
    }
    return [];
  } catch (error) {
    console.error("ML ADR service error:", error.message);
    return fallbackADRDetection(patientId, medications);
  }
};

const fallbackADRDetection = async (patientId, medications) => {
  const patient = await Patient.findById(patientId);
  if (!patient) return [];

  const adrAlerts = [];
  const allergySet = new Set(
    (patient.allergies || []).map((a) => a.toLowerCase())
  );

  for (const med of medications) {
    const medName = (med.name || "").toLowerCase();
    if (allergySet.has(medName)) {
      adrAlerts.push({
        type: "allergy",
        severity: "high",
        medications: [med.name],
        message: `Patient is allergic to ${med.name}`,
        recommendation: "Discontinue immediately",
      });
    }
  }
  return adrAlerts;
};

// Helper function to create ADR alert in database
const createADRAlert = async (patientId, doctorId, adrResults) => {
  try {
    const alert = new ADRAlert({
      patientId,
      doctorId,
      riskLevel: adrResults.riskLevel || "high",
      adrData: adrResults,
      status: "pending",
      createdAt: new Date(),
    });

    await alert.save();
    console.log("ADR alert created successfully");
    return alert;
  } catch (error) {
    console.error("Error creating ADR alert:", error);
    throw error;
  }
};

// Helper function to send ADR notifications
const sendADRNotifications = async (patientId, doctorId, adrResults) => {
  try {
    const [doctor, patient] = await Promise.all([
      ADRDetectionService.getDoctorInfo(doctorId),
      ADRDetectionService.getPatientInfo(patientId),
    ]);

    if (!doctor || !patient) {
      console.error("Doctor or patient not found for notifications");
      return;
    }

    const notificationData = {
      doctor,
      patient,
      adrResults,
      timestamp: new Date(),
    };

    // Send notifications via multiple channels
    await Promise.allSettled([
      NotificationService.sendEmailAlert(notificationData),
      NotificationService.sendSMSAlert(notificationData),
      NotificationService.sendWhatsAppAlert(notificationData),
    ]);

    console.log("ADR notifications sent successfully");
  } catch (error) {
    console.error("Failed to send ADR notifications:", error);
  }
};

// Helper function to create scheduled medication logs
export const createScheduledMedicationLogs = async (prescription) => {
  const logs = [];
  const startDate = new Date();

  // Calculate max duration from all medications
  const maxDuration = Math.max(
    ...prescription.medications.map((med) => parseInt(med.duration) || 30)
  );

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
  console.log("Prescription data in controller:", req.body);
  const { title, patientId, medications } = req.body;
  const doctorId = req.user._id;

  if (!title || !patientId || !medications || medications.length === 0) {
    throw new ApiError(400, "Title, Patient ID and medications are required");
  }

  // Create prescription
  const newPrescription = new Prescription({
    title,
    doctorId,
    patientId,
    medications,
  });

  const savedPrescription = await newPrescription.save();

  // Initialize ADR alerts array
  let adrAlerts = [];
  let adrResults = null;

  // Automatically create scheduled medication logs
  try {
    await createScheduledMedicationLogs(savedPrescription);
  } catch (error) {
    console.error("Error creating scheduled medication logs:", error);
  }

  // Run comprehensive ADR detection
  try {
    console.log("Running comprehensive ADR detection for new prescription...");

    // Use the imported ADRDetectionService
    adrResults = await ADRDetectionService.detectADR(patientId, medications);
    console.log(`ADR detection completed. Risk level: ${adrResults.riskLevel}`);

    // If high risk detected, create alert and send notifications
    if (
      adrResults.riskLevel === "high" ||
      adrResults.riskLevel === "moderate"
    ) {
      console.log(
        `${adrResults.riskLevel} risk ADR detected, creating alert and sending notifications...`
      );

      // Create ADR alert in database
      await createADRAlert(patientId, doctorId, adrResults);

      // Send notifications to doctor and patient
      await sendADRNotifications(patientId, doctorId, adrResults);

      adrAlerts = adrResults.interactions || [];
    }
  } catch (error) {
    console.error("ADR detection failed:", error);
    // Fallback to basic detection
    try {
      adrAlerts = await detectADR(patientId, medications);

      if (adrAlerts.length > 0) {
        // Create alerts for fallback detections too
        for (const alert of adrAlerts) {
          await createADRAlert(patientId, doctorId, {
            riskLevel: alert.severity || "moderate",
            interactions: [alert],
          });
        }
      }
    } catch (fallbackError) {
      console.error("Fallback ADR detection also failed:", fallbackError);
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        prescription: savedPrescription,
        adrAlerts,
        adrResults,
      },
      adrAlerts.length > 0
        ? `Prescription created with ${adrAlerts.length} ADR warning(s)`
        : "Prescription created successfully"
    )
  );
});

export const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req?.params;
  console.log("Prescription request:", req.params);
  console.log("PatientId in prescription:", patientId);

  if (!patientId || patientId === "undefined") {
    throw new ApiError(400, "Patient ID is required");
  }

  const prescriptions = await Prescription.find({ patientId }).sort({
    createdAt: -1,
  });
  console.log("Patient prescriptions:", prescriptions);

  if (!prescriptions || prescriptions.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "No prescriptions found for this patient")
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
  const doctorId = req.user._id;

  const prescriptions = await Prescription.find({ doctorId })
    .sort({ createdAt: -1 })
    .populate("patientId", "name email gender fullname profilePic");

  if (!prescriptions || prescriptions.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No prescriptions found for this doctor"));
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
      .status(200)
      .json(
        new ApiResponse(200, null, "No prescriptions found for this patient")
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

  // Authorization check
  if (prescription.doctorId.toString() !== doctorId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to update this prescription"
    );
  }

  // Update fields safely
  if (title) prescription.title = title;
  if (notes) prescription.notes = notes;

  // If medications are updated, run ADR detection
  if (medications) {
    prescription.medications = medications;

    try {
      console.log("Running ADR detection for prescription update...");
      const adrResults = await ADRDetectionService.detectADR(
        prescription.patientId,
        medications
      );

      // If high or moderate risk, create alerts
      if (
        adrResults.riskLevel === "high" ||
        adrResults.riskLevel === "moderate"
      ) {
        await createADRAlert(prescription.patientId, doctorId, adrResults);
        await sendADRNotifications(
          prescription.patientId,
          doctorId,
          adrResults
        );

        console.log(
          `ADR alert created for ${adrResults.riskLevel} risk during update`
        );
      }
    } catch (error) {
      console.error(
        "Error in ADR detection during prescription update:",
        error
      );
      // Try fallback detection
      try {
        const adrAlerts = await detectADR(prescription.patientId, medications);
        if (adrAlerts.length > 0) {
          for (const alert of adrAlerts) {
            await createADRAlert(prescription.patientId, doctorId, {
              riskLevel: alert.severity || "moderate",
              interactions: [alert],
            });
          }
        }
      } catch (fallbackError) {
        console.error("Fallback ADR detection failed:", fallbackError);
      }
    }
  }

  // If status changes, propagate to all medications inside prescription
  if (status) {
    prescription.status = status;

    // Update medication statuses too
    prescription.medications = prescription.medications.map((med) => ({
      ...med.toObject(),
      status:
        status === "cancelled"
          ? "discontinued"
          : status === "completed"
          ? "completed"
          : med.status,
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
  const doctorId = req.user._id;

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

  await prescription.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Prescription deleted successfully"));
});

export const getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Prescription ID is required");
  }

  const prescription = await Prescription.findById(id)
    .populate("patientId", "fullname email phone age gender")
    .populate("doctorId", "fullname email specialization");

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

  try {
    // Use the comprehensive ADR detection service
    const adrResults = await ADRDetectionService.detectADR(
      patientId,
      medications
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, adrResults, "ADR check completed successfully")
      );
  } catch (error) {
    console.error("ADR check failed, using fallback:", error);
    // Fallback to basic detection
    const adrAlerts = await detectADR(patientId, medications);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          riskLevel: adrAlerts.length > 0 ? "moderate" : "low",
          interactions: adrAlerts,
        },
        "ADR check completed (fallback mode)"
      )
    );
  }
});
