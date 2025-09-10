import mongoose, { Schema } from "mongoose";

const MedicationLogSchema = new Schema(
  {
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    medicationName: {
      type: String,
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
      enum: ["taken", "missed"],
      required: true,
    },
    takenAt: {
      type: Date, // exact timestamp when marked as taken, patient will not log at the exact time they took the med
      //so a seperate field will be helpful, otherwise we could've used timestamps
    },
  },
  { timestamps: true }
);

export const MedicationLog = mongoose.model(
  "MedicationLog",
  MedicationLogSchema
);
