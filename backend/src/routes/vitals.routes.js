import Router from "express";
import {
  getVitalsById,
  addVitals,
  getAllVitals,
  getLatestVitals,
} from "../controllers/vitals.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJwt, getAllVitals).post(verifyJwt, addVitals);
router.get("/:id", verifyJwt, getVitalsById);
router.route("/latest/:patientId").get(verifyJwt, getLatestVitals);

export default router;
