import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  addDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  approveDoctor,
  deleteDoctor,
  getDashboardStats,
  getAllAppointments,
} from "../controllers/admin.controllers.js";
import {
  verifyAdminJWT,
  requireAdminRole,
  checkPermission,
} from "../middlewares/adminAuth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

// Public routes (no authentication required)
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected routes (authentication required)
router.use(verifyAdminJWT);

router.post("/logout", logoutAdmin);

// Dashboard
router.get(
  "/dashboard/stats",
  checkPermission("viewAnalytics"),
  getDashboardStats
);

// Current admin profile
router.get("/me", getCurrentAdmin);

// Doctor Management
router.post(
  "/doctors",
  upload.single("profilePicture"),
  checkPermission("manageDoctors"),
  addDoctor
);
router.get("/doctors", checkPermission("manageDoctors"), getAllDoctors);
router.get(
  "/doctors/:doctorId",
  checkPermission("manageDoctors"),
  getDoctorById
);
router.put(
  "/doctors/:doctorId",
  checkPermission("manageDoctors"),
  updateDoctor
);
router.put(
  "/doctors/:doctorId/approve",
  checkPermission("manageDoctors"),
  approveDoctor
);
router.delete(
  "/doctors/:doctorId",
  checkPermission("manageDoctors"),
  deleteDoctor
);

// Appointments
router.get(
  "/appointments",
  checkPermission("manageAppointments"),
  getAllAppointments
);

export default router;
