import mongoose, { Schema } from "mongoose";

const SummarySchema = new mongoose.Schema({
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
  periodStart: {
    type: Date,
    required: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  textSummary: {
    type: String,
    required: true,
  },
  keyAlerts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Alert",
    },
  ],
  prescriptions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Summary = mongoose.model("Summary", SummarySchema);
