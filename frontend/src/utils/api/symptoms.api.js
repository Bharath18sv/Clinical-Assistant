import { create } from "domain";
import API from "../api";

export const getRecentSymptomLogs = async () => {
  try {
    const response = await API.get("/symptoms/recent");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSymptomLogById = async (id) => {
  try {
    const response = await API.get(`/symptoms/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSymptomLog = async (symptomData) => {
  console.log("sympton data in api ", symptomData);
  try {
    const response = await API.post("/symptoms", symptomData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSymptomLogs = async () => {
  try {
    const response = await API.get("/symptoms");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSymptomLog = async (id, updatedData) => {
  try {
    const response = await API.put(`/symptoms/${id}`, updatedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSymptomLogsOfPatientByDoctor = async (patientId) => {
  try {
    const response = await API.get(`/symptoms/doctor/${patientId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSymptomLogOfDoctorByPatient = async (doctorId) => {
  try {
    const response = await API.get(`/symptoms/patient/${doctorId}`);
    console.log("symptom log response is api:", response);
    if (!response.data) {
      return null;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDoctorListForPatient = async () => {
  try {
    const response = await API.get("/symptoms/doctors/list");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPatientListForDoctor = async () => {
  try {
    const response = await API.get("/symptoms/patients/list");
    return response.data;
  } catch (error) {
    throw error;
  }
};
