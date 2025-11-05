"use client";

import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect, useCallback, memo, useContext } from "react";
import { CHRONIC_CONDITIONS, ALLERGIES, SYMPTOMS } from "@/data/constant";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { registerPatient } from "@/utils/api";
import { User } from "lucide-react";

// Memoized input component for better performance
const MemoizedInput = memo(({ label, error, errorMessage, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none focus:border-transparent ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    />
    {error && errorMessage && (
      <p className="text-red-500 text-sm mt-2 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {errorMessage}
      </p>
    )}
  </div>
));

MemoizedInput.displayName = "MemoizedInput";

export default function PatientSignupPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onBlur", // Changed from "onChange" to "onBlur" for better performance
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { user, login } = useContext(AuthContext);
  const [profilePic, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [error, setError] = useState("");

  // Memoize options to prevent unnecessary re-renders
  const createOptions = useCallback(
    (arr) => arr.map((item) => ({ label: item, value: item })),
    []
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const onSubmit = async (data) => {
    // console.log(`Submitted data: ${JSON.stringify(data)}`);

    // Additional validation before submission
    if (data.age < 1 || data.age > 100) {
      setMessage("Age must be between 1 and 100");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(data.phone)) {
      setMessage("Please enter a valid phone number (10-15 digits)");
      return;
    }

    const textPattern = /^[a-zA-Z\s]+$/;

    if (!textPattern.test(data.address.city)) {
      setMessage("City must contain only letters and spaces");
      return;
    }

    if (!textPattern.test(data.address.state)) {
      setMessage("State must contain only letters and spaces");
      return;
    }

    if (!textPattern.test(data.address.country)) {
      setMessage("Country must contain only letters and spaces");
      return;
    }

    if (data.address.city.length < 2 || data.address.city.length > 50) {
      setMessage("City must be between 2 and 50 characters");
      return;
    }

    if (data.address.state.length < 2 || data.address.state.length > 50) {
      setMessage("State must be between 2 and 50 characters");
      return;
    }

    if (data.address.country.length < 2 || data.address.country.length > 50) {
      setMessage("Country must be between 2 and 50 characters");
      return;
    }

    const formattedData = {
      ...data,
      chronicConditions:
        data.chronicConditions?.map((item) => item.value) || [],
      allergies: data.allergies?.map((item) => item.value) || [],
      symptoms: data.symptoms?.map((item) => item.value) || [],
      profilePic: profilePic || "",
    };
    console.log("formatted data: ", formattedData);
    setLoading(true);
    try {
      // const res = await API.post("/patients/register", formattedData);
      const res = await registerPatient(formattedData);
      setMessage("Patient registered successfully!");
      const userData = res.data;
      console.log("userData", userData);
      // Store user data and email for verification
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("pendingVerificationEmail", formattedData.email);
      login(userData); // Update context
      reset();
      toast.success("Registration successful! Please verify your email.");
      router.push(
        `/patient/verify-email?email=${encodeURIComponent(formattedData.email)}`
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Patient Registration
          </h1>
          <p className="text-gray-600 text-lg">
            Join our healthcare platform and get the care you deserve
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  1
                </span>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* full name */}
                <MemoizedInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={!!errors.fullname}
                  errorMessage={errors.fullname?.message}
                  {...register("fullname", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Full name must be at least 2 characters",
                    },
                  })}
                />

                {/* email */}
                <MemoizedInput
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  error={!!errors.email}
                  errorMessage={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                />

                {/* password */}
                <MemoizedInput
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  error={!!errors.password}
                  errorMessage={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                {/* phone number */}
                <MemoizedInput
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  error={!!errors.phone}
                  errorMessage={errors.phone?.message}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10,15}$/,
                      message:
                        "Please enter a valid phone number (10-15 digits)",
                    },
                  })}
                />

                {/* age */}
                <MemoizedInput
                  label="Age"
                  type="number"
                  placeholder="Enter your age"
                  error={!!errors.age}
                  errorMessage={errors.age?.message}
                  {...register("age", {
                    required: "Age is required",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Age must be at least 1",
                    },
                    max: {
                      value: 100,
                      message: "Age must be 100 or less",
                    },
                  })}
                />

                {/* gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    {...register("gender", { required: "Gender is required" })}
                    className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.gender
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  2
                </span>
                Address Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MemoizedInput
                  label="Street Address"
                  placeholder="Enter your street address"
                  error={!!errors.address?.street}
                  errorMessage={errors.address?.street?.message}
                  {...register("address.street", {
                    required: "Street address is required",
                    minLength: {
                      value: 5,
                      message: "Street address must be at least 5 characters",
                    },
                  })}
                />

                <MemoizedInput
                  label="City"
                  placeholder="Enter your city"
                  error={!!errors.address?.city}
                  errorMessage={errors.address?.city?.message}
                  {...register("address.city", {
                    required: "City is required",
                    minLength: {
                      value: 2,
                      message: "City must be at least 2 characters",
                    },
                  })}
                />

                <MemoizedInput
                  label="State"
                  placeholder="Enter your state"
                  error={!!errors.address?.state}
                  errorMessage={errors.address?.state?.message}
                  {...register("address.state", {
                    required: "State is required",
                    minLength: {
                      value: 2,
                      message: "State must be at least 2 characters",
                    },
                  })}
                />

                <MemoizedInput
                  label="ZIP Code"
                  placeholder="Enter your ZIP code"
                  minLength={6}
                  maxLength={6}
                  error={!!errors.address?.zip}
                  errorMessage={errors.address?.zip?.message}
                  {...register("address.zip", {
                    required: "ZIP code is required",
                    pattern: {
                      value: /^[0-9]{6}(-[0-9]{4})?$/,
                      message: "Please enter a valid ZIP code",
                    },
                  })}
                />

                <MemoizedInput
                  label="Country"
                  placeholder="Enter your country"
                  error={!!errors.address?.country}
                  errorMessage={errors.address?.country?.message}
                  {...register("address.country", {
                    required: "Country is required",
                    minLength: {
                      value: 2,
                      message: "Country must be at least 2 characters",
                    },
                  })}
                />
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  3
                </span>
                Medical Information
              </h2>

              <div className="space-y-6">
                {/* Chronic Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chronic Conditions (Optional)
                  </label>
                  <Controller
                    name="chronicConditions"
                    control={control}
                    render={({ field }) => (
                      <Select
                        instanceId={"chronic conditions"}
                        {...field}
                        isMulti
                        options={createOptions(CHRONIC_CONDITIONS)}
                        placeholder="Select any chronic conditions you have"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            padding: "4px",
                          }),
                        }}
                      />
                    )}
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergies (Optional)
                  </label>
                  <Controller
                    name="allergies"
                    control={control}
                    render={({ field }) => (
                      <Select
                        instanceId={"allergies"}
                        {...field}
                        isMulti
                        options={createOptions(ALLERGIES)}
                        placeholder="Select any allergies you have"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            padding: "4px",
                          }),
                        }}
                      />
                    )}
                  />
                </div>

                {/* Current Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Symptoms (Optional)
                  </label>
                  <Controller
                    name="symptoms"
                    control={control}
                    render={({ field }) => (
                      <Select
                        instanceId="symptoms-select"
                        {...field}
                        isMulti
                        options={createOptions(SYMPTOMS)}
                        placeholder="Select any current symptoms"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            padding: "4px",
                          }),
                        }}
                      />
                    )}
                  />
                </div>
              </div>
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

            {/* Submit Section */}
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  By registering, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </a>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </div>

            {/* Error/Success Message */}
            {message && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  message.includes("successfully")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a
              href="/patient/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
