import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoosePaginate from "mongoose-paginate-v2";
import { SPECIALIZATION } from "../constants.js";
import { QUALIFICATIONS } from "../constants.js";

const doctorSchema = new Schema(
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
    profilePic: {
      type: String, //cloudinary url
    },
    specialization: {
      type: [String],
      enum: SPECIALIZATION,
      required: true,
    },
    qualifications: {
      type: [String], // e.g. ["MBBS", "MD"]
      enum: QUALIFICATIONS,
      required: true,
    },
    experience: {
      type: Number, // in years
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    patients: [
      {
        type: Schema.Types.ObjectId,
        ref: "Patient", // Reference to patient model
      },
    ],
    about: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    isApproved: {
      //for admin approval
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: {
      type: Date,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, default: "Karnataka", trim: true },
      zip: { type: String, trim: true },
      country: { type: String, default: "India", trim: true },
    },
    rejectionReason: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//only hash the password if it is modified(hashes when created also, because creation != modification)
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//a method for checking the password
doctorSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

//methods for generating tokens
doctorSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname,
      role: "doctor",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

doctorSchema.methods.generateRefreshToken = async function () {
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

// Add pagination plugin
doctorSchema.plugin(mongoosePaginate);

export const Doctor = mongoose.model("Doctor", doctorSchema);
