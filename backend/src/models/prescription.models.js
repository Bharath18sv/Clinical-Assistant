import mongoose, { Schema } from "mongoose";

// Enhanced Prescription Schema
const PrescriptionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
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
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    medications: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        dosage: {
          type: Number, // in mg
          required: true,
        },
        duration: {
          type: Number, // in days
          required: true,
        },
        notes: {
          type: String, // optional remarks like "after meals"
        },
        status: {
          type: String,
          enum: ["active", "completed", "discontinued", "cancelled"],
          default: "active",
        },
        schedule: [
          {
            type: String,
            enum: ["morning", "afternoon", "evening", "night"],
            required: true,
          },
        ],
      },
    ],
  },
  {
    timestamps: true, // Added timestamps
  }
);

PrescriptionSchema.index({ patientId: 1, date: -1 });
PrescriptionSchema.index({ doctorId: 1, date: -1 });
PrescriptionSchema.index({ status: 1 });

export const Prescription = mongoose.model("Prescription", PrescriptionSchema);
