// 1. Prescription Controllers
// 	Create Prescription
// 	•	Doctor creates for a patient.
// 	•	Body contains medications array.
// 	Get Prescriptions
// 	•	By patient (all prescriptions for a patient).
// 	•	By doctor (all prescriptions given by a doctor).
// 	•	Latest prescription.
// 	Update Prescription
// 	•	Modify medications, notes.
// 	Delete Prescription (optional).

import asyncHandler from "express-async-handler";
import { Prescription } from "../models/prescription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, medications, notes } = req.body;
  const doctorId = req.user._id; // Assuming req.user is populated with authenticated user's info

  if (!patientId || !medications || medications.length === 0) {
    throw new ApiError(400, "Patient ID and medications are required");
  }

  const newPrescription = new Prescription({
    doctorId,
    patientId,
    medications,
    notes,
  });

  const savedPrescription = await newPrescription.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        savedPrescription,
        "Prescription created successfully"
      )
    );
});

export const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) {
    throw new ApiError(400, "Patient ID is required");
  }

  const prescriptions = await Prescription.find({ patientId }).sort({
    createdAt: -1,
  });

  if (!prescriptions || prescriptions.length === 0) {
    return res
      .status(204)
      .json(
        new ApiResponse(204, null, "No prescriptions found for this patient")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescriptions,
        "Prescriptions retrieved successfully"
      )
    );
});

export const getPrescriptionsByDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.user._id; // Assuming req.user is populated with authenticated user's info

  const prescriptions = await Prescription.find({ doctorId }).sort({
    createdAt: -1,
  });

  if (!prescriptions || prescriptions.length === 0) {
    return res
      .status(204)
      .json(
        new ApiResponse(204, null, "No prescriptions found for this doctor")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescriptions,
        "Prescriptions retrieved successfully"
      )
    );
});

export const getLatestPrescription = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) {
    throw new ApiError(400, "Patient ID is required");
  }

  const latestPrescription = await Prescription.findOne({ patientId })
    .sort({ createdAt: -1 })
    .limit(1);

  if (!latestPrescription) {
    return res
      .status(204)
      .json(
        new ApiResponse(204, null, "No prescriptions found for this patient")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        latestPrescription,
        "Latest prescription retrieved successfully"
      )
    );
});

export const updatePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { medications, notes } = req.body;
  const doctorId = req.user._id; // Assuming req.user is populated with authenticated user's info

  if (!id) {
    throw new ApiError(400, "Prescription ID is required");
  }

  const prescription = await Prescription.findById(id);

  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  if (prescription.doctorId.toString() !== doctorId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to update this prescription"
    );
  }

  if (medications) {
    prescription.medications = medications;
  }
  if (notes) {
    prescription.notes = notes;
  }

  const updatedPrescription = await prescription.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPrescription,
        "Prescription updated successfully"
      )
    );
});

export const deletePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctorId = req.user._id; // Assuming req.user is populated with authenticated user's info

  if (!id) {
    throw new ApiError(400, "Prescription ID is required");
  }

  const prescription = await Prescription.findById(id);

  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  if (prescription.doctorId.toString() !== doctorId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this prescription"
    );
  }

  await prescription.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Prescription deleted successfully"));
});
