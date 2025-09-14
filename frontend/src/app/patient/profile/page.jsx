"use client";

import { useContext, useEffect, useState } from "react";
import {
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  Activity,
  Shield,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

export default function PatientProfile() {
  const { user, authLoading } = useContext(AuthContext);

  const [profile, setProfile] = useState(null); // current profile
  const [editedProfile, setEditedProfile] = useState(null); // copy for editing
  const [isEditing, setIsEditing] = useState(false);

  // Load patient data when user is available
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
    // TODO: send `editedProfile` to backend using API.put/post
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

  if (authLoading || !profile) {
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
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity=0.05'%3E%3Ccircle cx='30' cy='30' r='8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

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
                    {console.log("profile : ", profile)}
                    {profile.fullname}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Personal Health Profile
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-blue-100 text-sm">
                      Member since {formatDate(profile.createdAt)}
                    </span>
                    <span className="text-green-200 text-sm bg-green-500/20 px-3 py-1 rounded-full">
                      Active
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
          {/* Personal Information */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.fullname || ""}
                      onChange={(e) =>
                        handleInputChange("fullname", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                      <p className="text-gray-900 font-medium">
                        {profile.fullname || "-"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900 font-medium">
                        {profile.email || "-"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900 font-medium">
                        {profile.phone || "-"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Age
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProfile.age || ""}
                      onChange={(e) =>
                        handleInputChange("age", parseInt(e.target.value))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900 font-medium">
                        {profile.age ? `${profile.age} years old` : "-"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      value={editedProfile.gender || ""}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 inline-block">
                      <p className="text-gray-900 font-medium">
                        {profile.gender || "-"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Address Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Street */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Street Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.address?.street || ""}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <p className="text-gray-900 font-medium">
                          {profile.address?.street || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.address?.city || ""}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <p className="text-gray-900 font-medium">
                          {profile.address?.city || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.address?.state || ""}
                        onChange={(e) =>
                          handleAddressChange("state", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <p className="text-gray-900 font-medium">
                          {profile.address?.state || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ZIP */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      ZIP Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.address?.zip || ""}
                        onChange={(e) =>
                          handleAddressChange("zip", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <p className="text-gray-900 font-medium">
                          {profile.address?.zip || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Country
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.address?.country || ""}
                        onChange={(e) =>
                          handleAddressChange("country", e.target.value)
                        }
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 inline-block">
                        <p className="text-gray-900 font-medium">
                          {profile.address?.country || "-"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Allergies */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                Allergies
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile.allergies?.join(", ") || ""}
                  onChange={(e) =>
                    handleArrayChange("allergies", e.target.value)
                  }
                  placeholder="Enter allergies separated by commas"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  rows="3"
                />
              ) : (
                <div className="space-y-3">
                  {profile.allergies && profile.allergies.length > 0 ? (
                    profile.allergies.map((allergy, index) => (
                      <div
                        key={index}
                        className="bg-red-50 border border-red-200 rounded-xl px-4 py-2"
                      >
                        <p className="text-red-800 font-medium">{allergy}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No known allergies</p>
                  )}
                </div>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <Heart className="w-5 h-5 text-orange-600" />
                </div>
                Chronic Conditions
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile.chronicConditions?.join(", ") || ""}
                  onChange={(e) =>
                    handleArrayChange("chronicConditions", e.target.value)
                  }
                  placeholder="Enter conditions separated by commas"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  rows="3"
                />
              ) : (
                <div className="space-y-3">
                  {profile.chronicConditions &&
                  profile.chronicConditions.length > 0 ? (
                    profile.chronicConditions.map((condition, index) => (
                      <div
                        key={index}
                        className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2"
                      >
                        <p className="text-orange-800 font-medium">
                          {condition}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">
                      No chronic conditions
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Current Symptoms */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                Current Symptoms
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile.symptoms?.join(", ") || ""}
                  onChange={(e) =>
                    handleArrayChange("symptoms", e.target.value)
                  }
                  placeholder="Enter symptoms separated by commas"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows="3"
                />
              ) : (
                <div className="space-y-3">
                  {profile.symptoms && profile.symptoms.length > 0 ? (
                    profile.symptoms.map((symptom, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2"
                      >
                        <p className="text-blue-800 font-medium">{symptom}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No current symptoms</p>
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
