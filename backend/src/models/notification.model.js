import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userType", // <-- SUPPORT BOTH PATIENT & DOCTOR
      required: true,
    },
    userType: {
      type: String,
      enum: ["Patient", "Doctor"], // ⬅️ IMPORTANT (future-safe)
      required: true,
    },
    type: {
      type: String,
      enum: ["ADR_ALERT", "REMINDER", "SYSTEM"],
      required: true,
    },
    title: { type: String, required: true }, // ⬅️ Better UI display
    message: { type: String, required: true },

    prescriptionId: {
      // ⬅️ Patient can click to view directly
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
