"use client";
import React from "react";
import {
  User,
  Doctor,
  Patient,
  Admin,
  isDoctor,
  isPatient,
  isAdmin,
} from "@/utils/types";

// Status badge component for doctors
export const DoctorStatusBadge = ({ doctor }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
        doctor.status
      )}`}
    >
      {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
    </span>
  );
};

// Availability badge for doctors
export const DoctorAvailabilityBadge = ({ doctor }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      doctor.isAvailable
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {doctor.isAvailable ? "Available" : "Unavailable"}
  </span>
);

// User info card component
export const UserInfoCard = ({ user }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <img
          className="h-16 w-16 rounded-full object-cover"
          src={user.profilePic || "/default-avatar.png"}
          alt={user.fullname}
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{user.fullname}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>

          {isDoctor(user) && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                Specialization: {user.specialization.join(", ")}
              </p>
              <div className="flex items-center space-x-2">
                <DoctorStatusBadge doctor={user} />
                <DoctorAvailabilityBadge doctor={user} />
              </div>
            </div>
          )}

          {isPatient(user) && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {user.age} years old, {user.gender}
              </p>
              {user.chronicConditions.length > 0 && (
                <p className="text-sm text-gray-600">
                  Conditions: {user.chronicConditions.join(", ")}
                </p>
              )}
            </div>
          )}

          {isAdmin(user) && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Role:{" "}
                {user.role === "super_admin"
                  ? "Super Administrator"
                  : "Administrator"}
              </p>
              {user.lastLogin && (
                <p className="text-sm text-gray-500">
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Role-specific dashboard welcome component
export const DashboardWelcome = ({ user }) => {
  const getWelcomeMessage = () => {
    if (isDoctor(user)) {
      return {
        title: `Welcome back, Dr. ${user.fullname}`,
        subtitle: `You have ${user.patients.length} patients under your care`,
        additionalInfo:
          user.status === "pending"
            ? "Your account is pending approval"
            : `Specialization: ${user.specialization.join(", ")}`,
      };
    } else if (isPatient(user)) {
      return {
        title: `Hello, ${user.fullname}`,
        subtitle: "Here's your health overview",
        additionalInfo:
          user.chronicConditions.length > 0
            ? `Managing ${user.chronicConditions.length} condition(s)`
            : "No chronic conditions recorded",
      };
    } else if (isAdmin(user)) {
      return {
        title: `Welcome, ${user.fullname}`,
        subtitle:
          user.role === "super_admin"
            ? "System Overview"
            : "Administrative Dashboard",
        additionalInfo: `Access level: ${
          user.role === "super_admin" ? "Full System Access" : "Standard Admin"
        }`,
      };
    }
    return { title: "Welcome", subtitle: "", additionalInfo: "" };
  };

  const welcome = getWelcomeMessage();

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{welcome.title}</h1>
      <p className="text-gray-600 mt-1">{welcome.subtitle}</p>
      {welcome.additionalInfo && (
        <p className="text-sm text-gray-500 mt-2">{welcome.additionalInfo}</p>
      )}
    </div>
  );
};
