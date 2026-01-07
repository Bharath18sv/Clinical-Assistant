import { Router } from "express";
import {
  createSummary,
  getDoctorSummaries,
  getSummaryById,
  updateSummary,
  deleteSummary,
  getPatientSummaries,
} from "../controllers/summary.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJwt);

// Create a new summary
router.post("/", createSummary);

// Get all summaries for the logged-in doctor
router.get("/", getDoctorSummaries);

// Get a specific summary by ID
router.get("/:summaryId", getSummaryById);

// Update a summary
router.put("/:summaryId", updateSummary);

// Delete a summary
router.delete("/:summaryId", deleteSummary);

// Get all summaries for a specific patient
router.get("/patient/:patientId", getPatientSummaries);

export default router;
