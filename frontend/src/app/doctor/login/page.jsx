"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import API from "@/utils/api";
import toast from "react-hot-toast";

// Doctor Login Page
// - Handles doctor authentication via AuthContext
// - Supports "Remember me" (stores email + role locally)
// - Redirects to dashboard on success and if already logged in
export default function DoctorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { user, login } = useContext(AuthContext);

  // Universal login: redirect if already logged in via localStorage

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.role === "doctor") {
          console.log("Doctor already logged in, redirecting to dashboard...");
          router.replace("/doctor/dashboard");
        }
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // res.data.data content:
  // accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMyNGMwMzhjZmY0MmI1MGE2ODYyMjgiLCJlbWFpbCI6ImFyeWFAY2EuY29tIiwiZnVsbG5hbWUiOiJBcnlhIEIgWWFkYXYiLCJyb2xlIjoiZG9jdG9yIiwiaWF0IjoxNzU3NTY0MzI4LCJleHAiOjE3NTc2NTA3Mjh9.KHHICtqGDv2NiXZUYoGCANviyiA9sXo4ySntn_IaD0U"
  // refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMyNGMwMzhjZmY0MmI1MGE2ODYyMjgiLCJpYXQiOjE3NTc1NjQzMjgsImV4cCI6MTc1ODE2OTEyOH0.j64UWNrpcNZpFu8_uwSFn_WxHoUFF4K0-2AQ0dGcU7I"
  // role: "doctor"
  // user: {_id: '68c24c038cff42b50a686228', email: 'arya@ca.com', fullname: 'Arya B Yadav', specialization: Array(1), qualifications: Array(1), …}

  //login logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await API.post("/doctors/login", {
        email,
        password,
      });
      const data = res.data;
      //this data has user : id, mail, fulname; role and tokens
      console.log("Login response data:", data);
      console.log("User data inside data object", data.data);
      localStorage.setItem("user", JSON.stringify(data.data));
      login(data.data); // Update context
      // Success toast
      toast.success("Login successful! Redirecting...");
      router.replace("/doctor/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      toast.error(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Smart Care Assistant
              </h1>
            </Link>
            <div className="text-sm text-gray-500">Doctor Portal</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-md w-full mx-auto px-4">
          {/* Login Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Doctor Login
              </h2>
              <p className="text-gray-600">
                Sign in to manage your patients and schedule
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? "Signing in..." : "Access Doctor Panel"}
              </button>
            </form>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              If your Email is not verified{" "}
              <Link
                href="/doctor/verify-email"
                className="text-blue-600 hover:text-blue-700"
              >
                click here
              </Link>{" "}
              to verify your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
