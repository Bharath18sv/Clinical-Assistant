import { asyncHandler } from "../utils/asyncHandler.js";
import { Prescription } from "../models/prescription.models.js";
import { MedicationLog } from "../models/medicationLogs.models.js";
import { Patient } from "../models/patient.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import { Notification } from "../models/notification.model.js";
import { NotificationService } from "../services/notificationService.js";
import { Doctor } from "../models/doctor.models.js";

// Helper function to get notification type based on severity
const getNotificationType = (severity) => {
  // All ADR-related notifications should use 'ADR_ALERT' type
  return "ADR_ALERT";
};

// ML-based ADR Detection
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

      // Also send immediate email/SMS/whatsapp alerts to doctor (and optionally patient)
      try {
        const [doctor, patient] = await Promise.all([
          Doctor.findById(doctorId).select("fullname email phone"),
          Patient.findById(patientId).select("fullname email phone"),
        ]);

        if (doctor && patient) {
          const notificationData = {
            doctor,
            patient,
            adrResults,
            timestamp: new Date(),
          };
          await NotificationService.sendGeneralNotification(notificationData);
        } else {
          console.warn(
            "Doctor or patient not found - skipping immediate ADR notifications"
          );
        }
      } catch (err) {
        console.error("Error sending immediate ADR notifications:", err);
      }
    }

    // If high severity ADR is detected, deactivate the prescription
    if (adrAlerts.some((alert) => alert.severity === "high")) {
      console.log("High severity ADR detected. Deactivating prescription...");

      // Mark prescription as cancelled
      savedPrescription.status = "cancelled";
      savedPrescription.medications = savedPrescription.medications.map(
        (med) => ({
          ...med,
          status: "discontinued", // Use 'discontinued' instead of 'cancelled'
        })
      );
      await savedPrescription.save();

      // Delete any pending medication logs
      await MedicationLog.deleteMany({
        prescriptionId: savedPrescription._id,
        status: "pending",
      });

      // Send immediate notification
      const patient = await Patient.findById(patientId);

      // Note: Uncomment if you have Doctor model and sendEmail function
      // const doctor = await Doctor.findById(doctorId);
      // const emailSubject = "URGENT: Prescription Cancelled Due to ADR Risk";
      // const emailBody = `A prescription has been automatically cancelled due to detected adverse drug reaction risks.
      //   \nPrescription Details:
      //   \nTitle: ${savedPrescription.title}
      //   \nMedications: ${medications.map((med) => med.name).join(", ")}
      //   \nReason: ${adrAlerts.map((alert) => alert.message).join("\n")}
      //   \n\nPlease contact your healthcare provider immediately.`;

      // if (patient.email) {
      //   await sendEmail(patient.email, emailSubject, emailBody);
      // }
      // if (doctor.email) {
      //   await sendEmail(doctor.email, emailSubject, emailBody);
      // }
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
    .populate("patientId", "fullname email gender profilePic")
    .populate("doctorId", "fullname email profilePic");

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

        // Send immediate multi-channel notifications to the doctor (and patient)
        try {
          const doctor = await Doctor.findById(doctorId).select(
            "fullname email phone"
          );
          const patient = prescription.patientId; // populated earlier

          if (doctor && patient) {
            const notificationData = {
              doctor,
              patient,
              adrAlerts,
              timestamp: new Date(),
            };
            await NotificationService.sendGeneralNotification(notificationData);
          } else {
            console.warn(
              "Doctor or patient missing for update flow - skipping ADR delivery"
            );
          }
        } catch (err) {
          console.error(
            "Failed to send ADR notifications during prescription update:",
            err
          );
        }
      }

      // If high severity ADR detected, cancel the prescription
      if (adrAlerts.some((alert) => alert.severity === "high")) {
        console.log(
          "High severity ADR detected during update. Cancelling prescription..."
        );

        prescription.status = "cancelled";
        prescription.medications = prescription.medications.map((med) => ({
          ...(med.toObject ? med.toObject() : med),
          status: "discontinued", // Use 'discontinued' instead of 'cancelled'
        }));

        // Delete pending medication logs
        await MedicationLog.deleteMany({
          prescriptionId: prescription._id,
          status: "pending",
        });

        // Send email notifications (uncomment if you have sendEmail function)
        // const emailSubject =
        //   "URGENT: Prescription Cancelled Due to ADR Risk (Updated)";
        // const emailBody = `A prescription update has been automatically cancelled due to detected adverse drug reaction risks.
        //   \nPrescription Details:
        //   \nTitle: ${prescription.title}
        //   \nMedications: ${medications.map((med) => med.name).join(", ")}
        //   \nReason: ${adrAlerts.map((alert) => alert.message).join("\n")}
        //   \n\nPlease contact your healthcare provider immediately.`;

        // if (prescription.patientId.email) {
        //   await sendEmail(
        //     prescription.patientId.email,
        //     emailSubject,
        //     emailBody
        //   );
        // }
        // if (prescription.doctorId.email) {
        //   await sendEmail(prescription.doctorId.email, emailSubject, emailBody);
        // }
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
