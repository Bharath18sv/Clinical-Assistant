//patient adds medication log
//doctor view medication logs from their patients
//admin view all medication logs from all patients
//patient view their medication logs
//filter medication logs by date range, medication name and status (taken, missed, etc.)

import { MedicationLog } from "../models/medicationLogs.models.js";
import { Prescription } from "../models/prescription.models.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addMedicationLog = async (req, res) => {
  try {
    const {
      prescriptionId,
      medicationName,
      date,
      timeOfDay,
      status,
      notes,
      sideEffects,
    } = req.body;

    // Verify prescription belongs to the patient
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not your prescription",
      });
    }

    // Find the specific medication in the prescription
    const medication = prescription.medications.find(
      (med) => med.name === medicationName
    );
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found in prescription",
      });
    }

    // Check if log already exists for this date and time
    const existingLog = await MedicationLog.findOne({
      prescriptionId,
      medicationName,
      date: new Date(date).toISOString().split("T")[0],
      timeOfDay,
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: "Log entry already exists for this medication at this time",
      });
    }

    const medicationLog = new MedicationLog({
      prescriptionId,
      patientId: req.user.id,
      doctorId: prescription.doctorId,
      medicationName,
      dosage: medication.dosage,
      date: new Date(date),
      timeOfDay,
      status,
      takenAt: status === "taken" ? new Date() : null,
      notes,
      sideEffects,
    });

    await medicationLog.save();

    res.status(201).json({
      success: true,
      message: "Medication log added successfully",
      data: medicationLog,
    });
  } catch (error) {
    console.error("Add medication log error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createMedicationLog = async (req, res) => {
  try {
    const { prescriptionId, medicationName, timeOfDay } = req.body;

    const date = new Date().toISOString().split("T")[0];

    // Verify prescription belongs to the patient
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not your prescription",
      });
    }

    // Find the specific medication in the prescription
    const medication = prescription.medications.find(
      (med) => med.name === medicationName
    );
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found in prescription",
      });
    }

    // Check if log already exists for this date and time
    const existingLog = await MedicationLog.findOne({
      prescriptionId,
      medicationName,
      date: new Date(date).toISOString().split("T")[0],
      timeOfDay,
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: "Log entry already exists for this medication at this time",
      });
    }

    const medicationLog = new MedicationLog({
      prescriptionId,
      patientId: req.user.id,
      doctorId: prescription.doctorId,
      medicationName,
      dosage: medication.dosage,
      date: new Date(date),
      timeOfDay,
      status: "pending",
      takenAt: null,
      notes: null,
      sideEffects: null,
    });

    await medicationLog.save();

    res.status(201).json({
      success: true,
      message: "Medication log added successfully",
      data: medicationLog,
    });
  } catch (error) {
    console.error("Add medication log error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Patient views their pending medication logs (for today and upcoming)
 * GET /api/medication-logs/patient/pending
 * Auth: Patient
 */
export const getPatientPendingMedicationLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get pending logs for today and future dates
    const filter = {
      patientId: req.user.id,
      status: "pending",
      date: { $gte: today },
    };

    const skip = (page - 1) * limit;

    const logs = await MedicationLog.find(filter)
      .populate("prescriptionId", "title status")
      .sort({ date: 1, timeOfDay: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await MedicationLog.countDocuments(filter);

    // Group logs by date for better organization
    const logsByDate = {};
    logs.forEach((log) => {
      const dateKey = log.date.toISOString().split("T")[0];
      if (!logsByDate[dateKey]) {
        logsByDate[dateKey] = [];
      }
      logsByDate[dateKey].push(log);
    });

    res.json({
      success: true,
      data: {
        logs,
        logsByDate,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalLogs / limit),
          totalLogs,
          hasNextPage: page < Math.ceil(totalLogs / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get patient pending medication logs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Patient updates medication log status
 * PUT /api/medication-logs/:id/status
 * Auth: Patient
 */
export const updateMedicationLogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, sideEffects } = req.body;

    if (!status || !["taken", "missed", "skipped"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status (taken, missed, skipped) is required",
      });
    }

    const log = await MedicationLog.findById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Medication log not found",
      });
    }

    // Verify ownership
    if (log.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not your medication log",
      });
    }

    // Update the log
    log.status = status;
    log.takenAt = status === "taken" ? new Date() : null;
    if (notes !== undefined) log.notes = notes;
    if (sideEffects !== undefined) log.sideEffects = sideEffects;

    await log.save();

    res.json({
      success: true,
      message: "Medication log updated successfully",
      data: log,
    });
  } catch (error) {
    console.error("Update medication log status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Patient views their medication logs
 * GET /api/medication-logs/patient
 * Auth: Patient
 */
export const getPatientMedicationLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      medicationName,
      status,
      timeOfDay,
    } = req.query;

    // Build filter query
    const filter = { patientId: req.user.id };

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Additional filters
    if (medicationName) {
      filter.medicationName = { $regex: medicationName, $options: "i" };
    }
    if (status) filter.status = status;
    if (timeOfDay) filter.timeOfDay = timeOfDay;

    const skip = (page - 1) * limit;

    const logs = await MedicationLog.find(filter)
      .populate("prescriptionId", "title status")
      .sort({ date: -1, timeOfDay: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await MedicationLog.countDocuments(filter);

    // Calculate adherence statistics
    const adherenceStats = await MedicationLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = adherenceStats.reduce(
      (acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      },
      { taken: 0, missed: 0, skipped: 0 }
    );

    const totalEntries = Object.values(stats).reduce(
      (sum, count) => sum + count,
      0
    );
    const adherenceRate =
      totalEntries > 0 ? ((stats.taken / totalEntries) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalLogs / limit),
          totalLogs,
          hasNextPage: page < Math.ceil(totalLogs / limit),
          hasPrevPage: page > 1,
        },
        adherenceStats: {
          ...stats,
          adherenceRate: parseFloat(adherenceRate),
        },
      },
    });
  } catch (error) {
    console.error("Get patient medication logs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =================
// DOCTOR CONTROLLERS
// =================

/**
 * Doctor views medication logs from their patients
 * GET /api/medication-logs/doctor
 * Auth: Doctor
 */
export const getDoctorPatientMedicationLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      patientId,
      startDate,
      endDate,
      medicationName,
      status,
      timeOfDay,
    } = req.query;

    // Build filter query
    const filter = { doctorId: req.user.id };

    // Patient filter
    if (patientId) filter.patientId = patientId;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Additional filters
    if (medicationName) {
      filter.medicationName = { $regex: medicationName, $options: "i" };
    }
    if (status) filter.status = status;
    if (timeOfDay) filter.timeOfDay = timeOfDay;

    const skip = (page - 1) * limit;

    const logs = await MedicationLog.find(filter)
      .populate("patientId", "fullname profilePic email phoneNumber")
      .populate("prescriptionId", "title status")
      .sort({ date: -1, timeOfDay: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await MedicationLog.countDocuments(filter);

    // Get patient adherence summary
    const patientAdherence = await MedicationLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            patientId: "$patientId",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.patientId",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          totalEntries: { $sum: "$count" },
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $project: {
          patient: { $arrayElemAt: ["$patient", 0] },
          statusCounts: 1,
          totalEntries: 1,
          adherenceRate: {
            $multiply: [
              {
                $divide: [
                  {
                    $sum: {
                      $map: {
                        input: "$statusCounts",
                        as: "status",
                        in: {
                          $cond: [
                            { $eq: ["$$status.status", "taken"] },
                            "$$status.count",
                            0,
                          ],
                        },
                      },
                    },
                  },
                  "$totalEntries",
                ],
              },
              100,
            ],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalLogs / limit),
          totalLogs,
          hasNextPage: page < Math.ceil(totalLogs / limit),
          hasPrevPage: page > 1,
        },
        patientAdherence: patientAdherence.map((patient) => ({
          patientId: patient._id,
          patientName: `${patient.patient.firstName} ${patient.patient.lastName}`,
          totalEntries: patient.totalEntries,
          adherenceRate: Math.round(patient.adherenceRate * 10) / 10,
          statusBreakdown: patient.statusCounts.reduce(
            (acc, status) => {
              acc[status.status] = status.count;
              return acc;
            },
            { taken: 0, missed: 0, skipped: 0 }
          ),
        })),
      },
    });
  } catch (error) {
    console.error("Get doctor patient medication logs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Doctor views specific patient's medication logs
 * GET /api/medication-logs/doctor/patient/:patientId
 * Auth: Doctor
 */
export const getSpecificPatientMedicationLogs = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      medicationName,
      status,
    } = req.query;

    // Verify doctor has access to this patient
    const hasAccess = await Prescription.findOne({
      patientId,
      doctorId: req.user.id,
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Patient not under your care",
      });
    }

    // Build filter query
    const filter = {
      patientId: new mongoose.Types.ObjectId(patientId),
      doctorId: req.user.id,
    };

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Additional filters
    if (medicationName) {
      filter.medicationName = { $regex: medicationName, $options: "i" };
    }
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const logs = await MedicationLog.find(filter)
      .populate("patientId", "firstName lastName")
      .populate("prescriptionId", "title status")
      .sort({ date: -1, timeOfDay: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await MedicationLog.countDocuments(filter);

    // Detailed adherence analysis
    const adherenceAnalysis = await MedicationLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            medicationName: "$medicationName",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.medicationName",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          totalEntries: { $sum: "$count" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalLogs / limit),
          totalLogs,
          hasNextPage: page < Math.ceil(totalLogs / limit),
          hasPrevPage: page > 1,
        },
        medicationAdherence: adherenceAnalysis.map((med) => {
          const statusBreakdown = med.statusCounts.reduce(
            (acc, status) => {
              acc[status.status] = status.count;
              return acc;
            },
            { taken: 0, missed: 0, skipped: 0 }
          );

          const adherenceRate =
            med.totalEntries > 0
              ? ((statusBreakdown.taken / med.totalEntries) * 100).toFixed(1)
              : 0;

          return {
            medicationName: med._id,
            totalEntries: med.totalEntries,
            adherenceRate: parseFloat(adherenceRate),
            statusBreakdown,
          };
        }),
      },
    });
  } catch (error) {
    console.error("Get specific patient medication logs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =================
// ADMIN CONTROLLERS
// =================

/**
 * Admin views all medication logs from all patients
 * GET /api/medication-logs/admin
 * Auth: Admin
 */
export const getAllMedicationLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      patientId,
      doctorId,
      startDate,
      endDate,
      medicationName,
      status,
      timeOfDay,
    } = req.query;

    // Build filter query
    const filter = {};

    // ID filters
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Additional filters
    if (medicationName) {
      filter.medicationName = { $regex: medicationName, $options: "i" };
    }
    if (status) filter.status = status;
    if (timeOfDay) filter.timeOfDay = timeOfDay;

    const skip = (page - 1) * limit;

    const logs = await MedicationLog.find(filter)
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName email")
      .populate("prescriptionId", "title status")
      .sort({ date: -1, timeOfDay: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await MedicationLog.countDocuments(filter);

    // System-wide statistics
    const systemStats = await MedicationLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          takenCount: {
            $sum: { $cond: [{ $eq: ["$status", "taken"] }, 1, 0] },
          },
          missedCount: {
            $sum: { $cond: [{ $eq: ["$status", "missed"] }, 1, 0] },
          },
          skippedCount: {
            $sum: { $cond: [{ $eq: ["$status", "skipped"] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = systemStats[0] || {
      totalLogs: 0,
      takenCount: 0,
      missedCount: 0,
      skippedCount: 0,
    };

    const systemAdherenceRate =
      stats.totalLogs > 0
        ? ((stats.takenCount / stats.totalLogs) * 100).toFixed(1)
        : 0;

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalLogs / limit),
          totalLogs,
          hasNextPage: page < Math.ceil(totalLogs / limit),
          hasPrevPage: page > 1,
        },
        systemStats: {
          ...stats,
          systemAdherenceRate: parseFloat(systemAdherenceRate),
        },
      },
    });
  } catch (error) {
    console.error("Get all medication logs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =================
// SHARED UTILITIES
// =================

/**
 * Update medication log entry
 * PUT /api/medication-logs/:id
 * Auth: Patient (own logs only)
 */
export const updateMedicationLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, sideEffects, takenAt } = req.body;

    const log = await MedicationLog.findById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Medication log not found",
      });
    }

    // Verify ownership (patients can only update their own logs)
    if (
      req.user.role === "patient" &&
      log.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update fields
    if (status) {
      log.status = status;
      if (status === "taken" && !log.takenAt) {
        log.takenAt = takenAt ? new Date(takenAt) : new Date();
      } else if (status !== "taken") {
        log.takenAt = null;
      }
    }
    if (notes !== undefined) log.notes = notes;
    if (sideEffects !== undefined) log.sideEffects = sideEffects;

    await log.save();

    res.json({
      success: true,
      message: "Medication log updated successfully",
      data: log,
    });
  } catch (error) {
    console.error("Update medication log error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete medication log entry
 * DELETE /api/medication-logs/:id
 * Auth: Patient (own logs only) or Admin
 */
export const deleteMedicationLog = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await MedicationLog.findById(id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Medication log not found",
      });
    }

    // Verify ownership/permission
    if (
      req.user.role === "patient" &&
      log.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await MedicationLog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Medication log deleted successfully",
    });
  } catch (error) {
    console.error("Delete medication log error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllMedicationLogByPrescription = async (req, res) => {
  const { prescriptionId } = req.params;
  // console.log("prescriptionId in service:", prescriptionId);
  try {
    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      throw new Error("Invalid prescription ID");
    }

    const logs = await MedicationLog.find({ prescriptionId }).sort({
      date: -1,
      timeOfDay: 1,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, logs, "Logs fetched successfully"));
  } catch (error) {
    console.error("Get medication logs by prescription error:", error);
    throw error;
  }
};

export const getMedicationLogById = async (logId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      throw new Error("Invalid log ID");
    }

    const log = await MedicationLog.findById(logId);
    return log;
  } catch (error) {
    console.error("Get medication log by ID error:", error);
    throw error;
  }
};

/**
 * Update medication log status directly from email (public endpoint)
 * GET /api/medication-logs/email-update
 * No auth required - secured with unique token
 */
export const updateMedicationLogFromEmail = async (req, res) => {
  try {
    const { prescriptionId, medicationName, timeOfDay, date, status, token } =
      req.query;

    // Decode the medication name in case it was URL encoded
    const decodedMedicationName = medicationName
      ? decodeURIComponent(medicationName)
      : medicationName;

    // Log the received parameters for debugging
    console.log("Received parameters:", {
      prescriptionId,
      medicationName: decodedMedicationName,
      timeOfDay,
      date,
      status,
      token,
    });

    // Validate required parameters
    if (
      !prescriptionId ||
      !decodedMedicationName ||
      !timeOfDay ||
      !date ||
      !status ||
      !token
    ) {
      console.log("Missing required parameters");
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Request</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #f44336; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">⚠ Invalid Request</h1>
            <p>Missing required parameters. Please make sure you clicked a valid medication log button.</p>
            <a href="${
              process.env.FRONTEND_URL ||
              process.env.APP_URL ||
              "http://localhost:3000"
            }" class="button">Return to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Validate status
    if (!["taken", "missed", "skipped"].includes(status)) {
      console.log("Invalid status:", status);
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Status</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #f44336; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">⚠ Invalid Status</h1>
            <p>Invalid status value. Must be 'taken', 'missed', or 'skipped'.</p>
            <a href="${
              process.env.FRONTEND_URL ||
              process.env.APP_URL ||
              "http://localhost:3000"
            }" class="button">Return to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Parse the date - handle different formats and use consistent format
    let logDate;
    try {
      logDate = new Date(date);
      if (isNaN(logDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (dateError) {
      console.error("Date parsing error:", dateError);
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Date</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #f44336; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">⚠ Invalid Date Format</h1>
            <p>The date format in the link is invalid. Please try updating your medication status from your dashboard.</p>
            <a href="${
              process.env.FRONTEND_URL ||
              process.env.APP_URL ||
              "http://localhost:3000"
            }" class="button">Return to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Create a date range for the query to handle timezone differences
    const targetDate = new Date(logDate);
    targetDate.setHours(0, 0, 0, 0);

    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Query for the medication log using a date range to handle timezone differences
    const log = await MedicationLog.findOne({
      prescriptionId,
      medicationName: decodedMedicationName,
      timeOfDay,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!log) {
      // Let's also try a more general query to see what logs exist
      const allLogs = await MedicationLog.find({
        prescriptionId,
        medicationName: decodedMedicationName,
      }).select("prescriptionId medicationName timeOfDay date status");

      console.log("All logs for this prescription and medication:", allLogs);

      // Also try querying without the date to see if we can find any logs at all
      const allLogsAnyDate = await MedicationLog.find({
        prescriptionId,
        medicationName: decodedMedicationName,
        timeOfDay,
      }).select("prescriptionId medicationName timeOfDay date status");

      console.log(
        "All logs for this prescription, medication, and timeOfDay:",
        allLogsAnyDate
      );

      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Log Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #f44336; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">⚠ Medication Log Not Found</h1>
            <p>We couldn't find the medication log you're trying to update. It may have already been updated or the link may be expired.</p>
            <p><small>Debug info: Looking for ${decodedMedicationName} at ${timeOfDay} on ${logDate.toDateString()}</small></p>
            <a href="${
              process.env.FRONTEND_URL ||
              process.env.APP_URL ||
              "http://localhost:3000"
            }" class="button">Return to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Generate a token based on the same parameters used in the email template and verify it matches
    // Use the same date format as in the email template
    const dateForToken = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD format
    const crypto = await import("crypto");
    const baseString = `${prescriptionId}${decodedMedicationName}${timeOfDay}${dateForToken}`;
    const expectedToken = crypto
      .createHash("sha256")
      .update(`${baseString}${status}${process.env.JWT_SECRET}`)
      .digest("hex");

    if (token !== expectedToken) {
      console.log(
        "Token mismatch. Expected:",
        expectedToken,
        "Received:",
        token
      );
      console.log("Parameters used for token generation:", {
        prescriptionId,
        medicationName: decodedMedicationName,
        timeOfDay,
        dateForToken,
        status,
      });
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Token</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #f44336; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">⚠ Invalid Token</h1>
            <p>This link is invalid or has expired. Please try updating your medication status from your dashboard.</p>
            <a href="${
              process.env.FRONTEND_URL ||
              process.env.APP_URL ||
              "http://localhost:3000"
            }" class="button">Return to Dashboard</a>
          </div>
        </body>
        </html>
      `);
    }

    // Update the log
    log.status = status;
    log.takenAt = status === "taken" ? new Date() : null;

    await log.save();

    // Return HTML response
    res.set("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medication Status Updated</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .success { color: #4CAF50; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">✓ Medication Status Updated</h1>
          <p>Your medication "<strong>${decodedMedicationName}</strong>" for <strong>${timeOfDay}</strong> on <strong>${logDate.toLocaleDateString()}</strong> has been marked as <strong>${status}</strong>.</p>
          <p>Thank you for keeping your medication log up to date!</p>
          <a href="${
            process.env.FRONTEND_URL ||
            process.env.APP_URL ||
            "http://localhost:3000"
          }" class="button">Return to Dashboard</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Update medication log from email error:", error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #f44336; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">⚠ System Error</h1>
          <p>An error occurred while updating your medication status. Please try again later or update from your dashboard.</p>
          <p><small>Error: ${error.message}</small></p>
          <a href="${
            process.env.FRONTEND_URL ||
            process.env.APP_URL ||
            "http://localhost:3000"
          }" class="button">Return to Dashboard</a>
        </div>
      </body>
      </html>
    `);
  }
};
