import API from "../api";

export const getActiveAppointmentDoctors = async () => {
  try {
    const response = await API.get("/appointments/active/doctors");
    return response.data;
  } catch (error) {
    throw error;
  }
};