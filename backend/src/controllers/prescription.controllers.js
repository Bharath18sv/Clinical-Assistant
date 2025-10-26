import { asyncHandler } from "../utils/asyncHandler.js";
import { Prescription } from "../models/prescription.models.js";
import { MedicationLog } from "../models/medicationLogs.models.js";
import { Patient } from "../models/patient.models.js";
import { Doctor } from "../models/doctor.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import { Notification } from "../models/notification.model.js";
import { sendSMS } from "../utils/sms.js";
import { sendWhatsApp } from "../utils/whatsapp.js";
import { NotificationService } from "../services/notificationService.js";

// Helper function to get notification type based on severity
const getType = (severity) => {
  // All ADR-related notifications should use 'ADR_ALERT' type
  return "ADR_ALERT";
};

const detectADR = async (patientId, medications) => {
  const endpoint = process.env.ADR_SERVICE_URL;
  console.log("ADR service url: ", endpoint);
  try {
    const patient = await Patient.findById(patientId);
    console.log("Running adr for the patient: ", patient.fullname);
    if (!patient) return [];

    console.log("medications given : ", medications);

    const response = await axios.post(
      endpoint,
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

    console.log("Response from adr service : ", response.data);
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

// Helper function to format ADR data for notification service
const formatADRNotificationData = (doctor, patient, adrAlerts, medications) => {
  return {
    doctor: {
      email: doctor.email,
      phone: doctor.phone,
      fullname: doctor.fullname,
    },
    patient: {
      fullname: patient.fullname,
      email: patient.email,
      phone: patient.phone,
    },
    adrResults: {
      riskLevel: adrAlerts.some((a) => a.severity === "high")
        ? "high"
        : adrAlerts.some((a) => a.severity === "moderate")
        ? "moderate"
        : "low",
      timestamp: new Date(),
      checks: {
        drugInteractions: adrAlerts
          .filter((a) => a.type === "interaction")
          .map((alert) => ({
            medication1:
              alert.medications?.[0] || medications[0]?.name || "Unknown",
            medication2:
              alert.medications?.[1] || medications[1]?.name || "Unknown",
            description: alert.message,
            severity: alert.severity,
          })),
        allergyContraindications: adrAlerts
          .filter((a) => a.type === "allergy")
          .map((alert) => ({
            medication: alert.medications?.[0] || "Unknown",
            description: alert.message,
            severity: alert.severity,
          })),
        diseaseContraindications: adrAlerts
          .filter((a) => a.type === "disease" || a.type === "condition")
          .map((alert) => ({
            medication: alert.medications?.[0] || "Unknown",
            description: alert.message,
            severity: alert.severity,
          })),
      },
      recommendations: adrAlerts.map((alert) => ({
        priority: alert.severity,
        action: alert.recommendation || alert.message,
      })),
    },
  };
};

// Helper function to create scheduled medication logs
export const createScheduledMedicationLogs = async (prescription) => {
  const logs = [];
  const startDate = new Date();
  const endDate = new Date();

  const maxDuration = Math.max(
    ...prescription.medications.map((med) => parseInt(med.duration) || 30)
  );
  endDate.setDate(startDate.getDate() + maxDuration);

  for (const medication of prescription.medications) {
    if (medication.status === "active" && medication.schedule?.length > 0) {
      const duration = parseInt(medication.duration) || 30;

      for (let dayOffset = 0; dayOffset < duration; dayOffset++) {
        const logDate = new Date(startDate);
        logDate.setDate(startDate.getDate() + dayOffset);

        for (const timeOfDay of medication.schedule) {
          const existingLog = await MedicationLog.findOne({
            prescriptionId: prescription._id,
            medicationName: medication.name,
            date: logDate.toISOString().split("T")[0],
            timeOfDay: timeOfDay,
          });

          if (!existingLog) {
            const log = new MedicationLog({
              prescriptionId: prescription._id,
              patientId: prescription.patientId,
              doctorId: prescription.doctorId,
              medicationName: medication.name,
              dosage: parseInt(medication.dosage) || 0,
              date: logDate,
              timeOfDay: timeOfDay,
              status: "pending",
            });

            logs.push(log);
          }
        }
      }
    }
  }

  if (logs.length > 0) {
    await MedicationLog.insertMany(logs);
    console.log(`Created ${logs.length} scheduled medication logs`);
  }

  return logs;
};

// Create Prescription
export const createPrescription = asyncHandler(async (req, res) => {
  const { title, patientId, medications } = req.body;
  const doctorId = req.user._id;

  if (!title || !patientId || !medications?.length) {
    throw new ApiError(400, "Title, Patient ID and medications are required");
  }

  const newPrescription = new Prescription({
    title,
    doctorId,
    patientId,
    medications,
  });

  const savedPrescription = await newPrescription.save();

  let adrAlerts = [];
  try {
    adrAlerts = await detectADR(patientId, medications);

    if (adrAlerts.length > 0) {
      const hasHighSeverity = adrAlerts.some((a) => a.severity === "high");

      // Create notification with severity in title
      await Notification.create({
        userId: patientId,
        userType: "Patient",
        title: hasHighSeverity
          ? "🚨 CRITICAL: ADR Alert Detected"
          : "⚠️ ADR Warning",
        message: adrAlerts.map((a) => a.message).join("\n"),
        type: "ADR_ALERT",
        prescriptionId: savedPrescription._id,
        isRead: false,
      });
    }

    // If high severity ADR is detected, deactivate the prescription
    if (adrAlerts.some((alert) => alert.severity === "high")) {
      console.log("High severity ADR detected. Deactivating prescription...");

      // Mark prescription as cancelled
      savedPrescription.status = "cancelled";
      savedPrescription.medications = savedPrescription.medications.map(
        (med) => ({
          ...med,
          status: "discontinued",
        })
      );
      await savedPrescription.save();

      // Delete any pending medication logs
      await MedicationLog.deleteMany({
        prescriptionId: savedPrescription._id,
        status: "pending",
      });

      // Get patient and doctor details
      const patient = await Patient.findById(patientId);
      const doctor = await Doctor.findById(doctorId);

      // Send structured email alert using NotificationService
      if (doctor && patient) {
        try {
          const notificationData = formatADRNotificationData(
            doctor,
            patient,
            adrAlerts,
            medications
          );

          // Send email alert to doctor
          const emailResult = await NotificationService.sendEmailAlert(
            notificationData
          );
          console.log("Email alert result:", emailResult);

          // Optionally send SMS/WhatsApp alerts
          // await NotificationService.sendSMSAlert(notificationData);
          // await NotificationService.sendWhatsAppAlert(notificationData);
        } catch (error) {
          console.error("Failed to send ADR notifications:", error);
        }
      }
    } else {
      // Only create medication logs if no high-severity ADR is detected
      try {
        await createScheduledMedicationLogs(savedPrescription);
      } catch (error) {
        console.error("Error creating scheduled medication logs:", error);
      }
    }
  } catch (error) {
    console.error("Error in ADR detection:", error);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { prescription: savedPrescription, adrAlerts },
        adrAlerts.length > 0
          ? `Prescription created with ${adrAlerts.length} ADR warnings`
          : "Prescription created successfully"
      )
    );
});

// Get Prescriptions by Patient
export const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) throw new ApiError(400, "Patient ID is required");

  const prescriptions = await Prescription.find({ patientId })
    .sort({ createdAt: -1 })
    .populate("patientId", "fullname email gender profilePic")
    .populate("doctorId", "fullname email profilePic");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescriptions,
        prescriptions.length
          ? "Prescriptions retrieved successfully"
          : "No prescriptions found for this patient"
      )
    );
});

// Get Prescriptions by Doctor
export const getPrescriptionsByDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;

  const prescriptions = await Prescription.find({ doctorId })
    .sort({ createdAt: -1 })
    .populate("patientId", "fullname email gender profilePic");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescriptions,
        prescriptions.length
          ? "Prescriptions retrieved successfully"
          : "No prescriptions found for this doctor"
      )
    );
});

// Get Latest Prescription
export const getLatestPrescription = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  if (!patientId) throw new ApiError(400, "Patient ID is required");

  const latestPrescription = await Prescription.findOne({ patientId })
    .sort({ createdAt: -1 })
    .populate("patientId", "fullname email gender profilePic")
    .populate("doctorId", "fullname email profilePic");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        latestPrescription,
        latestPrescription
          ? "Latest prescription retrieved successfully"
          : "No prescriptions found for this patient"
      )
    );
});

// Update Prescription with ADR Detection
export const updatePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, medications, notes, status } = req.body;
  const doctorId = req.user._id;

  if (!id) throw new ApiError(400, "Prescription ID is required");

  const prescription = await Prescription.findById(id)
    .populate("patientId", "fullname email gender profilePic phone")
    .populate("doctorId", "fullname email profilePic phone");

  if (!prescription) throw new ApiError(404, "Prescription not found");

  // Authorization check (optional - uncomment if needed)
  // if (prescription.doctorId._id.toString() !== doctorId.toString()) {
  //   throw new ApiError(
  //     403,
  //     "You are not authorized to update this prescription"
  //   );
  // }

  // Track if medications were changed
  const medicationsChanged =
    medications &&
    JSON.stringify(prescription.medications) !== JSON.stringify(medications);

  // Update fields
  if (title) prescription.title = title;
  if (notes) prescription.notes = notes;
  if (medications) prescription.medications = medications;

  if (status) {
    prescription.status = status;
    prescription.medications = prescription.medications.map((med) => ({
      ...(med.toObject ? med.toObject() : med),
      status,
    }));
  }

  // Run ADR detection if medications were changed
  let adrAlerts = [];
  if (medicationsChanged) {
    console.log("Medications changed, running ADR detection...");

    try {
      adrAlerts = await detectADR(prescription.patientId._id, medications);

      console.log("adr alerts : ", adrAlerts);

      // Create notification if ADR alerts detected
      if (adrAlerts.length > 0) {
        const hasHighSeverity = adrAlerts.some((a) => a.severity === "high");

        // Notify the patient
        await Notification.create({
          userId: prescription.patientId._id,
          userType: "Patient",
          title: hasHighSeverity
            ? "🚨 CRITICAL: ADR Alert in Updated Prescription"
            : "⚠️ ADR Warning in Updated Prescription",
          message: adrAlerts.map((a) => a.message).join("\n"),
          type: "ADR_ALERT",
          prescriptionId: prescription._id,
          isRead: false,
        });

        // Also notify the doctor
        await Notification.create({
          userId: doctorId,
          userType: "Doctor",
          title: hasHighSeverity
            ? "🚨 CRITICAL ADR Alert - Action Required"
            : "⚠️ ADR Warning Detected",
          message: `Patient: ${prescription.patientId.fullname}\n\n${adrAlerts
            .map((a) => a.message)
            .join("\n")}`,
          type: "ADR_ALERT",
          prescriptionId: prescription._id,
          isRead: false,
        });
      }

      // If high severity ADR detected, cancel the prescription
      if (adrAlerts.some((alert) => alert.severity === "high")) {
        console.log(
          "High severity ADR detected during update. Cancelling prescription..."
        );

        prescription.status = "cancelled";
        prescription.medications = prescription.medications.map((med) => ({
          ...(med.toObject ? med.toObject() : med),
          status: "discontinued",
        }));

        // Delete pending medication logs
        await MedicationLog.deleteMany({
          prescriptionId: prescription._id,
          status: "pending",
        });

        // Get fresh doctor data (in case not populated)
        const doctor = prescription.doctorId.email
          ? prescription.doctorId
          : await Doctor.findById(doctorId);

        const patient = prescription.patientId;

        // Send structured email alert using NotificationService
        if (doctor && patient) {
          try {
            const notificationData = formatADRNotificationData(
              doctor,
              patient,
              adrAlerts,
              medications
            );

            // Send email alert to doctor
            const emailResult = await NotificationService.sendEmailAlert(
              notificationData
            );
            console.log("Email alert result:", emailResult);

            // Optionally send SMS/WhatsApp alerts
            // await NotificationService.sendSMSAlert(notificationData);
            // await NotificationService.sendWhatsAppAlert(notificationData);
          } catch (error) {
            console.error("Failed to send ADR notifications:", error);
          }
        }
      } else {
        // Recreate medication logs for updated medications
        try {
          // Delete old pending logs for this prescription
          await MedicationLog.deleteMany({
            prescriptionId: prescription._id,
            status: "pending",
          });

          // Create new scheduled logs
          await createScheduledMedicationLogs(prescription);
        } catch (error) {
          console.error("Error updating scheduled medication logs:", error);
        }
      }
    } catch (error) {
      console.error("Error in ADR detection during update:", error);
      // Don't throw error, just log it and continue
    }
  }

  const updatedPrescription = await prescription.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        prescription: updatedPrescription,
        adrAlerts,
      },
      adrAlerts.length > 0
        ? `Prescription updated with ${adrAlerts.length} ADR warning(s)`
        : "Prescription updated successfully"
    )
  );
});

// Delete Prescription
export const deletePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctorId = req.user._id;

  if (!id) throw new ApiError(400, "Prescription ID is required");

  const prescription = await Prescription.findById(id);

  if (!prescription) throw new ApiError(404, "Prescription not found");

  if (prescription.doctorId.toString() !== doctorId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this prescription"
    );
  }

  // Delete associated medication logs
  await MedicationLog.deleteMany({ prescriptionId: id });

  // Delete prescription safely
  await Prescription.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Prescription deleted successfully"));
});

// Get Prescription by ID
export const getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Prescription ID is required");

  const prescription = await Prescription.findById(id);
  if (!prescription) throw new ApiError(404, "Prescription not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, prescription, "Prescription retrieved successfully")
    );
});

// ADR Check
export const checkADR = asyncHandler(async (req, res) => {
  const { patientId, medications } = req.body;
  if (!patientId || !medications)
    throw new ApiError(400, "Patient ID and medications are required");

  const adrAlerts = await detectADR(patientId, medications);

  return res
    .status(200)
    .json(new ApiResponse(200, { adrAlerts }, "ADR check completed"));
});
