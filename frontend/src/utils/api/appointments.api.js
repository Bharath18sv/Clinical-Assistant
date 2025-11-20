import API from "../api";

export const getActiveAppointmentDoctors = async () => {
  try {
    const response = await API.get("/appointments/active/doctors");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin appointment management
export const getAllAppointments = async ({
  page = 1,
  limit = 10,
  status,
  doctorId,
  patientId,
} = {}) => {
  try {
    const params = {
      page,
      limit,
      ...(status && { status }),
      ...(doctorId && { doctorId }),
      ...(patientId && { patientId }),
    };

    const response = await API.get("/admin/appointments", { params });
    console.log("Admin appointments response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin appointments:", error);
    throw error;
  }
};