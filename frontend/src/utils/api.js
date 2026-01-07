import axios from "axios";
import { isTokenExpired } from "@/utils/auth";
import { getGlobalClearUser } from "@/context/AuthContext";
import { handleApiError } from "@/utils/errorHandler";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // if you're also using cookies
});

API.interceptors.request.use(
  (req) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const token = userData?.accessToken || userData?.data?.accessToken;
      if (token && !isTokenExpired(token)) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Token error:", error);
    }
    return req;
  },
  (error) => Promise.reject(error)
);

export default API;

const triggerBrowserDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadDoctorReportPdf = async () => {
  const res = await API.get(`/doctors/reports/summary.pdf`, {
    responseType: "blob",
  });
  const blob = new Blob([res.data], { type: "application/pdf" });
  triggerBrowserDownload(blob, "doctor-summary.pdf");
};

export const downloadPatientReportPdfForDoctor = async (patientId) => {
  const res = await API.get(`/doctors/patients/${patientId}/report.pdf`, {
    responseType: "blob",
  });
  const blob = new Blob([res.data], { type: "application/pdf" });
  triggerBrowserDownload(blob, `patient-${patientId}-report.pdf`);
};

export const downloadMyPatientReportPdf = async () => {
  const res = await API.get(`/patients/reports/my.pdf`, {
    responseType: "blob",
  });
  const blob = new Blob([res.data], { type: "application/pdf" });
  triggerBrowserDownload(blob, `my-health-report.pdf`);
};

// doctor apis:
export const updateDoctorProfile = async (data) => {
  try {
    console.log("Doctor profile update data is api.js", data);
    const response = await API.put(`/doctors/updateInfo`, data);
    console.log("doctor profile update response : ", response);
    return response?.data;
  } catch (error) {
    console.error("❌ Error:", error);
    handleApiError(error, "Failed to update doctor profile");
    return null;
  }
};

export const getDoctorById = async (doctorId) => {
  try {
    const res = await API.get(`/doctors/${doctorId}`);
    console.log("response of doctor by id in api.js", res);
    return res.data.data;
  } catch (error) {
    console.log(error);
    handleApiError(error, "Failed to fetch doctor information");
    return null;
  }
};

export const fetchDoctorActiveAppointments = async () => {
  try {
    const { data } = await API.get(`/appointments/active`);
    return data?.data || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch active appointments");
    return [];
  }
};

export const fetchDoctorCompletedAppointments = async () => {
  try {
    const { data } = await API.get(`/appointments/completed`);
    return data?.data || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch completed appointments");
    return [];
  }
};

export const fetchAllDoctors = async () => {
  try {
    const { data } = await API.get("/doctors/all");
    console.log("doctors data:", data);
    return data?.data || [];
  } catch (error) {
    console.error("Error fetching doctors:", error);
    handleApiError(error, "Failed to fetch doctors");
    return [];
  }
};

//patient apis:
export const getMyDoctors = async () => {
  try {
    const doctors = await API.get("/patients/myDoctors");
    console.log("patient/mydoctors/ : ", doctors.data.data);
    return doctors.data.data || [];
  } catch (error) {
    console.error("Error fetching my doctors:", error);
    handleApiError(error, "Failed to fetch your doctors");
    return [];
  }
};

export const registerPatient = async (data) => {
  const formData = new FormData();

  formData.append("fullname", data.fullname);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("phone", data.phone);
  formData.append("age", data.age);
  formData.append("gender", data.gender);

  // Address fields (flattened format expected by backend)
  formData.append("address.street", data.address.street || "");
  formData.append("address.city", data.address.city || "");
  formData.append("address.state", data.address.state || "");
  formData.append("address.zip", data.address.zip || "");
  formData.append("address.country", data.address.country || "India");

  // Medical information
  if (data.chronicConditions && data.chronicConditions.length > 0) {
    data.chronicConditions.forEach((c) =>
      formData.append("chronicConditions", c.value || c)
    );
  }

  if (data.allergies && data.allergies.length > 0) {
    data.allergies.forEach((a) => formData.append("allergies", a.value || a));
  }

  if (data.symptoms && data.symptoms.length > 0) {
    data.symptoms.forEach((s) => formData.append("symptoms", s.value || s));
  }

  try {
    const registeredPatient = await API.post("/patients/register", formData);
    return registeredPatient;
  } catch (error) {
    console.error("❌ Error:", error);
    handleApiError(error, "Failed to register patient");
    return null;
  }
};

export const updatePatientProfile = async (data) => {
  const payload = {
    fullname: data.fullname,
    age: data.age,
    phone: data.phone,
    address: data.address,
    chronicConditions: data.chronicConditions?.map((c) => c.value || c),
    allergies: data.allergies?.map((a) => a.value || a),
    symptoms: data.symptoms?.map((s) => s.value || s),
  };

  console.log("data in api.js before update:", data);
  try {
    const updatedPatient = await API.put("/patients/updateInfo", payload);
    console.log("updated patient in api.js: ", updatedPatient);
    return updatedPatient;
  } catch (error) {
    console.error("❌ Error:", error);
    handleApiError(error, "Failed to update patient profile");
    return null;
  }
};

//appointments api:
export const fetchMyAppointments = async () => {
  try {
    const { data } = await API.get(`/appointments`);
    return data?.data || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch appointments");
    return [];
  }
};

export const fetchPatientAppointments = async () => {
  try {
    const { data } = await API.get(``);
    return data?.data || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch patient appointments");
    return [];
  }
};

export const fetchAppointmentById = async (id) => {
  try {
    const { data } = await API.get(`/appointments/${id}`);
    return data?.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch appointment details");
    return null;
  }
};

export const createAppointment = async ({
  doctorId,
  patientId,
  scheduledAt,
  reason,
}) => {
  try {
    const { data } = await API.post(`/appointments`, {
      doctorId,
      patientId,
      scheduledAt,
      reason,
    });
    return data?.data;
  } catch (error) {
    handleApiError(error, "Failed to create appointment");
    return null;
  }
};

export const updateAppointment = async (id, updateData) => {
  let data;
  console.log("updated data : ", updateData);
  console.log("status check:", updateData.status, typeof updateData.status);

  // Transform doctorNotes to notes for backend compatibility
  const backendPayload = {
    notes: updateData.doctorNotes || updateData.notes || "",
    // Don't include status in individual endpoints as they set it automatically
  };

  // Add any additional fields that specific endpoints might need
  if (updateData.reason) {
    backendPayload.reason = updateData.reason;
  }

  try {
    switch (updateData.status) {
      case "approved":
        console.log("Calling approve endpoint");
        data = await API.put(`/appointments/${id}/approve`, backendPayload);
        break;
      case "cancelled":
        console.log("Calling cancel endpoint");
        data = await API.put(`/appointments/${id}/cancel`, backendPayload);
        break;
      case "in-progress":
        console.log("Calling start endpoint");
        data = await API.put(`/appointments/${id}/start`, backendPayload);
        break;
      case "completed":
        console.log("Calling complete endpoint");
        data = await API.put(`/appointments/${id}/complete`, backendPayload);
        break;
      default:
        console.log(
          "Using default update endpoint for status:",
          updateData.status
        );
        data = await API.put(`/appointments/${id}`, updateData);
    }

    console.log("API response:", data);
    return data?.data;
  } catch (error) {
    handleApiError(error, "Failed to update appointment");
    return null;
  }
};

export const startAppointment = async (id) => {
  try {
    const { data } = await API.put(`/appointments/${id}/start`);
    return data?.data;
  } catch (error) {
    handleApiError(error, "Failed to start appointment");
    return null;
  }
};

//this doesn't return anything
export const deleteAppointmentById = async (id) => {
  try {
    await API.delete(`/appointments/${id}`);
  } catch (error) {
    handleApiError(error, "Failed to delete appointment");
  }
};

export const completeAppointment = async (id) => {
  try {
    const { data } = await API.put(`/appointments/${id}/complete`);
    return data?.data;
  } catch (error) {
    handleApiError(error, "Failed to complete appointment");
    return null;
  }
};

export const fetchDPAppointment = async (id) => {
  try {
    const appt = await API.get(`/appointments/dp/${id}`);
    // console.log("appointment complete response:", appt);
    return appt.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch appointment");
    return null;
  }
};

//doctor apis
export const getDoctorAppointments = async () => {
  try {
    const appts = await API.get("/appointments");
    // console.log("/api appointments.data:", appts.data.data);
    return appts.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch doctor appointments");
    return [];
  }
};

export const addPatient = async (patientData) => {
  const formData = new FormData();

  // Add basic fields
  formData.append("fullname", patientData.fullname);
  formData.append("email", patientData.email);
  formData.append("password", patientData.password);
  formData.append("gender", patientData.gender);
  formData.append("age", patientData.age.toString());
  formData.append("phone", patientData.phone);

  // Add address fields with dot notation
  Object.entries(patientData.address).forEach(([key, value]) => {
    formData.append(`address.${key}`, value || "");
  });

  // Add arrays
  patientData.chronicConditions.forEach((condition) =>
    formData.append("chronicConditions", condition)
  );

  patientData.allergies.forEach((allergy) =>
    formData.append("allergies", allergy)
  );

  patientData.symptoms.forEach((symptom) =>
    formData.append("symptoms", symptom)
  );

  // Add the profile picture file
  if (patientData.profilePic) {
    formData.append("profilePic", patientData.profilePic);
  }

  console.log("Patient data from frontend:", patientData);

  try {
    // Use patient registration endpoint instead of doctor endpoint
    const response = await API.post("/doctors/registerPatient", formData);
    console.log("Created patient response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating patient:", error);
    console.error("Error response:", error.response?.data);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create patient";
    handleApiError(error, errorMessage);
    throw new Error(errorMessage);
  }
};
export const viewMyPatients = async () => {
  try {
    const patients = await API.get("/doctors/");
    console.log("view my patients res: ", patients);
    return patients.data.data.patients || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch patients");
    return [];
  }
};

export const getPatientById = async (id) => {
  try {
    const patient = await API.get(`/doctors/patients/${id}`);
    console.log("get patient by id res: ", patient);
    return patient.data.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch patient details");
    return null;
  }
};

//admin apis
export const addDoctor = async (doctorData) => {
  const formData = new FormData();

  // Add basic fields
  formData.append("email", doctorData.email);
  formData.append("password", doctorData.password);
  formData.append("fullname", doctorData.fullname);
  formData.append("gender", doctorData.gender);
  formData.append("age", doctorData.age.toString());
  formData.append("experience", doctorData.experience);
  formData.append("about", doctorData.about);
  formData.append("phone", doctorData.phone);

  // Add address fields with dot notation
  Object.entries(doctorData.address).forEach(([key, value]) => {
    formData.append(`address.${key}`, value || "");
  });

  if (doctorData.specialization.length > 0) {
    doctorData.specialization.forEach((spec) =>
      formData.append("specialization", spec)
    );
  }

  if (doctorData.qualifications.length > 0) {
    doctorData.qualifications.forEach((qlf) =>
      formData.append("qualifications", qlf)
    );
  }

  // Add the profile picture file
  if (doctorData.profilePic) {
    formData.append("profilePic", doctorData.profilePic);
  }

  console.log("Doctor data from frontend:", doctorData);

  try {
    // Use patient registration endpoint instead of doctor endpoint
    const response = await API.post("/admin/doctors", formData);
    console.log("Created doctor response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating doctor:", error);
    handleApiError(error, "Failed to create doctor");
    throw error;
  }
};

// Get current admin profile
export const getCurrentAdmin = async () => {
  try {
    const response = await API.get("/admin/me");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    handleApiError(error, "Failed to fetch admin profile");
    throw error;
  }
};

// Get all patients for admin with filtering and pagination
export const getAllPatientsForAdmin = async (params = {}) => {
  try {
    const response = await API.get("/admin/patients", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    handleApiError(error, "Failed to fetch patients");
    throw error;
  }
};

//presecription apis
export const updatePrescription = async (prescriptionId, prescriptionData) => {
  try {
    const response = await API.put(
      `/prescriptions/${prescriptionId}`,
      prescriptionData
    );
    console.log("Updated prescription response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating prescription:", error);
    handleApiError(error, "Failed to update prescription");
    throw error;
  }
};

export const addPrescription = async (prescriptionData) => {
  try {
    const response = await API.post("/prescriptions/", prescriptionData);
    console.log("Added prescription response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding prescription:", error);
    handleApiError(error, "Failed to add prescription");
    throw error;
  }
};

export const getPatientPrescriptions = async (patientId) => {
  // patientId is required
  if (!patientId) {
    console.error("patientID is required");
    return null;
  }
  console.log("PatientID in api.js:", patientId);
  try {
    const response = await API.get(`/prescriptions/patient/${patientId}/`);
    console.log("Fetched prescriptions response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    handleApiError(error, "Failed to fetch prescriptions");
    throw error;
  }
};

export const getPrescriptionById = async (id) => {
  try {
    const response = await API.get(`/prescriptions/${id}/`);
    console.log("Fetched prescription by ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching prescription by ID:", error);
    handleApiError(error, "Failed to fetch prescription");
    throw error;
  }
};

export const deletePrescription = async (id) => {
  try {
    const response = await API.delete(`/prescriptions/${id}`);
    console.log("Deleted prescription response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting prescription:", error);
    handleApiError(error, "Failed to delete prescription");
    throw error;
  }
};

export const getDoctorPrescriptions = async () => {
  try {
    const response = await API.get(`/prescriptions/`);
    console.log("Fetched doctor prescriptions response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error);
    handleApiError(error, "Failed to fetch prescriptions");
    throw error;
  }
};

export const getLatestPrescription = async (patientId) => {
  try {
    const response = await API.get(
      `/doctors/patients/${patientId}/prescriptions/latest`
    );
    console.log("Fetched latest prescription response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching latest prescription:", error);
    handleApiError(error, "Failed to fetch latest prescription");
    throw error;
  }
};

// medication logs apis
export const getMedicationLogs = async (prescriptionId) => {
  try {
    const response = await API.get(`/medicationLogs/${prescriptionId}/`);
    console.log("Fetched medication logs response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching medication logs:", error);
    handleApiError(error, "Failed to fetch medication logs");
    throw error;
  }
};

export const addMedicationLog = async (logData, prescriptionId) => {
  try {
    const response = await API.post(
      `/medicationLogs/${prescriptionId}/`,
      logData
    );
    console.log("Added medication log response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding medication log:", error);
    handleApiError(error, "Failed to add medication log");
    throw error;
  }
};

export const getAllMedicationLogs = async () => {
  try {
    const response = await API.get(`/medicationLogs/doctor`);
    console.log("Fetched all medication logs response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all medication logs:", error);
    handleApiError(error, "Failed to fetch medication logs");
    throw error;
  }
};

export const getPatientPendingMedicationLogs = async () => {
  try {
    const response = await API.get(`/medicationLogs/patient/pending`);
    console.log(
      "Fetched patient pending medication logs response:",
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patient pending medication logs:", error);
    handleApiError(error, "Failed to fetch pending medication logs");
    throw error;
  }
};

export const updateMedicationLogStatus = async (logId, statusData) => {
  try {
    const response = await API.put(
      `/medicationLogs/${logId}/status`,
      statusData
    );
    console.log("Updated medication log status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating medication log status:", error);
    handleApiError(error, "Failed to update medication log status");
    throw error;
  }
};

export const getPatientMedicationLogs = async ({
  page = 1,
  limit = 20,
  startDate,
  endDate,
  medicationName,
  status,
  timeOfDay,
} = {}) => {
  try {
    const params = {
      page,
      limit,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(medicationName && { medicationName }),
      ...(status && { status }),
      ...(timeOfDay && { timeOfDay }),
    };

    const response = await API.get("/medicationLogs/patient", { params });
    console.log("✅ Medication logs fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching medication logs:", error);
    handleApiError(error, "Failed to fetch medication logs");
    return null;
  }
};

//vitals apis
export const addVitals = async (vitalsData) => {
  console.log("vitalsData in api.js:", vitalsData);

  try {
    const response = await API.post("/vitals", vitalsData);
    console.log("Added vitals response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding vitals:", error);
    handleApiError(error, "Failed to add vitals");
    throw error;
  }
};

export const getVitalsById = async (id) => {
  try {
    const response = await API.get(`/vitals/${id}/`);
    console.log("Fetched vitals response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching vitals:", error);
    handleApiError(error, "Failed to fetch vitals");
    throw error;
  }
};

export const getAllVitals = async () => {
  try {
    const response = await API.get("/vitals/");
    console.log("Fetched all vitals response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all vitals:", error);
    handleApiError(error, "Failed to fetch vitals");
    throw error;
  }
};

export const getLatestVitals = async (patientId) => {
  console.log("patientId in api.js : ", patientId);

  try {
    const res = await API.get(`/vitals/latest/${patientId}`);
    // console.log("latest vitals response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching latest vitals : ", error);
    handleApiError(error, "Failed to fetch latest vitals");
    throw error;
  }
};
