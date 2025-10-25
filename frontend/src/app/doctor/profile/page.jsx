"use client";
import { useContext, useEffect, useState } from "react";
import {
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  Clock,
  FileText,
  MapPin,
  Camera,
  Shield,
  UserCheck,
  Briefcase,
  BookOpen,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import API, { downloadDoctorReportPdf, updateDoctorProfile } from "@/utils/api";
import toast from "react-hot-toast";
import { SPECIALIZATION, QUALIFICATIONS } from "@/data/constant";

export default function DoctorProfile() {
  const { user, authLoading, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.user) {
      setProfile(user.user);
      setEditedProfile(user.user);
    }
  }, [user, authLoading]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setEditedProfile(profile);
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

  const handleSpecializationToggle = (spec) => {
    const current = editedProfile?.specialization || [];
    const updated = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    handleInputChange("specialization", updated);
  };

  const handleQualificationToggle = (qual) => {
    const current = editedProfile?.qualifications || [];
    const updated = current.includes(qual)
      ? current.filter((q) => q !== qual)
      : [...current, qual];
    handleInputChange("qualifications", updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let experienceValue = editedProfile?.experience;
      if (
        experienceValue === "" ||
        experienceValue === undefined ||
        experienceValue === null
      ) {
        experienceValue = profile?.experience || 0;
      } else if (!isNaN(Number(experienceValue))) {
        experienceValue = Number(experienceValue);
      } else {
        experienceValue = profile?.experience || 0;
      }

      const updateData = {
        fullname: editedProfile.fullname,
        email: editedProfile.email,
        phone: editedProfile.phone,
        experience: experienceValue,
        about: editedProfile.about,
        specialization: editedProfile.specialization,
        qualifications: editedProfile.qualifications,
        address: editedProfile.address,
        isAvailable: editedProfile.isAvailable,
      };

      const response = await updateDoctorProfile(updateData);
      if (response.success) {
        const updatedProfile = response.data || editedProfile;

        // Update local states
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);

        // ✅ UPDATE AUTH CONTEXT - This is the key fix!
        setUser({
          ...user,
          user: updatedProfile,
        });

        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        const updatedPic = response.data.data.profilePic;

        // Update local states
        setProfile((prev) => ({ ...prev, profilePic: updatedPic }));
        setEditedProfile((prev) => ({ ...prev, profilePic: updatedPic }));

        // ✅ UPDATE AUTH CONTEXT for profile picture
        setUser({
          ...user,
          user: {
            ...user.user,
            profilePic: updatedPic,
          },
        });

        toast.success("Profile picture updated successfully!");
        setProfilePicFile(null);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile picture"
      );
    } finally {
      setIsUpdatingPic(false);
    }
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || styles.pending;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
              {/* Profile Picture Section */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl bg-white/10">
                  {profile?.profilePic ? (
                    <img
                      src={profile.profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/20">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg transition-colors">
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </label>
                {profilePicFile && (
                  <button
                    onClick={handleProfilePicUpdate}
                    disabled={isUpdatingPic}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg transition-colors disabled:opacity-50"
                  >
                    {isUpdatingPic ? (
                      <Loader2 className="w-3 h-3 animate-spin inline" />
                    ) : (
                      "Update"
                    )}
                  </button>
                )}
              </div>

              {/* Doctor Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                    Dr. {profile?.fullname || "Doctor"}
                  </h1>
                  <Shield className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                </div>
                <p className="text-blue-100 text-base sm:text-lg mb-3">
                  {profile?.specialization?.join(", ") || "Specialist Doctor"}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-blue-100 text-sm">
                    Member since {formatDate(profile?.createdAt)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                      profile?.status
                    )}`}
                  >
                    {profile?.status || "Pending"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      profile?.isAvailable
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {profile?.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {!isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => downloadDoctorReportPdf()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200 backdrop-blur-sm font-medium"
                  >
                    <FileText size={18} />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium shadow-lg"
                  >
                    <Edit size={18} />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Personal Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Personal Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.fullname || ""}
                        onChange={(e) =>
                          handleInputChange("fullname", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter full name"
                      />
                    ) : (
                      <div className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 font-medium text-gray-800">
                        {profile?.fullname || "-"}
                      </div>
                    )}
                  </div>

                  {/* Email - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 truncate">
                        {profile?.email || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile?.phone || ""}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    ) : (
                      <div className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-800">
                          {profile?.phone || "-"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (Years)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={
                          editedProfile?.experience === undefined
                            ? ""
                            : editedProfile?.experience
                        }
                        onChange={(e) =>
                          handleInputChange("experience", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Years of experience"
                      />
                    ) : (
                      <div className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-800">
                          {profile?.experience || 0} years
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Availability Status
                  </label>
                  {isEditing ? (
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange(
                            "isAvailable",
                            !editedProfile?.isAvailable
                          )
                        }
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          editedProfile?.isAvailable
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                            editedProfile?.isAvailable
                              ? "translate-x-9"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-sm font-medium text-gray-700">
                        {editedProfile?.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                        profile?.isAvailable
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="font-medium">
                        {profile?.isAvailable
                          ? "Available for appointments"
                          : "Currently unavailable"}
                      </span>
                    </div>
                  )}
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile?.about || ""}
                      onChange={(e) =>
                        handleInputChange("about", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      rows={4}
                      placeholder="Write about yourself, your expertise, and experience..."
                    />
                  ) : (
                    <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 whitespace-pre-wrap">
                      {profile?.about || "No information provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Address Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["street", "city", "state", "zip", "country"].map((field) => (
                  <div
                    key={field}
                    className={field === "street" ? "sm:col-span-2" : ""}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {field}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.address?.[field] || ""}
                        onChange={(e) =>
                          handleAddressChange(field, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={`Enter ${field}`}
                      />
                    ) : (
                      <div className="border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-800">
                        {profile?.address?.[field] || "-"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Professional Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Account Status
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                      profile?.status
                    )}`}
                  >
                    {profile?.status || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Approved</span>
                  {profile?.isApproved ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Specialization Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Specialization <span className="text-red-500">*</span>
                </h3>
              </div>

              {isEditing ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {SPECIALIZATION.map((spec) => (
                    <label
                      key={spec}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={editedProfile?.specialization?.includes(spec)}
                        onChange={() => handleSpecializationToggle(spec)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {profile?.specialization?.length ? (
                    profile.specialization.map((s, i) => (
                      <div
                        key={i}
                        className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-700 font-medium"
                      >
                        {s}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      Not specified
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Qualifications Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Qualifications <span className="text-red-500">*</span>
                </h3>
              </div>

              {isEditing ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {QUALIFICATIONS.map((qual) => (
                    <label
                      key={qual}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={editedProfile?.qualifications?.includes(qual)}
                        onChange={() => handleQualificationToggle(qual)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{qual}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {profile?.qualifications?.length ? (
                    profile.qualifications.map((q, i) => (
                      <div
                        key={i}
                        className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 text-indigo-700 font-medium"
                      >
                        {q}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      Not specified
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
