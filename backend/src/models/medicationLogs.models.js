import mongoose, { Schema } from "mongoose";

const MedicationLogSchema = new Schema(
  {
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    patientId: {
      // Added for easier querying
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      // Added for easier querying
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    medicationName: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      // Added to track actual dosage taken
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeOfDay: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "taken", "missed", "skipped"], // Added "pending" for scheduled logs
      required: true,
    },
    takenAt: {
      type: Date, // exact timestamp when marked as taken
    },
    notes: {
      // Added for patient notes
      type: String,
      trim: true,
    },
    sideEffects: {
      // Added to track side effects
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
MedicationLogSchema.index({ patientId: 1, date: -1 });
MedicationLogSchema.index({ prescriptionId: 1, date: -1 });
MedicationLogSchema.index({ doctorId: 1, date: -1 });
MedicationLogSchema.index({ medicationName: 1, date: -1 });
MedicationLogSchema.index({ status: 1, date: -1 });
MedicationLogSchema.index({ date: -1, timeOfDay: 1 });

// Compound indexes for common query patterns
MedicationLogSchema.index({ patientId: 1, status: 1, date: -1 });
MedicationLogSchema.index({ doctorId: 1, status: 1, date: -1 });

export const MedicationLog = mongoose.model(
  "MedicationLog",
  MedicationLogSchema
);
