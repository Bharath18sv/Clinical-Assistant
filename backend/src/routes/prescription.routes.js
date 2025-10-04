import {
  createPrescription,
  getLatestPrescription,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  updatePrescription,
  deletePrescription,
  getPrescriptionById
} from "../controllers/prescription.controllers.js";

import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

//secured routes
router
  .route("/")
  .post(verifyJwt, createPrescription)
  .get(verifyJwt, getPrescriptionsByDoctor);

router
  .route("/patient/:patientId")
  .get(verifyJwt, getPrescriptionsByPatient);

router.route("/latest/:patientId").get(verifyJwt, getLatestPrescription);

router
  .route("/:id")
  .get(verifyJwt, getPrescriptionById)
  .put(verifyJwt, updatePrescription)
  .delete(verifyJwt, deletePrescription);

export default router;