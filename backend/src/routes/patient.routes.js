import { Router } from "express";
import {
  registerPatient,
  loginPatient,
  refreshAccessToken,
  logoutPatient,
  updateInfo,
  updatePassword,
  updateProfilePic,
  getCurrentPatient,
  getRecentPatients,
} from "../controllers/patient.controllers.js";
import {
  logSymptoms,
  logMedication,
  getMyLogs,
} from "../controllers/healthcheck.controllers.js";
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
router.route("/logs/symptoms").post(verifyJwt, logSymptoms);
router.route("/logs/medications").post(verifyJwt, logMedication);
router.route("/logs").get(verifyJwt, getMyLogs);

//admin routes
router.route("/recent").get(getRecentPatients);

export default router;
