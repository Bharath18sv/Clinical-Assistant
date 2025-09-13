import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getAppointmentById,
  getAllAppointments,
  activeAppointments,
  completedAppointments,
  getUserAppointments,
  createAppointment,
  updateAppointment,
  startAppointment,
  completeAppointment,
} from "../controllers/appointments.controllers.js";

const router = Router();

// create appointment (patient self-book or doctor via general route)
router
  .route("/")
  .post(verifyJwt, createAppointment)
  .get(verifyJwt, getUserAppointments);
router
  .route("/:id")
  .get(verifyJwt, getAppointmentById)
  .put(verifyJwt, updateAppointment);
router.route("/active").get(verifyJwt, activeAppointments);
router.route("/completed").get(verifyJwt, completedAppointments);
router.route("/:id/start").put(verifyJwt, startAppointment);
router.route("/:id/complete").put(verifyJwt, completeAppointment);

//admin routes
router.route("/all").get(getAllAppointments);
export default router;
