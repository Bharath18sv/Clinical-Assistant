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
  getDPAppointment,
  deleteAppointmentById,
  cancelAppointment,
  approveAppointment
} from "../controllers/appointments.controllers.js";

const router = Router();

// create appointment (patient self-book or doctor via general route)
router
  .route("/")
  .post(verifyJwt, createAppointment)
  .get(verifyJwt, getUserAppointments);

router.route("/dp/:id").get(verifyJwt, getDPAppointment);
router.route("/active").get(verifyJwt, activeAppointments);
router.route("/completed").get(verifyJwt, completedAppointments);

router
  .route("/:id")
  .get(verifyJwt, getAppointmentById)
  .put(verifyJwt, updateAppointment)
  .delete(verifyJwt, deleteAppointmentById);
router.route("/:id/approve").put(verifyJwt, approveAppointment);
router.route("/:id/start").put(verifyJwt, startAppointment);
router.route("/:id/cancel").put(verifyJwt, cancelAppointment);
router.route("/:id/complete").put(verifyJwt, completeAppointment);

//admin routes
router.route("/all").get(getAllAppointments);
export default router;
