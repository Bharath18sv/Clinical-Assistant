"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Activity,
  Shield,
  UserPlus,
  Heart,
} from "lucide-react";
import { addPatient } from "@/utils/api";
import { CHRONIC_CONDITIONS, SYMPTOMS, ALLERGIES } from "@/data/constant";

export default function AddPatientPage() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    gender: "Male",
    age: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
    },
    chronicConditions: [],
    allergies: [],
    symptoms: [],
  });
  const router = useRouter();
  const [profilePic, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Profile picture must be less than 5MB");
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview("");
  };

  const handleChronicConditionsChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData((prev) => ({ ...prev, chronicConditions: values }));
  };

  const handleAllergiesChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData((prev) => ({ ...prev, allergies: values }));
  };

  const handleSymptomsChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData((prev) => ({ ...prev, symptoms: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Form validation
    if (!formData.fullname.trim()) {
      setError("Full name is required");
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    if (!formData.age) {
      setError("Age is required");
      setLoading(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      setLoading(false);
      return;
    }
    try {
      // Simulate API call

      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        profilePic,
      };
      const newPatient = await addPatient(patientData);
      console.log("Patient data being submitted:", patientData);

      setSuccess("Patient added successfully! A verification email has been sent to the patient's email address.");
      
      // Store patient email for verification redirect
      localStorage.setItem("pendingVerificationEmail", formData.email);
      
      // Redirect to success page
      router.push("/doctor/patient/add/success");

      // Reset form
      setFormData({
        fullname: "",
        email: "",
        password: "",
        gender: "Male",
        age: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "India",
        },
        chronicConditions: [],
        allergies: [],
        symptoms: [],
      });

      setProfilePicture(null);
      setProfilePicturePreview("");
    } catch (err) {
      console.error("Error adding patient:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to add patient";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Custom select styles
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      padding: "4px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      ...(state.isFocused && {
        borderColor: "#3b82f6",
        "&:hover": {
          borderColor: "#3b82f6",
        },
      }),
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e0f2fe",
      borderRadius: "6px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#0c4a6e",
      fontWeight: "500",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#0c4a6e",
      "&:hover": {
        backgroundColor: "#0284c7",
        color: "white",
      },
    }),
  };

  if (loading && !error && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Adding Patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Patient
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      maxLength={3}
                      min="1"
                      max="120"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-50">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {profilePic && (
                        <button
                          type="button"
                          onClick={removeProfilePicture}
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove Picture
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  Address Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="address.zip"
                      value={formData.address.zip}
                      maxLength={6}
                      minLength={6}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter ZIP code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  Medical Information
                </h3>

                <div className="space-y-4">
                  {/* Chronic Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chronic Conditions
                    </label>
                    <Select
                      isMulti
                      options={CHRONIC_CONDITIONS.map((condition) => ({
                        value: condition,
                        label: condition,
                      }))}
                      instanceId="chronic-conditions"
                      value={formData.chronicConditions.map((condition) => ({
                        value: condition,
                        label: condition,
                      }))}
                      onChange={handleChronicConditionsChange}
                      placeholder="Select chronic conditions..."
                      styles={selectStyles}
                      isClearable
                      isSearchable
                    />
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies
                    </label>
                    <Select
                      instanceId={"allergy"}
                      isMulti
                      options={ALLERGIES.map((allergy) => ({
                        value: allergy,
                        label: allergy,
                      }))}
                      value={formData.allergies.map((allergy) => ({
                        value: allergy,
                        label: allergy,
                      }))}
                      onChange={handleAllergiesChange}
                      placeholder="Select allergies..."
                      styles={selectStyles}
                      isClearable
                      isSearchable
                    />
                  </div>

                  {/* Current Symptoms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Symptoms
                    </label>
                    <Select
                      instanceId={"symptom"}
                      isMulti
                      options={SYMPTOMS.map((symptom) => ({
                        value: symptom,
                        label: symptom,
                      }))}
                      value={formData.symptoms.map((symptom) => ({
                        value: symptom,
                        label: symptom,
                      }))}
                      onChange={handleSymptomsChange}
                      placeholder="Select current symptoms..."
                      styles={selectStyles}
                      isClearable
                      isSearchable
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Add Patient</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
