import mongoose, { Schema } from "mongoose";
import { SYMPTOMS } from "../constants.js";

const SymptomLogSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    symptoms: {
      type: [String], // pure array of strings
      required: true,
      enum: SYMPTOMS,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one symptom is required",
      },
      set: (arr) => arr.map((s) => s.trim()), // normalize input
    },
    vitals: {
      type: Schema.Types.ObjectId,
      ref: "Vitals",
      default: null,
    },
  },
  { timestamps: true }
);

// helpful for reverse-chronological patient history
SymptomLogSchema.index({ patientId: 1, createdAt: -1 });

export const SymptomLog = mongoose.model("SymptomLog", SymptomLogSchema);
