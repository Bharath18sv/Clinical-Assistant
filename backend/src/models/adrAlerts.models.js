import mongoose, { Schema } from "mongoose";

const ADRAlertSchema = new mongoose.Schema({
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
  riskLevel: {
    type: String,
    enum: ["low", "moderate", "high"],
    required: true,
  },
  adrData: {
    type: Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "resolved", "dismissed"],
    default: "pending",
  },
  doctorNotes: {
    type: String,
    default: "",
  },
  notificationsSent: {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ADRAlertSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const ADRAlert = mongoose.model("ADRAlert", ADRAlertSchema);
