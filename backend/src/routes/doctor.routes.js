import { Router } from "express";
import { registerPatient } from "../controllers/patient.controllers.js";
import {
  registerDoctor,
  loginDoctor,
  refreshAccessToken,
  addPatient,
  getPatientsForDoctor,
  getRecentDoctors,
  getPatientDetailsBundle,
  addVitalsForPatient,
  addPrescriptionForPatient,
  createAppointmentForPatient,
  endAppointment,
  getPatientSummary,
  getDoctorById,
  updateInfo,
  updateProfilePic,
} from "../controllers/doctor.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllDoctors } from "../controllers/admin.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

//unsecured routes
router.route("/login").post(loginDoctor);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/recent").get(getRecentDoctors);
router.route("/all").get(getAllDoctors);
router.route("/:id").get(getDoctorById);

//secured routes
router
  .route("/registerPatient")
  .post(verifyJwt, upload.single("profilePic"), registerPatient);
router.route("/updateInfo").post(verifyJwt, updateInfo);
router
  .route("/updateProfilePic")
  .post(verifyJwt, upload.single("ProfilePicture"), updateProfilePic);
router.route("/addPatient").post(verifyJwt, addPatient);
router.route("/").get(verifyJwt, getPatientsForDoctor);
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

export default router;
