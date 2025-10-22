import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";
import { SymptomLog } from "../models/symptomLogs.models.js";
import { Prescription } from "../models/prescription.models.js";
import { Vitals } from "../models/vitals.models.js";
import { Appointment } from "../models/appointments.models.js";
import mongoose from "mongoose";
import app from "../app.js";
import PDFDocument from "pdfkit";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import { verificationCodeTemplate } from "../utils/emailTemplates.js";

const registerDoctor = asyncHandler(async (req, res) => {
  const { email, password, fullname, gender, age, phone, address } = req.body;

  //check whether all fields are passed from the request
  if (
    [email, password, fullname, gender, phone].some(
      (field) => typeof field !== "string" || !field.trim()
    ) ||
    typeof age !== "number" ||
    !address ||
    typeof address !== "object"
  ) {
    throw new ApiError(400, "Validation failed: Missing required fields");
  }

  //check if user already exist
  const DoctorAlreadyExist = await Doctor.findOne({
    email,
  });

  if (DoctorAlreadyExist) {
    throw new ApiError(400, `User with email: ${email} already exist`);
  }

  if (age < 1 || age > 100) {
    throw new ApiError(400, "Age is invalid");
  }

  //get the profile picture path
  const profilePicLocalPath = req.files?.profilePic?.[0]?.path;

  //upload image to cloudinary
  let profilePic;
  if (profilePicLocalPath) {
    try {
      profilePic = await uploadOnCloudinary(profilePicLocalPath);
      console.log("Profile picture uploaded successfully");
    } catch (error) {
      console.log("profile pic upload failed", error);
      throw new ApiError(500, "Failed to upload Profile picture");
    }
  }

  //create the doctor
  try {
    const newDoctor = await Doctor.create({
      email,
      fullname,
      password,
      profilePic: profilePic?.url || "",
      gender,
      age,
      phone,
      address,
    });

    // Generate verification code and email it
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    newDoctor.emailVerificationCodeHash = codeHash;
    newDoctor.emailVerificationExpiresAt = codeExpiry;
    await newDoctor.save({ validateBeforeSave: false });

    try {
      const html = verificationCodeTemplate({
        name: newDoctor.fullname,
        code,
        appUrl: process.env.APP_URL,
      });
      await sendEmail({
        to: newDoctor.email,
        subject: "Verify your email",
        html,
      });
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    const createdDoctor = await Doctor.findById(newDoctor.id).select(
      "-password -refreshToken"
    );

    if (!createdDoctor) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, createdDoctor, "User registered Successfully")
      );
  } catch (error) {
    console.log("User creation failed", error);
    if (profilePic) {
      deleteFromCloudinary(profilePic.public_id);
    }
    throw new ApiError(
      500,
      "Something went wrong while creating the user and images were deleted"
    );
  }
});

const generateAccessRefreshToken = async (doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      console.log(`No Doctor with Doctor id: ${doctorId}`);
      throw new ApiError(400, `No Doctor with Doctor id: ${doctorId}`);
    }

    const refreshToken = await doctor.generateRefreshToken();
    const accessToken = await doctor.generateAccessToken();

    if (!refreshToken && !accessToken) {
      console.log("Error while generating tokens");
      throw new ApiError(500, "Error while generating tokens");
    }

    //store the refreshToken for the Doctor
    doctor.refreshToken = refreshToken;

    //save the Doctor data without validating everything again
    await doctor.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    console.log(`Error while generating or saving the tokens: ${error}`);
    throw new ApiError(
      500,
      `Error while generating or saving the tokens: ${error}`
    );
  }
};

const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const doctor = await Doctor.findOne({ email });

  if (!doctor) {
    console.log(`User with email: ${email} doesn't exist`);
    throw new ApiError(401, `User with email: ${email} doesn't exist`);
  }

  if (!doctor.isPasswordCorrect(password)) {
    console.log("Password doesn't match");
    throw new ApiError(400, "Password doesn't match");
  }

  // Block login if email not verified
  if (!doctor.emailVerified) {
    throw new ApiError(
      401,
      "Email not verified. Please verify your email to continue."
    );
  }

  const { refreshToken, accessToken } = await generateAccessRefreshToken(
    doctor._id
  );

  //get the logged in Doctor details to send the response
  const loggedInDoctor = await Doctor.findById(doctor._id).select(
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
    .json(
      new ApiResponse(
        200,
        { user: loggedInDoctor, accessToken, refreshToken, role: "doctor" },
        "Doctor logged in successfully"
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

  const doctor = await Doctor.findById(decodedPayload._id);

  if (!doctor) {
    console.log(
      `Can't find the user with the given refreshtoken: ${incomingRefreshToken}`
    );
    throw new ApiError(
      401,
      `Can't find the user with the given refreshtoken: ${incomingRefreshToken}`
    );
  }

  //check whether token matches
  if (incomingRefreshToken !== doctor?.refreshToken) {
    console.log(`Tokens did not match/Invalid refresh Token`);
    throw new ApiError(401, `Tokens did not match/Invalid refresh Token`);
  }

  //if token matches, generate the access token
  const { refreshToken, accessToken } = await generateAccessRefreshToken(
    doctor._id
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

const getPatientById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!patientId) {
    throw new ApiError(501, "Patient with the given Id is not found");
  }

  const doctorId = req.user?._id;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const patient = await Patient.findById(patientId).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, patient, "Patient with ID fetched successfully")
    );
});

//*** do this later **

// const isAvailable = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     throw new ApiError("Doctor mail is required");
//   }
//   const doctor = await Doctor.findOne({ email });
// });

const addPatient = asyncHandler(async (req, res) => {
  console.log("req.body data: ", req.body);
  console.log("req.file data: ", req.file);
  console.log("req.user : ", req.user);

  const doctorId = req.user?._id;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

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
    scheduledAt,
    reason,
    // Address fields
    "address.street": street,
    "address.city": city,
    "address.state": state,
    "address.zip": zip,
    "address.country": country,
  } = req.body;

  const address = {
    street: street || "",
    city: city || "",
    state: state || "",
    zip: zip || "",
    country: country || "India",
  };

  // Parse arrays
  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    return [field];
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
    throw new ApiError(400, "Validation failed: Missing required fields");
  }

  const existingPatient = await Patient.findOne({ email });
  if (existingPatient) {
    throw new ApiError(400, `Patient with email: ${email} already exists`);
  }

  const ageNum = parseInt(age);
  if (ageNum < 1 || ageNum > 120) {
    throw new ApiError(400, "Age is invalid");
  }

  // Profile picture
  const profilePicLocalPath = req.file?.path;
  console.log("Profile pic local path:", profilePicLocalPath);
  let profilePic;
  if (profilePicLocalPath) {
    try {
      profilePic = await uploadOnCloudinary(profilePicLocalPath);
      console.log("Profile pic uploaded:", profilePic?.secure_url || profilePic?.url);
    } catch (error) {
      console.log("Profile pic upload failed", error);
      throw new ApiError(500, "Failed to upload Profile picture");
    }
  }

  let createdPatient;
  try {
    // Create patient
    createdPatient = await Patient.create({
      email,
      fullname,
      password,
      profilePic: profilePic?.secure_url || profilePic?.url || "",
      gender,
      age: ageNum,
      phone,
      address,
      chronicConditions: parsedChronicConditions,
      allergies: parsedAllergies,
      symptoms: parsedSymptoms,
      doctorId,
    });

    // Generate verification code and email it to patient
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    createdPatient.emailVerificationCodeHash = codeHash;
    createdPatient.emailVerificationExpiresAt = codeExpiry;
    await createdPatient.save({ validateBeforeSave: false });

    try {
      console.log("Sending verification email to:", createdPatient.email);
      const html = verificationCodeTemplate({
        name: createdPatient.fullname,
        code,
        appUrl: process.env.APP_URL,
      });
      const emailResult = await sendEmail({
        to: createdPatient.email,
        subject: "Verify your email - Smart Care Assistant",
        html,
      });
      console.log("Email sent successfully:", emailResult);
    } catch (emailErr) {
      console.error("Failed to send verification email to patient:", emailErr);
      console.error("Email error details:", emailErr.message);
    }

    // Create appointment
    const createdAppointment = await Appointment.create({
      doctorId,
      patientId: createdPatient._id,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      reason: reason || parsedSymptoms[0] || "Initial consultation",
      status: "active",
    });

    res.status(201).json(
      new ApiResponse(
        201,
        {
          patient: createdPatient,
          appointment: createdAppointment,
        },
        "Patient and appointment created successfully"
      )
    );
  } catch (error) {
    console.log("Error creating patient/appointment:", error);

    if (createdPatient && createdPatient._id) {
      try {
        await Patient.findByIdAndDelete(createdPatient._id);
      } catch (cleanupErr) {
        console.log("Failed to rollback patient after error:", cleanupErr);
      }
    }
    if (profilePic) {
      await deleteFromCloudinary(profilePic.public_id);
    }

    throw new ApiError(500, "Failed to create patient and appointment");
  }
});

// Get all patients for the authenticated doctor
const getPatientsForDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const patients = await Appointment.aggregate([
    {
      $match: {
        doctorId: new mongoose.Types.ObjectId(doctorId),
        status: { $in: ["pending", "approved", "active"] }, // Only active care relationships
      },
    },
    {
      // Group by patientId to get unique patients
      $group: {
        _id: "$patientId",
        latestAppointment: { $first: "$$ROOT" }, // Get the first (latest due to sort) appointment
        totalAppointments: { $sum: 1 },
        lastVisit: { $max: "$scheduledAt" },
        appointmentStatuses: { $push: "$status" },
      },
    },
    {
      $sort: { lastVisit: -1 }, // Sort by latest visit
    },
    {
      // Populate patient details
      $lookup: {
        from: "patients", // Collection name (usually lowercase and pluralized)
        localField: "_id",
        foreignField: "_id",
        as: "patientDetails",
      },
    },
    {
      $unwind: "$patientDetails",
    },
    {
      // Project the final structure
      $project: {
        _id: 1,
        patientId: "$_id",
        patientDetails: {
          $mergeObjects: [
            "$patientDetails",
            { password: "$$REMOVE", refreshToken: "$$REMOVE" }, // Remove sensitive fields
          ],
        },
        totalAppointments: 1,
        lastVisit: 1,
        appointmentStatuses: 1,
        latestAppointmentId: "$latestAppointment._id",
        latestStatus: "$latestAppointment.status",
        latestReason: "$latestAppointment.reason",
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { patients, total: patients.length },
        "Unique patients of the doctor fetched successfully"
      )
    );
});

// Patient details bundle for a doctor
const getPatientDetailsBundle = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id || req.user?.id;
  const { patientId } = req.params;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const patient = await Patient.findOne({ _id: patientId, doctorId }).select(
    "-password -refreshToken"
  );
  if (!patient) throw new ApiError(404, "Patient not found");

  const [symptomLogs, prescriptions, vitals, appointments] = await Promise.all([
    SymptomLog.find({ patientId }).sort({ date: -1 }),
    Prescription.find({ patientId, doctorId }).sort({ date: -1 }),
    Vitals.find({ patient: patientId }).sort({ createdAt: -1 }),
    Appointment.find({ patientId, doctorId }).sort({ scheduledAt: -1 }),
  ]);

  // ML-based ADR Detection
  let adrAlerts = [];
  try {
    const allMedications = [];
    for (const p of prescriptions) {
      for (const med of p.medications || []) {
        allMedications.push({ name: med.name, dosage: med.dosage });
      }
    }

    if (allMedications.length > 0) {
      const response = await fetch('http://localhost:5001/predict-adr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications: allMedications,
          patient: {
            age: patient.age,
            allergies: patient.allergies || [],
            chronicConditions: patient.chronicConditions || []
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        adrAlerts = data.interactions || [];
      }
    }
  } catch (error) {
    console.error('ML ADR service error:', error);
    const allergySet = new Set((patient.allergies || []).map(a => a.toLowerCase()));
    for (const p of prescriptions) {
      for (const med of p.medications || []) {
        const name = (med.name || '').toLowerCase();
        if (allergySet.has(name)) {
          adrAlerts.push({
            type: 'allergy',
            severity: 'high',
            medications: [med.name],
            message: `Patient allergic to ${med.name}`,
            recommendation: 'Discontinue immediately'
          });
        }
      }
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        patient,
        symptomLogs,
        prescriptions,
        vitals,
        appointments,
        adrAlerts,
      },
      "Patient details bundle fetched"
    )
  );
});

// Add vitals for a patient
const addVitalsForPatient = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id || req.user?.id;
  const { patientId } = req.params;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const { bloodPressure, sugar } = req.body;
  const vitals = await Vitals.create({
    doctor: doctorId,
    patient: patientId,
    bloodPressure,
    sugar,
  });
  res.status(201).json(new ApiResponse(201, vitals, "Vitals added"));
});

// Add prescription for a patient
const addPrescriptionForPatient = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id || req.user?.id;
  const { patientId } = req.params;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const { medications, title } = req.body;
  if (!Array.isArray(medications) || medications.length === 0) {
    throw new ApiError(400, "Medications required");
  }
  const prescription = await Prescription.create({
    title,
    patientId,
    doctorId,
    medications,
  });
  res
    .status(201)
    .json(new ApiResponse(201, prescription, "Prescription created"));
});

// Create appointment for a patient
const createAppointmentForPatient = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id || req.user?.id;
  const { patientId } = req.params;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const { scheduledAt, reason } = req.body;
  const appointment = await Appointment.create({
    patientId,
    doctorId,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
    reason,
    status: "active",
  });
  res
    .status(201)
    .json(new ApiResponse(201, appointment, "Appointment created"));
});

// End appointment (mark as completed)
const endAppointment = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id || req.user?.id;
  const { appointmentId } = req.params;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const appt = await Appointment.findById(appointmentId);
  if (!appt) throw new ApiError(404, "Appointment not found");
  if (String(appt.doctorId) !== String(doctorId))
    throw new ApiError(403, "Not your appointment");

  appt.status = "completed";
  await appt.save();
  res.status(200).json(new ApiResponse(200, appt, "Appointment ended"));
});

// Summary data for patient (frontend generates PDF)
const getPatientSummary = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id || req.user?.id;
  const { patientId } = req.params;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const [patientRes, bundle] = await Promise.all([
    Patient.findOne({ _id: patientId, doctorId }).select(
      "-password -refreshToken"
    ),
    // reuse bundle call logic
    (async () => {
      const [symptomLogs, prescriptions, vitals, appointments] =
        await Promise.all([
          SymptomLog.find({ patientId }).sort({ date: -1 }),
          Prescription.find({ patientId, doctorId }).sort({ date: -1 }),
          Vitals.find({ patient: patientId }).sort({ createdAt: -1 }),
          Appointment.find({ patientId, doctorId }).sort({ scheduledAt: -1 }),
        ]);
      return { symptomLogs, prescriptions, vitals, appointments };
    })(),
  ]);

  if (!patientRes) throw new ApiError(404, "Patient not found");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        patient: patientRes,
        ...bundle,
      },
      "Summary data ready"
    )
  );
});

const getRecentDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("-password -refreshToken");
  res
    .status(200)
    .json(new ApiResponse(200, doctors, "Recent doctors fetched successfully"));
});

const getDoctorById = asyncHandler(async (req, res) => {
  console.log("req.user : ", req.user);
  const { id } = req.params;

  if (id === "me") {
    if (req.user) {
      id = req.user._id;
    }
  }
  if (!id) {
    throw new ApiError(
      400,
      "Validation failed: doctor id is not passed in the params"
    );
  }
  const doctor = await Doctor.findById(id).select("-password -refreshToken");

  if (!doctor) {
    throw new ApiError(404, `The doctor with id : ${id} doesn't exist`);
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, doctor, "Doctor with id is fetched successfully")
    );
});

const updateInfo = asyncHandler(async (req, res) => {
  console.log("req.body doctor profile update : ", req.body);
  const {
    fullname,
    email,
    phone,
    experience,
    about,
    specialization,
    qualifications,
    address,
    isAvailable,
  } = req.body;

  if (
    !fullname ||
    !email ||
    !experience ||
    !about ||
    !specialization ||
    !qualifications ||
    !phone ||
    !address ||
    !isAvailable
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const doctor = await Doctor.findById(req.user?._id); //we can use findbyandUpdate also.
  if (!doctor) {
    throw new ApiError(400, "doctor not found");
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
        experience,
        about,
        specialization,
        qualifications,
        phone,
        address,
        isAvailable,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedDoctor,
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

  const doctor = await Doctor.findById(req.user?._id);

  if (!doctor) {
    throw new ApiError(400, "Patient not found");
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
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
        updatedDoctor,
        "Profile picture updated successfully"
      )
    );
});

// PDF: Generate Patient Report
const generatePatientReportPdf = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id.toString() || req.user?.id;
  const { patientId } = req.params;
  console.log("patient id: ", doctorId, patientId);
  if (!doctorId) throw new ApiError(401, "Unauthorized");
  if (!patientId) throw new ApiError(400, "patientId required");

  // Fetch data
  const patient = await Patient.findOne({ _id: patientId, doctorId }).select(
    "-password -refreshToken"
  );
  console.log("patient :", patient);
  if (!patient) throw new ApiError(404, "Patient not found");

  const [symptomLogs, prescriptions, vitals, appointments] = await Promise.all([
    SymptomLog.find({ patientId }).sort({ date: -1 }),
    Prescription.find({ patientId, doctorId }).sort({ date: -1 }),
    Vitals.find({ patient: patientId }).sort({ createdAt: -1 }),
    Appointment.find({ patientId, doctorId }).sort({ scheduledAt: -1 }),
  ]);

  // Setup PDF
  const doc = new PDFDocument({ margin: 50 });
  const filename = `patient-${String(patient._id)}-report.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).text("Patient Health Report", { align: "center" });
  doc.moveDown();

  // Patient Info
  doc.fontSize(12).text(`Patient: ${patient.fullname}`);
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

  // Allergies / Conditions / Symptoms
  const listOrNA = (arr) => (arr && arr.length ? arr.join(", ") : "N/A");
  doc.text(`Allergies: ${listOrNA(patient.allergies)}`);
  doc.text(`Chronic Conditions: ${listOrNA(patient.chronicConditions)}`);
  doc.text(`Symptoms: ${listOrNA(patient.symptoms)}`);
  doc.moveDown();

  // Appointments
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

  // Prescriptions
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

  // Vitals
  doc.fontSize(14).text("Vitals", { underline: true });
  if (!vitals.length) {
    doc.fontSize(12).text("No vitals found");
  } else {
    vitals.forEach((v) => {
      doc
        .fontSize(12)
        .text(
          `- ${new Date(v.createdAt).toLocaleString()} | BP: ${
            v.bloodPressure || "N/A"
          } | Sugar: ${v.sugar || "N/A"}`
        );
    });
  }

  // Symptom Logs
  doc.addPage();
  doc.fontSize(14).text("Symptom Logs", { underline: true });
  if (!symptomLogs.length) {
    doc.fontSize(12).text("No symptom logs found");
  } else {
    symptomLogs.forEach((s) => {
      doc
        .fontSize(12)
        .text(
          `- ${new Date(s.date).toLocaleDateString()} | ${listOrNA(
            s.symptoms
          )} | Notes: ${s.notes || ""}`
        );
    });
  }

  doc.end();
});

// PDF: Generate Doctor Summary Report
const generateDoctorReportPdf = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id || req.user?.id;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  // Aggregate overview
  const [doctor, apptStats] = await Promise.all([
    Doctor.findById(doctorId).select("-password -refreshToken"),
    Appointment.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  if (!doctor) throw new ApiError(404, "Doctor not found");

  // Unique patients count
  const uniquePatients = await Appointment.distinct("patientId", {
    doctorId: new mongoose.Types.ObjectId(doctorId),
  });

  // Setup PDF
  const doc = new PDFDocument({ margin: 50 });
  const filename = `doctor-${String(doctor._id)}-summary.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).text("Doctor Summary Report", { align: "center" });
  doc.moveDown();

  // Doctor info
  doc.fontSize(12).text(`Doctor: ${doctor.fullname}`);
  doc.text(`Email: ${doctor.email}`);
  if (doctor.specialization)
    doc.text(`Specialization: ${doctor.specialization}`);
  if (doctor.experience) doc.text(`Experience: ${doctor.experience}`);
  if (doctor.phone) doc.text(`Phone: ${doctor.phone}`);
  doc.moveDown();

  // Statistics
  doc.fontSize(14).text("Overview", { underline: true });
  doc.fontSize(12).text(`Unique patients: ${uniquePatients.length}`);
  const statusToCount = apptStats.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});
  const allStatuses = [
    "pending",
    "approved",
    "active",
    "completed",
    "cancelled",
  ];
  allStatuses.forEach((st) => {
    doc.text(`${st}: ${statusToCount[st] || 0}`);
  });

  // Recent appointments
  const recentAppts = await Appointment.find({ doctorId })
    .populate("patientId", "fullname email")
    .sort({ scheduledAt: -1 })
    .limit(20);

  doc.moveDown();
  doc.fontSize(14).text("Recent Appointments", { underline: true });
  if (!recentAppts.length) {
    doc.fontSize(12).text("No appointments found");
  } else {
    recentAppts.forEach((a) => {
      const patientName = a.patientId?.fullname || String(a.patientId);
      doc
        .fontSize(12)
        .text(
          `- ${new Date(a.scheduledAt).toLocaleString()} | ${
            a.status
          } | ${patientName} | ${a.reason || ""}`
        );
    });
  }

  doc.end();
});

// =============
// Email Verify
// =============
const resendDoctorVerificationCode = asyncHandler(async (req, res) => {
  const email = req.body.email;
  console.log("req body in resend: ", req.body);
  console.log("email in resend code: ", email);
  if (!email) throw new ApiError(400, "Email is required");

  const doctor = await Doctor.findOne({ email });
  if (!doctor) throw new ApiError(404, "No account found for this email");
  if (doctor.emailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email already verified"));
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

  doctor.emailVerificationCodeHash = codeHash;
  doctor.emailVerificationExpiresAt = codeExpiry;
  await doctor.save({ validateBeforeSave: false });

  try {
    const html = verificationCodeTemplate({
      name: doctor.fullname,
      code,
      appUrl: process.env.APP_URL,
    });
    await sendEmail({ to: doctor.email, subject: "Verify your email", html });
  } catch (emailErr) {
    console.error("Failed to send verification email:", emailErr);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification code sent"));
});

const verifyDoctorEmail = asyncHandler(async (req, res) => {
  console.log("req.body : ", req.body);
  const { email, code } = req.body;
  if (!email || !code) throw new ApiError(400, "Email and code are required");

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const doctor = await Doctor.findOne({ email }).select(
    "+emailVerificationCodeHash +emailVerificationExpiresAt"
  );
  if (!doctor) throw new ApiError(404, "No account found for this email");

  if (doctor.emailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email already verified"));
  }

  if (
    !doctor.emailVerificationCodeHash ||
    !doctor.emailVerificationExpiresAt ||
    doctor.emailVerificationCodeHash !== codeHash ||
    new Date() > new Date(doctor.emailVerificationExpiresAt)
  ) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  doctor.emailVerified = true;
  doctor.emailVerificationCodeHash = null;
  doctor.emailVerificationExpiresAt = null;
  await doctor.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

export {
  registerDoctor,
  loginDoctor,
  refreshAccessToken,
  getRecentDoctors,
  addPatient,
  getPatientsForDoctor,
  getPatientDetailsBundle,
  addVitalsForPatient,
  addPrescriptionForPatient,
  createAppointmentForPatient,
  endAppointment,
  getPatientSummary,
  getDoctorById,
  updateInfo,
  updateProfilePic,
  getPatientById,
  generatePatientReportPdf,
  generateDoctorReportPdf,
  resendDoctorVerificationCode,
  verifyDoctorEmail,
};
