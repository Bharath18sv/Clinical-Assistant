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
  MapPin,
  Camera,
  Clock,
  UserCheck,
  FileText,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import API from "@/utils/api";
import toast from "react-hot-toast";

export default function DoctorProfile() {
  const { user, authLoading, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);

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

  const handleSave = async () => {
    try {
      // Prepare data for API - exclude fields that shouldn't be updated via info endpoint
      const updateData = {
        fullname: editedProfile.fullname,
        email: editedProfile.email,
        phone: editedProfile.phone,
        experience: editedProfile.experience,
        about: editedProfile.about,
        specialization: editedProfile.specialization,
        qualifications: editedProfile.qualifications,
        address: editedProfile.address,
        isAvailable: editedProfile.isAvailable,
      };

      const response = await API.post("/doctors/updateInfo", updateData);

      if (response.data.success) {
        setProfile(editedProfile);
        setUser({ ...user, user: editedProfile }); // Update context
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleArrayChange = (field, value) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setEditedProfile((prev) => ({ ...prev, [field]: items }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Profile picture must be less than 5MB");
        return;
      }
      setProfilePicFile(file);
    }
  };

  const handleProfilePicUpdate = async () => {
    if (!profilePicFile) return;

    setIsUpdatingPic(true);
    try {
      const formData = new FormData();
      formData.append("ProfilePicture", profilePicFile);

      const response = await API.post("/doctors/updateProfilePic", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const updatedUser = {
          ...user,
          user: { ...user.user, profilePic: response.data.data.profilePic },
        };
        setUser(updatedUser);
        setProfile((prev) => ({
          ...prev,
          profilePic: response.data.data.profilePic,
        }));
        setEditedProfile((prev) => ({
          ...prev,
          profilePic: response.data.data.profilePic,
        }));
        setProfilePicFile(null);
        toast.success("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile picture"
      );
    } finally {
      setIsUpdatingPic(false);
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-200";
      case "pending":
        return "bg-yellow-500/20 text-yellow-200";
      case "rejected":
        return "bg-red-500/20 text-red-200";
      case "suspended":
        return "bg-gray-500/20 text-gray-200";
      default:
        return "bg-gray-500/20 text-gray-200";
    }
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

                  {/* Profile Picture Upload */}
                  <div className="mt-4">
                    <label className="cursor-pointer bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 text-sm">
                      <Camera className="w-4 h-4" />
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        className="hidden"
                      />
                    </label>
                    {profilePicFile && (
                      <button
                        onClick={handleProfilePicUpdate}
                        disabled={isUpdatingPic}
                        className="mt-2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isUpdatingPic ? "Updating..." : "Update Photo"}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Dr. {profile?.fullname || "Doctor"}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {profile?.specialization?.join(", ") || "Specialist Doctor"}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-blue-100 text-sm">
                      Member since {formatDate(profile?.createdAt)}
                    </span>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${getStatusColor(
                        profile?.status
                      )}`}
                    >
                      {profile?.status || "pending"}
                    </span>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        profile?.isAvailable
                          ? "bg-green-500/20 text-green-200"
                          : "bg-red-500/20 text-red-200"
                      }`}
                    >
                      {profile?.isAvailable ? "Available" : "Unavailable"}
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

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Full Name *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile?.fullname || ""}
                      onChange={(e) =>
                        handleInputChange("fullname", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  ) : (
                    <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium">
                      {profile?.fullname || "-"}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Email *
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile?.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  ) : (
                    <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {profile?.email || "-"}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile?.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {profile?.phone || "-"}
                    </p>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Experience (Years)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editedProfile?.experience || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "experience",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {profile?.experience || 0} years
                    </p>
                  )}
                </div>

                {/* Availability */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Availability Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editedProfile?.isAvailable || false}
                      onChange={(e) =>
                        handleInputChange(
                          "isAvailable",
                          e.target.value === "true"
                        )
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={true}>Available</option>
                      <option value={false}>Unavailable</option>
                    </select>
                  ) : (
                    <p
                      className={`rounded-xl px-4 py-3 border font-medium flex items-center gap-2 ${
                        profile?.isAvailable
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      {profile?.isAvailable
                        ? "Available for appointments"
                        : "Currently unavailable"}
                    </p>
                  )}
                </div>
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  About *
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile?.about || ""}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    required
                  />
                ) : (
                  <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 font-medium">
                    {profile?.about || "-"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.address?.street || ""}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        {profile?.address?.street || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.address?.city || ""}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        {profile?.address?.city || "-"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.address?.state || "Karnataka"}
                        onChange={(e) =>
                          handleAddressChange("state", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        {profile?.address?.state || "Karnataka"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.address?.zip || ""}
                        onChange={(e) =>
                          handleAddressChange("zip", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        {profile?.address?.zip || "-"}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.address?.country || "India"}
                        onChange={(e) =>
                          handleAddressChange("country", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        {profile?.address?.country || "India"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Professional Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Status Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Status Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      profile?.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : profile?.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : profile?.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {profile?.status || "pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Approved:
                  </span>
                  <span
                    className={`text-sm ${
                      profile?.isApproved ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {profile?.isApproved ? "Yes" : "No"}
                  </span>
                </div>
                {profile?.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Approved At:
                    </span>
                    <span className="text-sm text-gray-800">
                      {formatDate(profile.approvedAt)}
                    </span>
                  </div>
                )}
                {profile?.rejectionReason && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Rejection Reason:
                    </span>
                    <p className="text-sm text-red-600 mt-1">
                      {profile.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Specialization */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Specialization *
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile?.specialization?.join(", ") || ""}
                  onChange={(e) =>
                    handleArrayChange("specialization", e.target.value)
                  }
                  placeholder="Enter specializations separated by commas"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
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
                Qualifications *
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile?.qualifications?.join(", ") || ""}
                  onChange={(e) =>
                    handleArrayChange("qualifications", e.target.value)
                  }
                  placeholder="Enter qualifications separated by commas"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
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

            {/* Patient Count */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Patients
              </h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {profile?.patients?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Total Patients</p>
              </div>
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
