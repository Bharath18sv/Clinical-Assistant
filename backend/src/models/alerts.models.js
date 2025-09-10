import mongoose, { Schema } from "mongoose";

const AlertSchema = new mongoose.Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
  }, // optional if assigned

  type: { type: String, required: true }, // e.g., "Critical Symptom", "ADR Suspected"
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  description: { type: String, required: true },
  linkedRecordId: { type: Schema.Types.ObjectId }, // symptomLog, medicationLog, etc.
  status: {
    type: String,
    enum: ["pending", "acknowledged", "resolved"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

export const Alert = mongoose.model("Alert", AlertSchema);
