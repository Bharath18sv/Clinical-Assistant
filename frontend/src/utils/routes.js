// Application route constants
export const ROUTES = {
  // Public routes
  HOME: "/",
  LANDING: "/",

  // Admin routes
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_DOCTORS: "/admin/doctors",
  ADMIN_ADD_DOCTOR: "/admin/doctors/add",

  // Doctor routes
  DOCTOR_LOGIN: "/doctor/login",
  DOCTOR_DASHBOARD: "/doctor/dashboard",

  // Patient routes
  PATIENT_LOGIN: "/patient/login",
  PATIENT_SIGNUP: "/patient/signup",
  PATIENT_DASHBOARD: "/patient/dashboard",
  PATIENT_PROFILE: "/patient/profile",
};

export const PUBLIC_PATHS = [
  ROUTES.HOME,
  ROUTES.ADMIN_LOGIN,
  ROUTES.DOCTOR_LOGIN,
  ROUTES.PATIENT_LOGIN,
  ROUTES.PATIENT_SIGNUP,
];

export const PROTECTED_PATHS = {
  ADMIN: ["/admin"],
  DOCTOR: ["/doctor"],
  PATIENT: ["/patient"],
};
