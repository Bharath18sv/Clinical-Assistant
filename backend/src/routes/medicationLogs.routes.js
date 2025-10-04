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
} from "../controllers/medicationLogs.controllers.js";

const router = Router();

// Route to add a medication log entry
router
  .route("/:prescriptionId")
  .post(verifyJwt, addMedicationLog)
  .get(verifyJwt, getAllMedicationLogByPrescription);

router.route("/").get(verifyJwt, getDoctorPatientMedicationLogs);
router.route("/all").get(verifyJwt, getAllMedicationLogs);

export default router;
