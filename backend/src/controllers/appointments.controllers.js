import { asyncHandler } from "../utils/asyncHandler";
import { Appointment } from "../models/appointments.models";
import { Patient } from "../models/patient.models";

const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, patient, scheduledAt, status, reason } = req.body;

  const newAppointment = await Appointment.create({
    doctor,
    patient,
    scheduledAt,
    status,
    reason,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newAppointment, "Appointment created successfully")
    );
});

//check this later
const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { scheduledAt } = req.body;
  await Appointment.findOneAndUpdate(id, { scheduledAt });
});

const getUserAppointments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const appointments = await Appointment.find({
    $or: [{ doctor: userId }, { patient: userId }],
  });
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

  const appointment = await Appointment.findById(id);

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
  const allAppointments = await Appointment.find();
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
    doctor: userId,
    status: "active",
  });

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
    doctor: userId,
    status: "completed",
  });

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

export {
  getAppointmentById,
  getAllAppointments,
  activeAppointments,
  completedAppointments,
  getUserAppointments,
};
