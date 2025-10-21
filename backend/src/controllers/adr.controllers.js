import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ADRDetectionService } from "../services/adrDetectionService.js";
import { NotificationService } from "../services/notificationService.js";
import { ADRAlert } from "../models/adrAlerts.models.js";

/**
 * Check ADR for a specific patient
 */
export const checkPatientADR = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { medications } = req.body; // Optional: new medications to check

  if (!patientId) {
    throw new ApiError(400, "Patient ID is required");
  }

  try {
    const adrResults = await ADRDetectionService.detectADR(
      patientId,
      medications || []
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, adrResults, "ADR analysis completed successfully")
      );
  } catch (error) {
    throw new ApiError(500, `ADR detection failed: ${error.message}`);
  }
});

/**
 * Check ADR for new prescription
 */
export const checkPrescriptionADR = asyncHandler(async (req, res) => {
  const { patientId, medications } = req.body;
  const doctorId = req.user._id;

  if (!patientId || !medications || medications.length === 0) {
    throw new ApiError(400, "Patient ID and medications are required");
  }

  try {
    const adrResults = await ADRDetectionService.detectADR(
      patientId,
      medications
    );

    // If high risk, create alert and send notifications
    if (adrResults.riskLevel === "high") {
      await createADRAlert(patientId, doctorId, adrResults);
      await sendADRNotifications(patientId, doctorId, adrResults);
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, adrResults, "Prescription ADR analysis completed")
      );
  } catch (error) {
    throw new ApiError(500, `Prescription ADR check failed: ${error.message}`);
  }
});

/**
 * Get ADR alerts for a doctor
 */
export const getDoctorADRAlerts = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  const { status, limit = 20, page = 1 } = req.query;

  const query = { doctorId };
  if (status) {
    query.status = status;
  }

  const alerts = await ADRAlert.find(query)
    .populate("patientId", "fullname email phone")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ADRAlert.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        alerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAlerts: total,
        },
      },
      "ADR alerts retrieved successfully"
    )
  );
});

/**
 * Update ADR alert status
 */
export const updateADRAlertStatus = asyncHandler(async (req, res) => {
  const { alertId } = req.params;
  const { status, notes } = req.body;
  const doctorId = req.user._id;

  if (!alertId) {
    throw new ApiError(400, "Alert ID is required");
  }

  const alert = await ADRAlert.findById(alertId);
  if (!alert) {
    throw new ApiError(404, "ADR alert not found");
  }

  if (alert.doctorId.toString() !== doctorId.toString()) {
    throw new ApiError(403, "Not authorized to update this alert");
  }

  alert.status = status || alert.status;
  alert.doctorNotes = notes || alert.doctorNotes;
  alert.updatedAt = new Date();

  await alert.save();

  res
    .status(200)
    .json(new ApiResponse(200, alert, "ADR alert updated successfully"));
});

/**
 * Get ADR statistics for dashboard
 */
export const getADRStatistics = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const stats = await ADRAlert.aggregate([
    { $match: { doctorId: doctorId } },
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        highRiskAlerts: {
          $sum: { $cond: [{ $eq: ["$riskLevel", "high"] }, 1, 0] },
        },
        moderateRiskAlerts: {
          $sum: { $cond: [{ $eq: ["$riskLevel", "moderate"] }, 1, 0] },
        },
        resolvedAlerts: {
          $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
        },
        recentAlerts: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0],
          },
        },
      },
    },
  ]);

  const result = stats[0] || {
    totalAlerts: 0,
    highRiskAlerts: 0,
    moderateRiskAlerts: 0,
    resolvedAlerts: 0,
    recentAlerts: 0,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "ADR statistics retrieved successfully")
    );
});

// Helper functions
async function createADRAlert(patientId, doctorId, adrResults) {
  const alert = new ADRAlert({
    patientId,
    doctorId,
    riskLevel: adrResults.riskLevel,
    adrData: adrResults,
    status: "pending",
    createdAt: new Date(),
  });

  return await alert.save();
}

async function sendADRNotifications(patientId, doctorId, adrResults) {
  try {
    const [doctor, patient] = await Promise.all([
      ADRDetectionService.getDoctorInfo(doctorId),
      ADRDetectionService.getPatientInfo(patientId),
    ]);

    if (!doctor || !patient) {
      throw new Error("Doctor or patient not found");
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
  } catch (error) {
    console.error("Failed to send ADR notifications:", error);
  }
}
