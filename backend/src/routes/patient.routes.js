import { Router } from "express";
import {
  registerPatient,
  loginPatient,
  refreshAccessToken,
  logoutPatient,
  updatePassword,
  updateInfo,
  updateProfilePic,
  getCurrentPatient,
  getRecentPatients,
  getAllDoctorsForPatient,
  getActiveAppointments,
  getCompletedAppointments,
  getMyDoctors,
  getMyAppointments,
} from "../controllers/patient.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

//unsecured routes
router.route("/register").post(registerPatient);
router.route("/login").post(loginPatient);
router.route("/refreshToken").post(refreshAccessToken);

//secured routes
router.route("/logout").post(verifyJwt, logoutPatient);
router.route("/updateInfo").post(verifyJwt, updateInfo);
router.route("/updatePassword").post(verifyJwt, updatePassword);
router
  .route("/updateProfilePic")
  .post(verifyJwt, upload.single("ProfilePicture"), updateProfilePic);
router.route("/me").get(verifyJwt, getCurrentPatient);
router.route("/doctors").get(verifyJwt, getAllDoctorsForPatient);
router.route("/myDoctors").get(verifyJwt, getMyDoctors);
router.route("/appointments").get(verifyJwt, getMyAppointments);
router.route("/appointments/active").get(verifyJwt, getActiveAppointments);
router.route("/appointments/completed").get(verifyJwt, getCompletedAppointments);

//admin routes
router.route("/recent").get(getRecentPatients);

export default router;
