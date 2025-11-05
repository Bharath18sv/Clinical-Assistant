import { asyncHandler } from "../utils/asyncHandler.js";
import { Appointment } from "../models/appointments.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";

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

  // Populate doctor information before returning
  const populatedAppt = await Appointment.findById(appt._id)
    .populate(
      "doctorId",
      "fullname email phone address specialization profilePic"
    )
    .populate("patientId", "fullname email phone address profilePic");

  // Notify the doctor about the new appointment
  try {
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      await Notification.create({
        userId: doctorId,
        userType: "Doctor",
        type: "SYSTEM",
        title: "New Appointment Request",
        message: `You have a new appointment request from ${
          populatedAppt.patientId.fullname
        } scheduled for ${new Date(scheduledAt).toLocaleDateString()}.`,
      });
    }
  } catch (error) {
    console.error("Failed to send notification to doctor:", error);
  }

  console.log("appointment created successfully: ", populatedAppt);
  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedAppt, "Appointment created successfully")
    );
});

//appointment update - reschedule or change reason by patient
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

  if (!userId) {
    throw new ApiError(400, "user id is required");
  }

  const appointments = await Appointment.find({
    $or: [{ doctorId: userId }, { patientId: userId }],
  })
    .populate(
      "doctorId",
      "fullname email phone address specialization profilePic"
    )
    .populate("patientId", "fullname email phone address profilePic")
    .sort({ scheduledAt: -1 });

  if (!appointments || appointments.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No appointments found for this user"));
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

const getDPAppointment = asyncHandler(async (req, res) => {
  const userOne = req.user._id; //maybe doctor or patient
  // console.log("user one: ", userOne);
  const { id } = req.params; // maybe doctor or patient
  // console.log("user Two: ", id);

  const appointment = await Appointment.findOne({
    $or: [
      { doctorId: userOne, patientId: id },
      { doctorId: id, patientId: userOne },
    ],
  })
    .populate(
      "doctorId",
      "fullname email phone address specialization profilePic"
    )
    .populate("patientId", "fullname email phone address profilePic");

  if (!appointment) {
    return res
      .status(200)
      .json(new ApiResponse(404, null, "Appointment not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment fetched successfully")
    );
});

const deleteAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(
      400,
      "patientId or doctorId(from request body) is required"
    );
  }

  await Appointment.findByIdAndDelete(id);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Appointment deleted successfully"));
});

//admin only
const getAllAppointments = asyncHandler(async (req, res) => {
  const allAppointments = await Appointment.find()
    .populate("doctorId", "fullname email phone profilePic")
    .populate("patientId", "fullname email phone profilePic");
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
    .populate("patientId", "fullname email phone profilePic")
    .sort({ scheduledAt: -1 });

  if (!appointments || appointments.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
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
    .populate("patientId", "fullname email phone profilePic")
    .sort({ completedAt: -1 });

  if (!appointments || appointments.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
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
  appt.notes = req.body.notes || appt.notes || "";

  if (!appt.scheduledAt) appt.scheduledAt = new Date();
  await appt.save();
  return res
    .status(200)
    .json(new ApiResponse(200, appt, "Appointment started"));
});

// Mark appointment as completed
const completeAppointment = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!id) {
      throw new ApiError(400, "Appointment ID is required");
    }

    console.log(`Completing appointment ${id} by user ${userId}`);

    const appt = await Appointment.findById(id);
    if (!appt) {
      throw new ApiError(404, "Appointment not found");
    }

    console.log(`Appointment found:`, {
      id: appt._id,
      status: appt.status,
      doctorId: appt.doctorId,
      userId: userId,
    });

    // Only the doctor can complete appointments
    if (String(appt.doctorId) !== String(userId)) {
      console.log(`Auth failed - Doctor: ${appt.doctorId}, User: ${userId}`);
      throw new ApiError(403, "Only the doctor can complete this appointment");
    }

    appt.status = "completed";
    appt.notes = req.body?.notes || appt.notes || "";
    appt.completedAt = new Date();

    const savedAppt = await appt.save();

    console.log(`Appointment completed:`, {
      id: savedAppt._id,
      status: savedAppt.status,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, savedAppt, "Appointment completed"));
  } catch (error) {
    console.error(`Error completing appointment:`, error);
    throw error;
  }
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Appointment Id is required");
  }

  const appt = await Appointment.findById(id)
    .populate(
      "doctorId",
      "fullname email phone address specialization profilePic"
    )
    .populate(
      "patientId",
      "fullname email phone address profilePic gender age symptoms allergies chronicConditions"
    );

  if (!appt) {
    throw new ApiError(501, "Appointment with id is not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, appt, "Appointment by id is fetched successfully")
    );
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  const { id } = req.params;
  const { reason } = req.body;
  const appt = await Appointment.findById(id);
  if (!appt) throw new ApiError(404, "Appointment not found");
  if (String(appt.doctorId) !== String(doctorId)) {
    throw new ApiError(403, "Not authorized for this appointment");
  }
  appt.status = "cancelled";
  appt.notes = req.body.notes || appt.notes || "";

  appt.cancellationReason = reason || "No reason provided";
  await appt.save();
  return res
    .status(200)
    .json(new ApiResponse(200, appt, "Appointment cancelled"));
});

const approveAppointment = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  const { id } = req.params;
  const appt = await Appointment.findById(id);
  if (!appt) throw new ApiError(404, "Appointment not found");
  if (String(appt.doctorId) !== String(doctorId)) {
    throw new ApiError(403, "Not authorized for this appointment");
  }
  appt.status = "approved";
  appt.notes = req.body.notes || appt.notes || "";
  await appt.save();

  // Notify the patient that their appointment has been approved
  try {
    const populatedAppt = await Appointment.findById(id)
      .populate("doctorId", "fullname")
      .populate("patientId", "fullname");

    if (populatedAppt.patientId) {
      await Notification.create({
        userId: populatedAppt.patientId._id,
        userType: "Patient",
        type: "SYSTEM",
        title: "Appointment Approved",
        message: `Your appointment with Dr. ${populatedAppt.doctorId.fullname} has been approved.`,
      });
    }
  } catch (error) {
    console.error("Failed to send notification to patient:", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, appt, "Appointment approved"));
});

export {
  getAppointmentById,
  deleteAppointmentById,
  getDPAppointment,
  getAllAppointments,
  activeAppointments,
  completedAppointments,
  getUserAppointments,
  createAppointment,
  updateAppointment,
  startAppointment,
  completeAppointment,
  cancelAppointment,
  approveAppointment,
};
