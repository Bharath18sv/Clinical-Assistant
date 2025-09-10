//accept / reject,

import mongoose, { Schema } from "mongoose";
import { Patient } from "./patient.models.js";
import { Doctor } from "./doctor.models.js";

const AppointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: Patient,
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: Doctor,
      required: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "completed", "cancelled"],
      required: true,
    },
    reason: {
      type: String, //reason for the appointment from patient
      trim: true,
    },
    notes: {
      type: String, //notes from doctor
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", AppointmentSchema);
