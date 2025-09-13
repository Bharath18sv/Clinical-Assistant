import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getAppointmentById,
  getAllAppointments,
  activeAppointments,
  completedAppointments,
  getUserAppointments,
} from "../controllers/appointments.controllers.js";

const router = Router();

router.route("/:id").get(getAppointmentById);
router.route("/").get(verifyJwt, getUserAppointments);
router.route("/active").get(verifyJwt, activeAppointments);
router.route("/completed").get(verifyJwt, completedAppointments);

//admin routes
router.route("/all").get(getAllAppointments);
export default router;
