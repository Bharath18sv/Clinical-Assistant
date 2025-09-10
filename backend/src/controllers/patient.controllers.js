import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { Patient } from "../models/patient.models.js";
import jwt from "jsonwebtoken";

const registerPatient = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    fullname,
    gender,
    age,
    phone,
    address,
    chronicConditions,
    allergies,
    symptoms,
  } = req.body;

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
  const PatientAlreadyExist = await Patient.findOne({
    email,
  });

  if (PatientAlreadyExist) {
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

  //create the patient/user
  try {
    const newPatient = await Patient.create({
      email,
      fullname,
      password,
      profilePic: profilePic?.url || "",
      gender,
      age,
      phone,
      address,
      chronicConditions: chronicConditions || [],
      allergies: allergies || [],
      symptoms: symptoms || [],
    });

    const createdPatient = await Patient.findById(newPatient.id).select(
      "-password -refreshToken"
    );

    if (!createdPatient) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, createdPatient, "User registered Successfully")
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
  const { fullname, gender, age, phone, address } = req.body;

  if (!fullname || !gender || !age || !phone || !address) {
    throw new ApiError(400, "All fields are required");
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
        gender,
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
};
