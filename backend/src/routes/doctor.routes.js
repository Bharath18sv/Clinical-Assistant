import { Router } from "express";
import { registerPatient } from "../controllers/patient.controllers.js";
import {
  registerDoctor,
  loginDoctor,
  refreshAccessToken,
  addPatient,
  getPatientsForDoctor,
  getCurrentDoctor,
  getRecentDoctors,
  getPatientDetailsBundle,
  addVitalsForPatient,
  addPrescriptionForPatient,
  createAppointmentForPatient,
  endAppointment,
  getPatientSummary,
} from "../controllers/doctor.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

//unsecured routes
router.route("/login").post(loginDoctor);
router.route("/refreshToken").post(refreshAccessToken);

//secured routes
router.route("/registerPatient").post(verifyJwt, registerPatient);
router.route("/addPatient").post(verifyJwt, addPatient);
router.route("/").get(verifyJwt, getPatientsForDoctor);
router.route("/me").get(verifyJwt, getCurrentDoctor);
router
  .route("/patients/:patientId/details")
  .get(verifyJwt, getPatientDetailsBundle);
router
  .route("/patients/:patientId/vitals")
  .post(verifyJwt, addVitalsForPatient);
router
  .route("/patients/:patientId/prescriptions")
  .post(verifyJwt, addPrescriptionForPatient);
router
  .route("/patients/:patientId/appointments")
  .post(verifyJwt, createAppointmentForPatient);
router.route("/appointments/:appointmentId/end").put(verifyJwt, endAppointment);
router.route("/patients/:patientId/summary").get(verifyJwt, getPatientSummary);

// admin routes
router.route("/recent").get(getRecentDoctors);

export default router;
