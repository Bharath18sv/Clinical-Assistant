import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { Patient } from "../models/patient.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Appointment } from "../models/appointments.models.js";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import { SymptomLog } from "../models/symptomLogs.models.js";
import { Prescription } from "../models/prescription.models.js";
import { Vitals } from "../models/vitals.models.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import { verificationCodeTemplate } from "../utils/emailTemplates.js";

const registerPatient = asyncHandler(async (req, res) => {
  console.log("req.body data: ", req.body);
  console.log("req.file data: ", req.file);
  console.log("req.user : ", req.user);
  const doctorId = req.user?._id;

  const {
    email,
    password,
    fullname,
    gender,
    age,
    phone,
    chronicConditions,
    allergies,
    symptoms,
    // Address fields (flattened from frontend)
    "address.street": street,
    "address.city": city,
    "address.state": state,
    "address.zip": zip,
    "address.country": country,
  } = req.body;

  // Reconstruct address object
  const address = {
    street: street || "",
    city: city || "",
    state: state || "",
    zip: zip || "",
    country: country || "India",
  };

  // Parse arrays (FormData sends arrays as comma-separated strings or individual fields)
  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    return [field]; // Single value
  };

  const parsedChronicConditions = parseArrayField(chronicConditions);
  const parsedAllergies = parseArrayField(allergies);
  const parsedSymptoms = parseArrayField(symptoms);

  // Validation
  if (
    [email, password, fullname, gender, phone].some(
      (field) => typeof field !== "string" || !field.trim()
    ) ||
    !age ||
    isNaN(parseInt(age))
  ) {
    console.log("All fields are required");
    throw new ApiError(400, "Validation failed: Missing required fields");
  }

  // Check if user already exists
  const PatientAlreadyExist = await Patient.findOne({ email });
  if (PatientAlreadyExist) {
    console.log("Patient already exists with email:", email);
    throw new ApiError(400, `User with email: ${email} already exists`);
  }

  const ageNum = parseInt(age);
  if (ageNum < 1 || ageNum > 120) {
    console.log("Age is invalid");
    throw new ApiError(400, "Age is invalid");
  }

  // Get the profile picture path (single file upload)
  const profilePicLocalPath = req.file?.path;
  console.log("Profile pic local path:", profilePicLocalPath);

  // Upload image to cloudinary
  let profilePic;
  if (profilePicLocalPath) {
    try {
      profilePic = await uploadOnCloudinary(profilePicLocalPath);
      console.log("Profile picture uploaded successfully");
    } catch (error) {
      console.log("Profile pic upload failed", error);
      throw new ApiError(500, "Failed to upload Profile picture");
    }
  }

  if (profilePic) {
    console.log("Profile picture uploaded successfully");
  } else {
    console.log("Profile picture not uploaded");
  }

  // Create the patient
  try {
    const newPatient = await Patient.create({
      email,
      fullname,
      password,
      profilePic: profilePic?.url || "",
      gender,
      age: ageNum,
      phone,
      address,
      chronicConditions: parsedChronicConditions,
      allergies: parsedAllergies,
      symptoms: parsedSymptoms,
      doctorId: doctorId || null,
    });

    console.log("New patient created:", newPatient.fullname);

    // Generate verification code and email it
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    newPatient.emailVerificationCodeHash = codeHash;
    newPatient.emailVerificationExpiresAt = codeExpiry;
    await newPatient.save({ validateBeforeSave: false });

    try {
      const html = verificationCodeTemplate({
        name: newPatient.fullname,
        code,
        appUrl: process.env.APP_URL,
      });
      await sendEmail({
        to: newPatient.email,
        subject: "Verify your email",
        html,
      });
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    const createdPatient = await Patient.findById(newPatient._id).select(
      "-password -refreshToken"
    );

    if (!createdPatient) {
      throw new ApiError(
        500,
        "Something went wrong while registering the patient"
      );
    }

    res
      .status(201)
      .json(
        new ApiResponse(201, createdPatient, "Patient registered successfully")
      );
  } catch (error) {
    console.log("Patient creation failed", error);
    if (profilePic) {
      deleteFromCloudinary(profilePic.public_id);
    }
    throw new ApiError(
      500,
      "Something went wrong while creating the patient and images were deleted"
    );
  }
});

const generateAccessRefreshToken = async (PatientId) => {
  try {
    const patient = await Patient.findById(PatientId);

    if (!patient) {
      console.log(`No patient with patient id: ${PatientId}`);
      throw new ApiError(400, `No patient with patient id: ${PatientId}`);
    }

    const refreshToken = await patient.generateRefreshToken();
    const accessToken = await patient.generateAccessToken();

    if (!refreshToken && !accessToken) {
      console.log("Error while generating tokens");
      throw new ApiError(500, "Error while generating tokens");
    }

    //store the refreshToken for the patient
    patient.refreshToken = refreshToken;

    //save the patient data without validating everything again
    await patient.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    console.log(`Error while generating or saving the tokens: ${error}`);
    throw new ApiError(
      500,
      `Error while generating or saving the tokens: ${error}`
    );
  }
};

const loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const patient = await Patient.findOne({ email });

  if (!patient) {
    console.log(`User with email: ${email} doesn't exist`);
    throw new ApiError(401, `User with email: ${email} doesn't exist`);
  }

  // Block login if email not verified
  if (!patient.emailVerified) {
    throw new ApiError(
      401,
      "Email not verified. Please verify your email to continue."
    );
  }

  const isPasswordCorrect = await patient.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    console.log("Password doesn't match");
    throw new ApiError(400, "Password doesn't match");
  }
  const { refreshToken, accessToken } = await generateAccessRefreshToken(
    patient._id
  );

  //get the logged in patient details to send the response
  const loggedInPatient = await Patient.findById(patient._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent CSRF
    maxAge: 1000 * 60 * 60, // 1h
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInPatient, accessToken, refreshToken, role: "patient" },
        "Patient logged in successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //accept the refresh token from the user for verification
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    console.log("Refresh Token is required");
    throw new ApiError(400, "Refresh Token is required");
  }

  const decodedPayload = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const patient = await Patient.findById(decodedPayload._id);

  if (!patient) {
    console.log(
      `Can't find the user with the given refreshtoken: ${incomingRefreshToken}`
    );
    throw new ApiError(
      401,
      `Can't find the user with the given refreshtoken: ${incomingRefreshToken}`
    );
  }

  //check whether token matches
  if (incomingRefreshToken !== patient?.refreshToken) {
    console.log(`Tokens did not match/Invalid refresh Token`);
    throw new ApiError(401, `Tokens did not match/Invalid refresh Token`);
  }

  //if token matches, generate the access token
  const { refreshToken, accessToken } = await generateAccessRefreshToken(
    patient._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: refreshToken },
        "Successfully refreshed Access token"
      )
    );
});

const logoutPatient = asyncHandler(async (req, res) => {
  await Patient.findOneAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options) //for cookie() it need 3 arguments
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;

  if (!newPassword || !oldPassword) {
    throw new ApiError(400, "New password and old password are required");
  }

  const patient = await Patient.findById(req.user?._id);

  if (!patient) {
    throw new ApiError(400, "Patient not found");
  }

  const isPasswordCorrect = await patient.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  patient.password = newPassword;
  await patient.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const updateInfo = asyncHandler(async (req, res) => {
  console.log("Request body for updateInfo:", req.body);
  const {
    fullname,
    age,
    phone,
    address,
    allergies,
    chronicConditions,
    symptoms,
  } = req.body;

  if (
    !fullname ||
    !age ||
    !phone ||
    !address ||
    !address.street ||
    !address.city ||
    !address.state ||
    !address.zip ||
    !address.country ||
    !allergies ||
    !chronicConditions ||
    !symptoms
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (
    phone.length < 10 ||
    phone.length > 15 ||
    typeof phone !== "string" ||
    !phone.trim()
  ) {
    throw new ApiError(400, "Phone number is invalid");
  }

  if (
    age &&
    (isNaN(parseInt(age)) || parseInt(age) < 1 || parseInt(age) > 120)
  ) {
    throw new ApiError(400, "Age is invalid");
  }

  const patient = await Patient.findById(req.user?._id); //we can use findbyandUpdate also.
  if (!patient) {
    throw new ApiError(400, "Patient not found");
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        age,
        phone,
        address,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPatient,
        "Patient information updated successfully"
      )
    );
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const profilePicLocalPath = req.files?.path;

  if (!profilePicLocalPath) {
    throw new ApiError(400, "Profile picture is required");
  }

  const profilePic = await uploadOnCloudinary(profilePicLocalPath);

  if (!profilePic.url) {
    throw new ApiError(500, "Failed to upload Profile picture");
  }

  const patient = await Patient.findById(req.user?._id);

  if (!patient) {
    throw new ApiError(400, "Patient not found");
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profilePic: profilePic.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPatient,
        "Profile picture updated successfully"
      )
    );
});

// =============
// Email Verify
// =============
const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const patient = await Patient.findOne({ email });
  if (!patient) throw new ApiError(404, "No account found for this email");
  if (patient.emailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email already verified"));
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

  patient.emailVerificationCodeHash = codeHash;
  patient.emailVerificationExpiresAt = codeExpiry;
  await patient.save({ validateBeforeSave: false });

  try {
    const html = verificationCodeTemplate({
      name: patient.fullname,
      code,
      appUrl: process.env.APP_URL,
    });
    await sendEmail({ to: patient.email, subject: "Verify your email", html });
  } catch (emailErr) {
    console.error("Failed to send verification email:", emailErr);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification code sent"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) throw new ApiError(400, "Email and code are required");

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const patient = await Patient.findOne({ email }).select(
    "+emailVerificationCodeHash +emailVerificationExpiresAt"
  );
  if (!patient) throw new ApiError(404, "No account found for this email");

  if (patient.emailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email already verified"));
  }

  if (
    !patient.emailVerificationCodeHash ||
    !patient.emailVerificationExpiresAt ||
    patient.emailVerificationCodeHash !== codeHash ||
    new Date() > new Date(patient.emailVerificationExpiresAt)
  ) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  patient.emailVerified = true;
  patient.emailVerificationCodeHash = null;
  patient.emailVerificationExpiresAt = null;
  await patient.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const getCurrentPatient = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Patient fetched successfully"));
});

const getRecentPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, patients, "Recent patients fetched successfully")
    );
});

const getAllDoctorsForPatient = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().select("-password -refreshToken");
  console.log("All doctors", doctors);
  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
});

const getMyDoctors = asyncHandler(async (req, res) => {
  const patientId = req.user._id;

  const appointments = await Appointment.find({ patientId })
    .populate("doctorId", "-password -refreshToken") // only get doctorId field
    .select("doctorId -_id"); // only select doctorId field

  if (!appointments || appointments.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No appointments found for this patient"));
  }

  // Extract unique doctors from appointments
  const doctorSet = new Set();
  const myDoctors = [];

  appointments.forEach((appt) => {
    if (appt.doctorId && !doctorSet.has(appt.doctorId._id.toString())) {
      doctorSet.add(appt.doctorId._id.toString());
      myDoctors.push(appt.doctorId);
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, myDoctors, "My doctors fetched successfully"));
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const patientId = req.user._id;

  const appointments = await Appointment.find({ patientId })
    .populate("doctorId", "fullname specialization email phone")
    .sort({ scheduledAt: -1 });

  if (!appointments || appointments.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(404, null, "No appointments found for this patient")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        "Patient appointments fetched successfully"
      )
    );
});

const getActiveAppointments = asyncHandler(async (req, res) => {
  const patientId = req.user._id;

  const appointments = await Appointment.find({
    patientId,
    status: "active",
  })
    .populate("doctorId", "fullname specialization email phone")
    .sort({ scheduledAt: -1 });

  if (!appointments || appointments.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No active appointments found for this patient"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        "Active patient appointments fetched successfully"
      )
    );
});

const getCompletedAppointments = asyncHandler(async (req, res) => {
  const patientId = req.user._id;

  const appointments = await Appointment.find({
    patientId,
    status: "completed",
  })
    .populate("doctorId", "fullname specialization email phone")
    .sort({ scheduledAt: -1 });
  if (!appointments || appointments.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No completed appointments found for this patient"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        "Completed patient appointments fetched successfully"
      )
    );
});

// PDF: Generate report for logged-in patient
const generateMyReportPdf = asyncHandler(async (req, res) => {
  const patientId = req.user?._id;
  if (!patientId) throw new ApiError(401, "Unauthorized");

  const patient = await Patient.findById(patientId).select(
    "-password -refreshToken"
  );
  if (!patient) throw new ApiError(404, "Patient not found");

  const [symptomLogs, prescriptions, vitals, appointments] = await Promise.all([
    SymptomLog.find({ patientId }).sort({ date: -1 }),
    Prescription.find({ patientId }).sort({ date: -1 }),
    Vitals.find({ patient: patientId }).sort({ createdAt: -1 }),
    Appointment.find({ patientId }).sort({ scheduledAt: -1 }),
  ]);
  // console.log("vitals data for report: ", vitals);
  const doc = new PDFDocument({ margin: 50 });
  const filename = `my-health-report.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

  doc.pipe(res);

  doc.fontSize(20).text("My Health Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Name: ${patient.fullname}`);
  doc.text(`Email: ${patient.email}`);
  doc.text(`Gender: ${patient.gender}`);
  doc.text(`Age: ${patient.age}`);
  doc.text(`Phone: ${patient.phone}`);
  const addr = patient.address || {};
  doc.text(
    `Address: ${addr.street || ""}, ${addr.city || ""}, ${addr.state || ""} ${
      addr.zip || ""
    }, ${addr.country || ""}`
  );
  doc.moveDown();

  const listOrNA = (arr) => (arr && arr.length ? arr.join(", ") : "N/A");
  doc.text(`Allergies: ${listOrNA(patient.allergies)}`);
  doc.text(`Chronic Conditions: ${listOrNA(patient.chronicConditions)}`);
  doc.text(`Symptoms: ${listOrNA(patient.symptoms)}`);
  doc.moveDown();

  doc.fontSize(14).text("Appointments", { underline: true });
  if (!appointments.length) {
    doc.fontSize(12).text("No appointments found");
  } else {
    appointments.forEach((a) => {
      doc
        .fontSize(12)
        .text(
          `- ${new Date(a.scheduledAt).toLocaleString()} | ${a.status} | ${
            a.reason || ""
          }`
        );
    });
  }
  doc.moveDown();

  doc.fontSize(14).text("Prescriptions", { underline: true });
  if (!prescriptions.length) {
    doc.fontSize(12).text("No prescriptions found");
  } else {
    prescriptions.forEach((p) => {
      doc.fontSize(12).text(`Date: ${new Date(p.date).toLocaleDateString()}`);
      const meds = (p.medications || []).map((m) => m.name).join(", ");
      doc.text(`Medications: ${meds || "N/A"}`);
      doc.moveDown(0.5);
    });
  }

  doc.fontSize(14).text("Vitals", { underline: true });
  if (!vitals.length) {
    doc.fontSize(12).text("No vitals found");
  } else {
    vitals.forEach((v) => {
      doc
        .fontSize(12)
        .text(
          `- ${new Date(v.takenAt).toLocaleString()} | BP: ${
            v.bloodPressure || "N/A"
          } | Sugar: ${v.sugar || "N/A"}`
        );
    });
  }

  // doc.addPage();
  doc.moveDown(0.5);
  console.log("symptom logs: ", symptomLogs);
  doc.fontSize(14).text("Symptom Logs", { underline: true });
  if (!symptomLogs.length) {
    doc.fontSize(12).text("No symptom logs found");
  } else {
    symptomLogs.forEach((s) => {
      doc
        .fontSize(12)
        .text(
          `- ${new Date(s.createdAt).toLocaleDateString()} | ${listOrNA(
            s.symptoms
          )} | Notes: ${s.notes || "N/A"}`
        );
    });
  }

  doc.end();
});

export {
  registerPatient,
  loginPatient,
  refreshAccessToken,
  logoutPatient,
  updatePassword,
  updateInfo,
  updateProfilePic,
  getCurrentPatient,
  getRecentPatients,
  getAllDoctorsForPatient,
  getActiveAppointments,
  getCompletedAppointments,
  getMyDoctors,
  getMyAppointments,
  generateMyReportPdf,
  resendVerificationCode,
  verifyEmail,
};
