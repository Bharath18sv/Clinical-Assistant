import { asyncHandler } from "../utils/asyncHandler.js";
<<<<<<< HEAD
import { ApiResponse } from "../utils/ApiResponse.js";
import { Appointment } from "../models/appointments.models.js";
import { Patient } from "../models/patient.models.js";
=======
import { Appointment } from "../models/appointments.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
>>>>>>> upstream/main

// Patient self-book or general creation endpoint
const createAppointment = asyncHandler(async (req, res) => {
  const requesterId = req.user?._id;
  const requesterRole = req.user?.role || req.user?.__t; // role derived from token middleware context
  const { doctorId, patientId, scheduledAt, reason } = req.body;

  // Determine patientId: if patient user, default to their id
  const resolvedPatientId = patientId || requesterId;
  if (!doctorId || !resolvedPatientId) {
    throw new ApiError(400, "doctorId and patientId are required");
  }

  const appt = await Appointment.create({
    doctorId,
    patientId: resolvedPatientId,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
    reason: reason || "",
    status: "pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, appt, "Appointment created successfully"));
});

//check this later
const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { scheduledAt, reason, status } = req.body;
  const appt = await Appointment.findByIdAndUpdate(
    id,
    { $set: { scheduledAt, reason, status } },
    { new: true }
  );
  if (!appt) throw new ApiError(404, "Appointment not found");
  return res
    .status(200)
    .json(new ApiResponse(200, appt, "Appointment updated successfully"));
});

const getUserAppointments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const appointments = await Appointment.find({
    $or: [{ doctorId: userId }, { patientId: userId }],
  })
    .populate("doctorId", "fullname email phone address specialization")
    .populate("patientId", "fullname email phone address")
    .sort({ scheduledAt: -1 });

  if (!appointments || appointments.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No appointments found for this user"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        "All User appointments fetched successfully"
      )
    );
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id)
    .populate("doctorId", "fullname email phone address specialization")
    .populate("patientId", "fullname email phone address");

  if (!appointment) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Appointment not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment fetched successfully")
    );
});

//admin only
const getAllAppointments = asyncHandler(async (req, res) => {
  const allAppointments = await Appointment.find()
    .populate("doctorId", "fullname email phone")
    .populate("patientId", "fullname email phone");
  if (!allAppointments || allAppointments.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No appointments found"));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allAppointments,
        "All appointments fetched successfully"
      )
    );
});

const activeAppointments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const appointments = await Appointment.find({
    doctorId: userId,
    status: "active",
  })
    .populate("patientId", "fullname email phone")
    .sort({ scheduledAt: -1 });

  if (!appointments || appointments.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No active appointments found for this doctor"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        "Active doctor appointments fetched successfully"
      )
    );
});

const completedAppointments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const appointments = await Appointment.find({
    doctorId: userId,
    status: "completed",
  })
    .populate("patientId", "fullname email phone")
    .sort({ scheduledAt: -1 });

  if (!appointments || appointments.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No completed appointments found for this doctor"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        "Completed doctor appointments fetched successfully"
      )
    );
});

// Mark appointment as active (start now)
const startAppointment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const appt = await Appointment.findById(id);
  if (!appt) throw new ApiError(404, "Appointment not found");
  if (
    String(appt.doctorId) !== String(userId) &&
    String(appt.patientId) !== String(userId)
  ) {
    throw new ApiError(403, "Not authorized for this appointment");
  }
  appt.status = "active";
  if (!appt.scheduledAt) appt.scheduledAt = new Date();
  await appt.save();
  return res
    .status(200)
    .json(new ApiResponse(200, appt, "Appointment started"));
});

// Mark appointment as completed
const completeAppointment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const appt = await Appointment.findById(id);
  if (!appt) throw new ApiError(404, "Appointment not found");
  if (
    String(appt.doctorId) !== String(userId) &&
    String(appt.patientId) !== String(userId)
  ) {
    throw new ApiError(403, "Not authorized for this appointment");
  }
  appt.status = "completed";
  await appt.save();
  return res
    .status(200)
    .json(new ApiResponse(200, appt, "Appointment completed"));
});

export {
  getAppointmentById,
  getAllAppointments,
  activeAppointments,
  completedAppointments,
  getUserAppointments,
  createAppointment,
  updateAppointment,
  startAppointment,
  completeAppointment,
};
