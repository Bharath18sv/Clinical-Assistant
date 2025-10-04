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

// =================
// PATIENT CONTROLLERS
// =================

/**
 * Patient adds medication log entry
 * POST /api/medication-logs
 * Auth: Patient
 */
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
