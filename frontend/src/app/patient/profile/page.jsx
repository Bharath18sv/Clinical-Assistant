"use client";

import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
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
  Loader2,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { updatePatientProfile } from "@/utils/api";
import toast from "react-hot-toast";

// Medical data constants
const ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Penicillin",
  "Aspirin",
  "Sulfa Drugs",
  "Latex",
  "Pollen",
  "Dust Mites",
  "Pet Dander",
  "Insect Stings",
  "Mold",
];

const CHRONIC_CONDITIONS = [
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Hypertension",
  "High Blood Pressure",
  "Heart Disease",
  "Asthma",
  "COPD",
  "Arthritis",
  "Osteoporosis",
  "Thyroid Disorder",
  "Kidney Disease",
  "Liver Disease",
  "Cancer",
  "Depression",
  "Anxiety",
  "Epilepsy",
  "Migraine",
  "Allergies",
];

const SYMPTOMS = [
  "Fever",
  "Cough",
  "Shortness of Breath",
  "Fatigue",
  "Headache",
  "Muscle Pain",
  "Joint Pain",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Abdominal Pain",
  "Chest Pain",
  "Dizziness",
  "Rash",
  "Sore Throat",
  "Runny Nose",
  "Loss of Appetite",
  "Weight Loss",
  "Weight Gain",
  "Insomnia",
];

// Helper function to create options for react-select
const createOptions = (items) => {
  return items.map((item) => ({ value: item, label: item }));
};

// Helper function to convert array to react-select format
const arrayToSelectValue = (array) => {
  if (!array || !Array.isArray(array)) return [];
  return array.map((item) => ({ value: item, label: item }));
};

// Helper function to convert react-select value to array
const selectValueToArray = (selectValue) => {
  if (!selectValue) return [];
  return selectValue.map((item) => item.value);
};

export default function PatientProfile() {
  const { user, authLoading, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
      age: "",
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
      allergies: [],
      chronicConditions: [],
      symptoms: [],
    },
  });

  // Load patient data when user is available
  useEffect(() => {
    if (!authLoading && user?.data?.user) {
      const userData = user.data.user;
      setProfile(userData);

      // Reset form with user data
      reset({
        fullname: userData.fullname || "",
        email: userData.email || "",
        phone: userData.phone || "",
        age: userData.age || "",
        address: {
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          state: userData.address?.state || "",
          zip: userData.address?.zip || "",
          country: userData.address?.country || "",
        },
        allergies: arrayToSelectValue(userData.allergies || []),
        chronicConditions: arrayToSelectValue(userData.chronicConditions || []),
        symptoms: arrayToSelectValue(userData.symptoms || []),
      });
    }
  }, [user, authLoading, reset]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);

    try {
      // Clean up the data before sending
      const dataToUpdate = {
        fullname: data.fullname.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || "",
        age: data.age ? parseInt(data.age) : null,
        address: {
          street: data.address.street?.trim() || "",
          city: data.address.city?.trim() || "",
          state: data.address.state?.trim() || "",
          zip: data.address.zip?.trim() || "",
          country: data.address.country?.trim() || "",
        },
        allergies: selectValueToArray(data.allergies),
        chronicConditions: selectValueToArray(data.chronicConditions),
        symptoms: selectValueToArray(data.symptoms),
      };
      console.log("Data to update:", dataToUpdate);
      const response = await updatePatientProfile(dataToUpdate);
      console.log("Profile update response:", response);

      if (response.data.message) {
        const updatedUser = response.data?.user || {
          ...profile,
          ...dataToUpdate,
        };
        setProfile(updatedUser);

        // Update the auth context with new user data
        if (setUser) {
          setUser({
            ...user,
            data: {
              ...user.data,
              user: updatedUser,
            },
          });
        }

        // Reset form with updated data
        reset({
          fullname: updatedUser.fullname || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          age: updatedUser.age || "",
          address: {
            street: updatedUser.address?.street || "",
            city: updatedUser.address?.city || "",
            state: updatedUser.address?.state || "",
            zip: updatedUser.address?.zip || "",
            country: updatedUser.address?.country || "",
          },
          allergies: arrayToSelectValue(updatedUser.allergies || []),
          chronicConditions: arrayToSelectValue(
            updatedUser.chronicConditions || []
          ),
          symptoms: arrayToSelectValue(updatedUser.symptoms || []),
        });

        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original profile data
    reset({
      fullname: profile.fullname || "",
      email: profile.email || "",
      phone: profile.phone || "",
      age: profile.age || "",
      address: {
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        zip: profile.address?.zip || "",
        country: profile.address?.country || "",
      },
      allergies: arrayToSelectValue(profile.allergies || []),
      chronicConditions: arrayToSelectValue(profile.chronicConditions || []),
      symptoms: arrayToSelectValue(profile.symptoms || []),
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm">
                      {profile?.profilePic ? (
                        <img
                          src={profile.profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-full">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-1">
                      {profile.fullname}
                    </h1>
                    <p className="text-blue-100 mb-3">
                      Personal Health Profile
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-blue-100">
                        Member since {formatDate(profile.createdAt)}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="bg-white text-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-lg"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h2>

                <div className="space-y-6">
                  {/* Basic Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <Controller
                          name="fullname"
                          control={control}
                          rules={{ required: "Full name is required" }}
                          render={({ field }) => (
                            <>
                              <input
                                {...field}
                                type="text"
                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.fullname
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Enter your full name"
                              />
                              {errors.fullname && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.fullname.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      ) : (
                        <p className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                          {profile.fullname || "-"}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <Controller
                          name="email"
                          control={control}
                          rules={{
                            required: "Email is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Invalid email address",
                            },
                          }}
                          render={({ field }) => (
                            <>
                              <input
                                {...field}
                                type="email"
                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.email
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="your@email.com"
                              />
                              {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.email.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{profile.email || "-"}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="tel"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="+91 XXXXX XXXXX"
                            />
                          )}
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{profile.phone || "-"}</span>
                        </div>
                      )}
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      {isEditing ? (
                        <Controller
                          name="age"
                          control={control}
                          rules={{
                            min: { value: 0, message: "Age must be positive" },
                            max: { value: 150, message: "Invalid age" },
                          }}
                          render={({ field }) => (
                            <>
                              <input
                                {...field}
                                type="number"
                                min="0"
                                max="150"
                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.age
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Enter your age"
                              />
                              {errors.age && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.age.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>
                            {profile.age ? `${profile.age} years old` : "-"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Gender - Read Only */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 inline-block">
                        <span>{profile.gender || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Street */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    {isEditing ? (
                      <Controller
                        name="address.street"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Street address"
                          />
                        )}
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                        {profile.address?.street || "-"}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    {isEditing ? (
                      <Controller
                        name="address.city"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="City"
                          />
                        )}
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                        {profile.address?.city || "-"}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    {isEditing ? (
                      <Controller
                        name="address.state"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="State"
                          />
                        )}
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                        {profile.address?.state || "-"}
                      </p>
                    )}
                  </div>

                  {/* ZIP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    {isEditing ? (
                      <Controller
                        name="address.zip"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ZIP code"
                          />
                        )}
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                        {profile.address?.zip || "-"}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <Controller
                        name="address.country"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Country"
                          />
                        )}
                      />
                    ) : (
                      <p className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                        {profile.address?.country || "-"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* Allergies */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Allergies
                </h3>
                {isEditing ? (
                  <Controller
                    name="allergies"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        instanceId="allergies-select"
                        isMulti
                        options={createOptions(ALLERGIES)}
                        placeholder="Select allergies..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            padding: "2px",
                          }),
                        }}
                      />
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    {profile.allergies && profile.allergies.length > 0 ? (
                      profile.allergies.map((allergy, index) => (
                        <div
                          key={index}
                          className="bg-red-50 border border-red-200 rounded-lg px-4 py-2"
                        >
                          <p className="text-red-800 font-medium">{allergy}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-sm">
                        No known allergies
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-orange-600" />
                  Chronic Conditions
                </h3>
                {isEditing ? (
                  <Controller
                    name="chronicConditions"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        instanceId="chronic-conditions-select"
                        isMulti
                        options={createOptions(CHRONIC_CONDITIONS)}
                        placeholder="Select conditions..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            padding: "2px",
                          }),
                        }}
                      />
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    {profile.chronicConditions &&
                    profile.chronicConditions.length > 0 ? (
                      profile.chronicConditions.map((condition, index) => (
                        <div
                          key={index}
                          className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2"
                        >
                          <p className="text-orange-800 font-medium">
                            {condition}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-sm">
                        No chronic conditions
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Current Symptoms */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Current Symptoms
                </h3>
                {isEditing ? (
                  <Controller
                    name="symptoms"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        instanceId="symptoms-select"
                        isMulti
                        options={createOptions(SYMPTOMS)}
                        placeholder="Select symptoms..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            padding: "2px",
                          }),
                        }}
                      />
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    {profile.symptoms && profile.symptoms.length > 0 ? (
                      profile.symptoms.map((symptom, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2"
                        >
                          <p className="text-blue-800 font-medium">{symptom}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-sm">
                        No current symptoms
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
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
