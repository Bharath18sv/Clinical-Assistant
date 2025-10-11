import { verifyJwt } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  addMedicationLog,
  getAllMedicationLogs,
  getDoctorPatientMedicationLogs,
  getAllMedicationLogByPrescription,
  getMedicationLogById,
  getPatientMedicationLogs,
  getSpecificPatientMedicationLogs,
  getPatientPendingMedicationLogs,
  updateMedicationLogStatus,
  updateMedicationLog,
} from "../controllers/medicationLogs.controllers.js";

const router = Router();

// Patient routes
router.route("/patient").get(verifyJwt, getPatientMedicationLogs);
router
  .route("/patient/pending")
  .get(verifyJwt, getPatientPendingMedicationLogs);

// Doctor routes
router.route("/doctor").get(verifyJwt, getDoctorPatientMedicationLogs);
router
  .route("/doctor/patient/:patientId")
  .get(verifyJwt, getSpecificPatientMedicationLogs);

// Admin routes
router.route("/all").get(verifyJwt, getAllMedicationLogs);

// General routes
router
  .route("/:prescriptionId")
  .post(verifyJwt, addMedicationLog)
  .get(verifyJwt, getAllMedicationLogByPrescription);

// Update medication log status
router.route("/:id/status").put(verifyJwt, updateMedicationLogStatus);
router.route("/:id").put(verifyJwt, updateMedicationLog);

export default router;
