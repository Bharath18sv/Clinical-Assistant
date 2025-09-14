"use client";

import { useContext, useEffect, useState } from "react";
import {
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Briefcase,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function DoctorProfile() {
  const { user, authLoading } = useContext(AuthContext);
  console.log("user.user :", user.user);
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load doctor data
  useEffect(() => {
    if (!authLoading && user?.user) {
      setProfile(user?.user);
      setEditedProfile(user?.user);
    }
  }, [user, authLoading]);

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    alert("Profile updated successfully!");
    // TODO: API.put(`/doctors/${profile._id}`, editedProfile)
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setEditedProfile((prev) => ({ ...prev, [field]: items }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-8 py-8">
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6 mb-6 lg:mb-0">
                <div className="relative">
                  <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm shadow-lg">
                    {profile?.profilePic ? (
                      <img
                        src={profile?.profilePic}
                        alt="Profile"
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Dr. {profile?.fullname || "Doctor"}
                  </h1>
                  <p className="text-blue-100 text-lg">Specialist Doctor</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-blue-100 text-sm">
                      Member since {formatDate(profile?.createdAt)}
                    </span>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        profile?.isApproved
                          ? "bg-green-500/20 text-green-200"
                          : "bg-red-500/20 text-red-200"
                      }`}
                    >
                      {profile?.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="group bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <Edit className="h-5 w-5" />
                  <span className="font-semibold">Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Info className="w-6 h-6 text-indigo-600" />
                Doctor Information
              </h2>

              {/* Full Name, Email, Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile?.fullname || ""}
                      onChange={(e) =>
                        handleInputChange("fullname", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                    />
                  ) : (
                    <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium">
                      {profile?.fullname}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile?.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                    />
                  ) : (
                    <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {profile?.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile?.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                    />
                  ) : (
                    <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {profile?.phone}
                    </p>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Experience (Years)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProfile?.experience || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "experience",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                    />
                  ) : (
                    <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium">
                      {profile?.experience} years
                    </p>
                  )}
                </div>
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  About
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile?.about || ""}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                    rows="3"
                  />
                ) : (
                  <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium">
                    {profile?.about}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Specializations & Qualifications */}
          <div className="xl:col-span-1 space-y-6">
            {/* Specialization */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Specialization
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile?.specialization?.join(", ") || ""}
                  onChange={(e) =>
                    handleArrayChange("specialization", e.target.value)
                  }
                  placeholder="Enter specializations separated by commas"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                  rows="2"
                />
              ) : (
                <div className="space-y-2">
                  {profile?.specialization?.length ? (
                    profile?.specialization.map((s, i) => (
                      <p
                        key={i}
                        className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-blue-800 font-medium"
                      >
                        {s}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Not specified</p>
                  )}
                </div>
              )}
            </div>

            {/* Qualifications */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Qualifications
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile?.qualifications?.join(", ") || ""}
                  onChange={(e) =>
                    handleArrayChange("qualifications", e.target.value)
                  }
                  placeholder="Enter qualifications separated by commas"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                  rows="2"
                />
              ) : (
                <div className="space-y-2">
                  {profile?.qualifications?.length ? (
                    profile?.qualifications.map((q, i) => (
                      <p
                        key={i}
                        className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-indigo-800 font-medium"
                      >
                        {q}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Not specified</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-semibold"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 font-semibold"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
