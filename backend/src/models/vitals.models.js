import mongoose, { Schema } from "mongoose";
import { Doctor } from "./doctor.models.js";
import { Patient } from "./patient.models.js";

const VitalsSchema = new mongoose.Schema({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: Doctor,
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: Patient,
    required: true,
  },
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number },
  },
  sugar: {
    type: Number,
  },
  heartRate: {
    type: Number,
  },
  temperature: {
    type: Number,
  },
  respiratoryRate: {
    type: Number,
  },
  oxygenSaturation: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  takenAt: {
    type: Date,
    default: Date.now,
  },
});

export const Vitals = mongoose.model("Vitals", VitalsSchema);
