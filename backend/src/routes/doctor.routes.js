import { Router } from "express";
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
  getPatientById,
  generatePatientReportPdf,
  generateDoctorReportPdf,
  resendDoctorVerificationCode,
  verifyDoctorEmail,
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

// for email verification
router.route("/verify-email").post(verifyDoctorEmail);
router.route("/resend-verification").post(resendDoctorVerificationCode);

//secured routes
//add patient by doctor
router
  .route("/registerPatient")
  .post(verifyJwt, upload.single("profilePic"), addPatient);

router.route("/updateInfo").put(verifyJwt, updateInfo);

//get patient by id
router.route("/patients/:patientId").get(verifyJwt, getPatientById);

//update profile pic
router
  .route("/updateProfilePic")
  .post(verifyJwt, upload.single("ProfilePicture"), updateProfilePic);

//get patients for a doctor
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

// PDF report routes
router
  .route("/patients/:patientId/report.pdf")
  .get(verifyJwt, generatePatientReportPdf);
router.route("/reports/summary.pdf").get(verifyJwt, generateDoctorReportPdf);

export default router;
