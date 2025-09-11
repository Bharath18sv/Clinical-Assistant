import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.models.js";
import { Doctor } from "../models/doctor.models.js";
import { Patient } from "../models/patient.models.js";
import { Appointment } from "../models/appointments.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Admin Authentication
const registerAdmin = asyncHandler(async (req, res) => {
  const { email, password, fullname } = req.body;

  if ([email, password, fullname].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedAdmin = await Admin.findOne({
    $or: [{ email }],
  });

  if (existedAdmin) {
    throw new ApiError(409, "Admin with email already exists");
  }

  const admin = await Admin.create({
    email,
    password,
    fullname,
  });

  const createdAdmin = await Admin.findById(admin._id).select("-password");

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering the admin");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin registered successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!admin.isActive) {
    throw new ApiError(401, "Admin account is deactivated");
  }

  const accessToken = await admin.generateAccessToken();
  const refreshToken = await admin.generateRefreshToken();

  admin.refreshToken = refreshToken;
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const loggedInAdmin = await Admin.findById(admin._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict", // prevent CSRF
    maxAge: 1000 * 60 * 60, // 1h
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInAdmin,
          accessToken,
          refreshToken,
          role: "admin",
        },
        "Admin logged in successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out"));
});

// Get current admin profile
const getCurrentAdmin = asyncHandler(async (req, res) => {
  // req.admin is set by verifyAdminJWT
  if (!req.admin) {
    throw new ApiError(401, "Unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, req.admin, "Current admin fetched"));
});

// Doctor Management
const addDoctor = asyncHandler(async (req, res) => {
  console.log("Request body in addDoctor:", req.body);
  console.log("profilePicture from frontend request):", req.file);
  const {
    email,
    password,
    fullname,
    specialization,
    qualifications,
    experience,
    about,
    phone,
  } = req.body;

  if (
    !email ||
    !password ||
    !fullname ||
    !specialization ||
    !qualifications ||
    !about
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Check if doctor already exists
  const existingDoctor = await Doctor.findOne({ email });
  if (existingDoctor) {
    throw new ApiError(409, "Doctor with this email already exists");
  }
  //upload image to cloudinary
  let profilePic;
  if (req.file) {
    try {
      profilePic = await uploadOnCloudinary(req.file.path);
      console.log("Profile picture uploaded successfully");
    } catch (error) {
      console.log("profile pic upload failed", error);
      throw new ApiError(500, "Failed to upload Profile picture");
    }
  }

  // Create new doctor
  const doctor = await Doctor.create({
    email,
    password,
    fullname,
    specialization,
    qualifications,
    experience: experience || 0,
    about,
    phone,
    addedBy: req.admin._id,
    profilePicture: profilePic ? profilePic.url : undefined,
  });

  const createdDoctor = await Doctor.findById(doctor._id).select("-password");
  console.log("new doctor created", createdDoctor);

  if (!createdDoctor) {
    throw new ApiError(500, "Something went wrong while creating the doctor");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdDoctor, "Doctor added successfully"));
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search, isAvailable } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (typeof isAvailable !== "undefined") {
    query.isAvailable = isAvailable === "true";
  }

  if (search) {
    query.$or = [
      { fullname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: "addedBy", select: "fullname email" },
      { path: "approvedBy", select: "fullname email" },
    ],
  };

  const doctors = await Doctor.paginate(query, options);

  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
});

// Appointments Management
const getAllAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, doctorId, patientId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [total, items] = await Promise.all([
    Appointment.countDocuments(query),
    Appointment.find(query)
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({ path: "doctorId", select: "fullname email specialization" })
      .populate({ path: "patientId", select: "fullname email" }),
  ]);

  const result = {
    totalDocs: total,
    limit: parseInt(limit),
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    docs: items,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Appointments fetched successfully"));
});

const getDoctorById = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId)
    .select("-password")
    .populate("addedBy", "fullname email")
    .populate("approvedBy", "fullname email");

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor fetched successfully"));
});

const updateDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const updateData = req.body;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Remove sensitive fields from update
  delete updateData.password;
  delete updateData.email; // Email should not be changed after creation

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    doctorId,
    {
      $set: updateData,
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDoctor, "Doctor updated successfully"));
});

const approveDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected", "suspended"].includes(status)) {
    throw new ApiError(
      400,
      "Invalid status. Must be approved, rejected, or suspended"
    );
  }

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const updateData = {
    status,
    isApproved: status === "approved",
  };

  if (status === "approved") {
    updateData.approvedBy = req.admin._id;
    updateData.approvedAt = new Date();
  } else if (status === "rejected" && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
    new: true,
  }).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDoctor, `Doctor ${status} successfully`));
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Check if doctor has patients
  if (doctor.patients && doctor.patients.length > 0) {
    throw new ApiError(400, "Cannot delete doctor with assigned patients");
  }

  await Doctor.findByIdAndDelete(doctorId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Doctor deleted successfully"));
});

// Dashboard Statistics
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalDoctors = await Doctor.countDocuments();
  const approvedDoctors = await Doctor.countDocuments({ status: "approved" });
  const pendingDoctors = await Doctor.countDocuments({ status: "pending" });
  const totalPatients = await Patient.countDocuments();
  const totalAdmins = await Admin.countDocuments();

  const recentDoctors = await Doctor.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("fullname email status createdAt");

  const recentPatients = await Patient.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("fullname email createdAt");

  const stats = {
    totalDoctors,
    approvedDoctors,
    pendingDoctors,
    totalPatients,
    totalAdmins,
    recentDoctors,
    recentPatients,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Dashboard statistics fetched successfully")
    );
});

export {
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
};
