import mongoose, { Schema } from "mongoose";
import { Vitals } from "./vitals.models.js";

const SymptomLogSchema = new mongoose.Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "Doctor",
  },
  date: {
    type: Date,
    default: Date.now, // auto-set when not provided
  },
  symptoms: {
    type: [
      {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Symptom is required"],
      },
    ],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one symptom is required",
    },
  },
  vitals: {
    type: Schema.Types.ObjectId,
    ref: Vitals,
  },
});

// helpful for queries like "get patient logs sorted by date"
SymptomLogSchema.index({ patientId: 1, date: -1 });

export const SymptomLog = mongoose.model("SymptomLog", SymptomLogSchema);
