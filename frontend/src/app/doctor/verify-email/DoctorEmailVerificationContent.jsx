"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Mail, ArrowLeft, RefreshCw, Send } from "lucide-react";
import {
  resendDoctorVerification,
  verifyDoctorEmail,
} from "@/utils/api/emailApi";

export default function DoctorEmailVerificationContent() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState(""); // New state for email input
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [fromLogin, setFromLogin] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false); // Track if email has been submitted
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("pendingDoctorVerificationEmail");
    const fromLoginPage = searchParams.get("fromLogin") === "true";

    setFromLogin(fromLoginPage);

    if (emailParam) {
      setEmail(emailParam);
      setInputEmail(emailParam);
      localStorage.setItem("pendingDoctorVerificationEmail", emailParam);
      setEmailSubmitted(true);
    } else if (storedEmail) {
      setEmail(storedEmail);
      setInputEmail(storedEmail);
      setEmailSubmitted(true);
    }
  }, [searchParams, router]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyDoctorEmail(email, code);

      const data = response.data;

      if (response.success) {
        toast.success("Email verified successfully!");
        localStorage.removeItem("pendingDoctorVerificationEmail");
        router.push("/doctor/login");
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setResendLoading(true);
    try {
      const res = await resendDoctorVerification(email);
      const data = res.data;

      if (res.success) {
        toast.success("Verification code sent!");
        setCountdown(60); // 60 second cooldown
      } else {
        toast.error(data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  // New function to handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!inputEmail) {
      toast.error("Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setResendLoading(true);
    try {
      const res = await resendDoctorVerification(inputEmail);
      const data = res.data;

      if (res.success) {
        setEmail(inputEmail);
        setEmailSubmitted(true);
        toast.success("Verification code sent!");
        setCountdown(60); // 60 second cooldown
      } else {
        toast.error(data.message || "Failed to send code");
      }
    } catch (error) {
      console.error("Email submission error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            {fromLogin
              ? "A new verification code has been sent to your email. Please enter it below to continue."
              : emailSubmitted
              ? "We've sent a 6-digit verification code to"
              : "Please enter your email address to receive a verification code"}
          </p>
          {emailSubmitted && (
            <p className="text-green-600 font-semibold">{email}</p>
          )}
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!emailSubmitted ? (
            // Email input form
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={resendLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold flex items-center justify-center"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </button>
            </form>
          ) : (
            // Verification code form
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              {/* Resend Code */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm mb-3">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={resendLoading || countdown > 0}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </div>

              {/* Change Email */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setEmailSubmitted(false)}
                  className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change Email Address
                </button>
              </div>
            </form>
          )}

          {/* Back to Registration */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/admin/doctors/add")}
              className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Check your spam folder if you don't see the email. The code expires
            in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
