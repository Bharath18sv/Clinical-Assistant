//accept / reject,

import mongoose, { Schema } from "mongoose";

const AppointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    type: {
      type: String,
      enum: ["consultation", "follow-up", "routine-check", "emergency"],
      default: "consultation",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "active", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
    reason: {
      type: String, //reason for the appointment from patient
      trim: true,
    },
    notes: {
      type: String, //notes from doctor
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", AppointmentSchema);
