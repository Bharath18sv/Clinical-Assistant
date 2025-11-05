import {
  createSymptomLog,
  getSymptomLogs,
  getSymptomLogById,
  getRecentSymptomLogs,
  updateSymptomLog,
  getSymptomLogsForDoctor,
  getSymptomLogsOfPatientByDoctor,
  getSymptomLogOfDoctorByPatient,
  getDoctorListForPatient,
  getPatientListForDoctor,
} from "../controllers/symptomLogs.controller.js";

import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Route to create a new symptom log
router.post("/", verifyJwt, createSymptomLog);

// patient fetching all their symptom logs
router.get("/", verifyJwt, getSymptomLogs);

// doctor fetching symptom logs of a patient
router.get("/doctor/:patientId", verifyJwt, getSymptomLogsOfPatientByDoctor);

// doctor fetching symptom log of a patient
router.get("/patient/:doctorId", verifyJwt, getSymptomLogOfDoctorByPatient);

// Route to get a specific symptom log by ID
router.get("/:id", verifyJwt, getSymptomLogById);

// Route to get recent symptom logs
router.get("/recent", verifyJwt, getRecentSymptomLogs);

// Route to update a symptom log
router.put("/:id", verifyJwt, updateSymptomLog);

// get list of doctors who have added symptom logs for a patient
router.get("/doctors/list", verifyJwt, getDoctorListForPatient);

// get list of patients who have symptom logs added by a doctor
router.get("/patients/list", verifyJwt, getPatientListForDoctor);

export default router;
