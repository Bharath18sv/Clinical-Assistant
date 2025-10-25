import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  checkPatientADR,
  checkPrescriptionADR,
  getDoctorADRAlerts,
  updateADRAlertStatus,
  getADRStatistics,
} from "../controllers/adr.controllers.js";

const router = Router();

// All routes require authentication
router.use(verifyJwt);

// ADR Detection Routes
router.post("/check/patient/:patientId", checkPatientADR);
router.post("/check/prescription", checkPrescriptionADR);

// ADR Alerts Management
router.get("/alerts", getDoctorADRAlerts);
router.put("/alerts/:alertId/status", updateADRAlertStatus);

// ADR Statistics
router.get("/statistics", getADRStatistics);

export default router;
