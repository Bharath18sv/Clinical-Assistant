import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  SYMPTOMS,
  CHRONIC_CONDITIONS,
  ALLERGIES,
  GENDER,
} from "../constants.js";

const patientSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
 
    isActive: {
      type: Boolean, //active only if they're undergoing treatment
      default: true,
    },
    profilePic: {
      type: String, //cloudinary url
    },

    chronicConditions: {
      type: [String],
      enum: CHRONIC_CONDITIONS,
      default: [],
    },

    allergies: {
      type: [String],
      enum: ALLERGIES,
      default: [],
    },

    symptoms: {
      type: [String],
      enum: SYMPTOMS,
      default: [],
    },
    gender: {
      type: String,
      enum: GENDER,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, default: "Karnataka", trim: true },
      zip: { type: String, trim: true },
      country: { type: String, default: "India", trim: true },
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
      // required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//only hash the password if it is modified(hashes when created also, because creation != modification)
patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//a method for checking the password
patientSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

//methods for generating tokens
patientSchema.methods.generateAccessToken = async function () {
  //arrow function is not used because we cannot access this keyword
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname,
      role: "patient",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

patientSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Patient = mongoose.model("Patient", patientSchema);
