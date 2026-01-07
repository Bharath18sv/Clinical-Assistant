"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SPECIALIZATION, QUALIFICATIONS } from "@/data/constant";
import Select, { MultiValue } from "react-select";
import { AuthContext } from "@/context/AuthContext";
import API from "@/utils/api";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import { addDoctor } from "@/utils/api";

export default function AddDoctorPage() {
  const { user, authLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
    gender: "Male",
    age: 0,
    specialization: [],
    qualifications: [],
    experience: "",
    about: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
    },
  });
  const [profilePic, setProfilePicture] = useState();
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    console.log("loading page.....");
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      router.push("/admin/login");
      setLoading(false);
      return;
    }
    console.log("user role", user.role);
    if (user && user.role !== "admin") {
      router.push("/");
      setLoading(false);
    }
    setLoading(false);
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateZip = (zip) => {
    if (!zip) return true; // Optional field
    const zipRegex = /^[0-9]{6}$/;
    return zipRegex.test(zip);
  };

  const validateForm = () => {
    const errors = {};

    // Full Name validation
    if (!formData.fullname.trim()) {
      errors.fullname = "Full name is required";
    } else if (formData.fullname.trim().length < 2) {
      errors.fullname = "Full name must be at least 2 characters";
    } else if (formData.fullname.trim().length > 100) {
      errors.fullname = "Full name must not exceed 100 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    } else if (formData.password.length > 50) {
      errors.password = "Password must not exceed 50 characters";
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    // Age validation
    if (!formData.age || formData.age <= 0) {
      errors.age = "Age is required and must be greater than 0";
    } else if (formData.age < 18) {
      errors.age = "Age must be at least 18 years";
    } else if (formData.age > 120) {
      errors.age = "Please enter a valid age";
    }

    // Experience validation
    if (!formData.experience || formData.experience === "") {
      errors.experience = "Years of experience is required";
    } else if (parseInt(formData.experience) < 0) {
      errors.experience = "Experience cannot be negative";
    } else if (parseInt(formData.experience) > 70) {
      errors.experience = "Please enter a valid experience";
    }

    // Gender validation
    if (!formData.gender) {
      errors.gender = "Gender is required";
    }

    // Specialization validation
    if (!formData.specialization || formData.specialization.length === 0) {
      errors.specialization = "At least one specialization is required";
    }

    // Qualifications validation
    if (!formData.qualifications || formData.qualifications.length === 0) {
      errors.qualifications = "At least one qualification is required";
    }

    // About validation
    if (!formData.about.trim()) {
      errors.about = "About section is required";
    } else if (formData.about.trim().length < 20) {
      errors.about = "About section must be at least 20 characters";
    } else if (formData.about.trim().length > 1000) {
      errors.about = "About section must not exceed 1000 characters";
    }

    // Address validation (all fields required)
    if (!formData.address.street.trim()) {
      errors.street = "Street address is required";
    }
    if (!formData.address.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.address.state.trim()) {
      errors.state = "State is required";
    }
    if (!formData.address.zip.trim()) {
      errors.zip = "ZIP code is required";
    } else if (!validateZip(formData.address.zip)) {
      errors.zip = "ZIP code must be exactly 6 digits";
    }
    if (!formData.address.country.trim()) {
      errors.country = "Country is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear field error when user starts typing
    if (fieldErrors[name] || fieldErrors[name.split(".")[1]]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name];
      delete newErrors[name.split(".")[1]];
      setFieldErrors(newErrors);
    }

    // Handle nested address fields
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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile picture must be less than 5MB");
        toast.error("Profile picture must be less than 5MB");
        return;
      }

      setProfilePicture(file);

      // Create preview
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

  const handleSpecializationChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];

    // Clear specialization error
    if (fieldErrors.specialization) {
      const newErrors = { ...fieldErrors };
      delete newErrors.specialization;
      setFieldErrors(newErrors);
    }

    setFormData((prev) => ({
      ...prev,
      specialization: values,
    }));
  };

  const handleQualificationsChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];

    // Clear qualifications error
    if (fieldErrors.qualifications) {
      const newErrors = { ...fieldErrors };
      delete newErrors.qualifications;
      setFieldErrors(newErrors);
    }

    setFormData((prev) => ({
      ...prev,
      qualifications: values,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      setError("Please fix all errors before submitting");
      toast.error("Please fix all errors before submitting");
      setLoading(false);
      return;
    }

    try {
      const doctorData = {
        ...formData,
        age: parseInt(formData.age),
        experience: parseInt(formData.experience),
        profilePic,
      };
      console.log("doctor data being submitted", doctorData);
      const response = await addDoctor(doctorData);

      setSuccess("Doctor added successfully! Please verify their email.");
      toast.success("Doctor added successfully! Please verify their email.");
      console.log("Add doctor response:", response.data);

      // Reset form
      setFormData({
        email: "",
        password: "",
        fullname: "",
        gender: "Male",
        age: 0,
        specialization: [],
        qualifications: [],
        experience: "",
        about: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "India",
        },
      });
      setProfilePicture(null);
      setProfilePicturePreview("");

      // Redirect to doctors list
      setTimeout(() => {
        router.push("/admin/doctors");
      }, 2000);
    } catch (err) {
      console.error("Error adding doctor:", err);
      if (err.message && err.message.includes("validation failed")) {
        const validationErrors = [];
        if (err.message.includes("specialization")) {
          validationErrors.push(
            "Invalid specialization selected. Please choose from the available options."
          );
        }
        if (err.message.includes("qualifications")) {
          validationErrors.push(
            "Invalid qualification selected. Please choose from the available options."
          );
        }
        setError(validationErrors.join(" "));
        toast.error(validationErrors.join(" "));
      } else {
        setError(err.message || "Failed to add doctor. Please try again.");
        toast.error(err.message || "Failed to add doctor. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Smart Care Assistant
                </h1>
              </Link>
            </div>
            <Link
              href="/admin/doctors"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Doctors
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Add New Doctor
            </h2>
            <p className="text-gray-600">
              Fill in the doctor's information to add them to the system
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.fullname ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                  placeholder="Enter name without any titles, e.g. John Doe"
                  required
                />
                {fieldErrors.fullname && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.fullname}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.email ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                  placeholder="doctor@example.com"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.password ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                  placeholder="Enter password (min 6 characters)"
                  required
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                  placeholder="10 digit phone number"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="120"
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.age ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                  placeholder="Enter age"
                />
                {fieldErrors.age && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.age}</p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Years of Experience *
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.experience
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                  placeholder="0"
                  min="0"
                  required
                />
                {fieldErrors.experience && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.experience}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border ${
                    fieldErrors.gender ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.gender && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.gender}
                  </p>
                )}
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Specialization *
              </label>
              <Select
                isMulti
                options={SPECIALIZATION.map((spec) => ({
                  value: spec,
                  label: spec,
                }))}
                value={formData.specialization.map((spec) => ({
                  value: spec,
                  label: spec,
                }))}
                onChange={handleSpecializationChange}
                className="w-full"
                classNamePrefix="select"
                placeholder="Select specializations..."
                isClearable
                isSearchable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    border: `1px solid ${
                      fieldErrors.specialization ? "#ef4444" : "#d1d5db"
                    }`,
                    borderRadius: "12px",
                    padding: "4px",
                    minHeight: "48px",
                    "&:hover": {
                      borderColor: fieldErrors.specialization
                        ? "#ef4444"
                        : "#3b82f6",
                    },
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                      ? "#3b82f6"
                      : state.isFocused
                      ? "#eff6ff"
                      : "white",
                    color: state.isSelected ? "white" : "#374151",
                    "&:hover": {
                      backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
                    },
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    backgroundColor: "#eff6ff",
                    borderRadius: "8px",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: "#1e40af",
                    fontWeight: "500",
                  }),
                }}
              />
              {fieldErrors.specialization ? (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.specialization}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Select one or more specializations
                </p>
              )}
            </div>

            {/* Qualifications */}
            <div>
              <label
                htmlFor="qualifications"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Qualifications *
              </label>
              <Select
                isMulti
                options={QUALIFICATIONS.map((qual) => ({
                  value: qual,
                  label: qual,
                }))}
                value={formData.qualifications.map((qual) => ({
                  value: qual,
                  label: qual,
                }))}
                onChange={handleQualificationsChange}
                className="w-full"
                classNamePrefix="select"
                placeholder="Select qualifications..."
                isClearable
                isSearchable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    border: `1px solid ${
                      fieldErrors.qualifications ? "#ef4444" : "#d1d5db"
                    }`,
                    borderRadius: "12px",
                    padding: "4px",
                    minHeight: "48px",
                    "&:hover": {
                      borderColor: fieldErrors.qualifications
                        ? "#ef4444"
                        : "#3b82f6",
                    },
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                      ? "#3b82f6"
                      : state.isFocused
                      ? "#eff6ff"
                      : "white",
                    color: state.isSelected ? "white" : "#374151",
                    "&:hover": {
                      backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
                    },
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    backgroundColor: "#eff6ff",
                    borderRadius: "8px",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: "#1e40af",
                    fontWeight: "500",
                  }),
                }}
              />
              {fieldErrors.qualifications ? (
                <p className="text-xs text-red-500 mt-1">
                  {fieldErrors.qualifications}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Select one or more qualifications
                </p>
              )}
            </div>

            {/* About */}
            <div>
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                About Doctor *
              </label>
              <textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border ${
                  fieldErrors.about ? "border-red-500" : "border-gray-300"
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                placeholder="Brief description about the doctor's expertise, experience, and approach to patient care (min 20 characters)..."
                required
              />
              {fieldErrors.about && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.about}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.about.length}/1000 characters
              </p>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                Address Information *
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.street ? "border-red-500" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                    placeholder="Enter street address"
                  />
                  {fieldErrors.street && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.street}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.city ? "border-red-500" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                    placeholder="Enter city"
                  />
                  {fieldErrors.city && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.state ? "border-red-500" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                    placeholder="Enter state"
                  />
                  {fieldErrors.state && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="address.zip"
                    value={formData.address.zip}
                    maxLength={6}
                    minLength={6}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.zip ? "border-red-500" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                    placeholder="Enter 6 digit ZIP code"
                  />
                  {fieldErrors.zip && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.zip}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.country ? "border-red-500" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200`}
                    placeholder="Enter country"
                  />
                  {fieldErrors.country && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.country}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <label
                htmlFor="profile-picture"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Profile Picture (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                      <svg
                        className="h-10 w-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="profilePic"
                    name="profilePic"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                  {profilePic && (
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors"
                    >
                      Remove Picture
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link
                href="/admin/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding Doctor...
                  </>
                ) : (
                  "Add Doctor"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
