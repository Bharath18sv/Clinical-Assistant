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

//*** do this later **

// const isAvailable = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     throw new ApiError("Doctor mail is required");
//   }
//   const doctor = await Doctor.findOne({ email });
// });

const addPatient = asyncHandler(async (req, res) => {
  const {
    fullname,
    email,
    password,
    gender,
    age,
    phone,
    address,
    chronicConditions,
    allergies,
    symptoms,
    doctorId,
  } = req.body;

  const patient = await Patient.create({
    fullname,
    email,
    password,
    gender,
    age,
    phone,
    address,
    chronicConditions,
    allergies,
    symptoms,
    doctorId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, patient, "Patient created successfully"));
});

// Get all patients for the authenticated doctor
const getPatientsForDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.user?._id || req.user?.id;
  if (!doctorId) throw new ApiError(401, "Unauthorized");

  const patients = await Patient.find({ doctorId })
    .sort({ createdAt: -1 })
    .select("-password -refreshToken");
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { patients },
        "All patients of the doctor fetched successfully"
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

  // Simple ADR alerts: intersect patient allergies and prescribed med names
  const allergySet = new Set(
    (patient.allergies || []).map((a) => a.toLowerCase())
  );
  const adrAlerts = [];
  for (const p of prescriptions) {
    for (const med of p.medications || []) {
      const name = (med.name || "").toLowerCase();
      if (allergySet.has(name)) {
        adrAlerts.push({
          medication: med.name,
          message: `Potential ADR: patient allergic to ${med.name}`,
          date: p.date,
        });
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

  const { medications } = req.body;
  if (!Array.isArray(medications) || medications.length === 0) {
    throw new ApiError(400, "Medications required");
  }
  const prescription = await Prescription.create({
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
};
