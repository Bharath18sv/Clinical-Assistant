import API from "../api";

export const verifyPatientEmail = async (data) => {
  // data is coming as json
  console.log("data : ", data);
  const { email } = data;
  const { code } = data;
  console.log(`email : ${email} and code: ${code}`);
  try {
    const response = await API.post("/patients/verify-email", { email, code });
    return response.data;
  } catch (error) {
    console.error("Error verifying patient email:", error.message);
    throw error;
  }
};

export const resendPatientVerification = async (email) => {
  console.log("email : ", email);
  try {
    const response = await API.post("/patients/resend-verification", { email });
    console.log("response: ", response);
    return response;
  } catch (error) {
    console.error("Error resending patient verification:", error);
    throw error;
  }
};

export const verifyDoctorEmail = async (email, code) => {
  try {
    if (!email || !code) {
      throw new Error("Email and code are required");
    }
    const response = await API.post("/doctors/verify-email", { email, code });
    console.log("response : ", response);
    return response.data;
  } catch (error) {
    console.error("Error verifying doctor email:", error);
    throw error;
  }
};

export const resendDoctorVerification = async (email) => {
  try {
    const response = await API.post("/doctors/resend-verification", { email });
    return response.data;
  } catch (error) {
    console.error("Error resending doctor verification:", error);
    throw error;
  }
};
