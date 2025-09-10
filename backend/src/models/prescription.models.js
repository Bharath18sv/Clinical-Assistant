import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // auto-set when not provided
  },
  medications: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      dosage: {
        type: String,
        required: true, //500mg
      },
      frequency: {
        type: String,
        required: true, // 2 times per day
      },
      duration: {
        type: String,
        required: true, // e.g., "5 days"
      },
      notes: {
        type: String, // optional remarks like "after meals"
      },
      schedule: [
        {
          timeOfDay: {
            type: String,
            enum: ["morning", "afternoon", "evening", "night"],
            required: true,
          },
        },
      ],
    },
  ],
});

PrescriptionSchema.index({ patientId: 1, date: -1 });

export const Prescription = mongoose.model("Prescription", PrescriptionSchema);
