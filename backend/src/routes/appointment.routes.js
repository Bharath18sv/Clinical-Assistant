import { Router } from "react-router-dom";
import { verifyJwt } from "../middlewares/auth.middleware";
import {
  getAppointmentById,
  getAllAppointments,
  activeAppointments,
  completedAppointments,
  getUserAppointments,
} from "../controllers/appointments.controllers";

const router = Router();

router.route("/:id").get(getAppointmentById);
router.route("/").get(verifyJwt, getUserAppointments);
router.route("/active").get(verifyJwt, activeAppointments);
router.route("/completed").get(verifyJwt, completedAppointments);

//admin routes
router.route("/all").get(getAllAppointments);
export default router;
