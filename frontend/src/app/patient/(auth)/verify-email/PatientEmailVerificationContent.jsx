"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import {
  verifyPatientEmail,
  resendDoctorVerification,
  resendPatientVerification,
} from "@/utils/api/emailApi";

export default function PatientEmailVerificationContent() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("pendingVerificationEmail");

    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem("pendingVerificationEmail", emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect to signup
      router.push("/patient/signup");
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

    setLoading(true);
    try {
      const response = await verifyPatientEmail({ email, code });
      console.log("response: ", response);
      const data = await response?.data;
      console.log("response data: ", data);

      if (response.success) {
        toast.success("Email verified successfully!");
        localStorage.removeItem("pendingVerificationEmail");
        router.push("/patient/login");
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

    setResendLoading(true);
    try {
      const response = await resendPatientVerification(email);
      const data = response?.data;

      console.log("response: ", response.statusText);
      if (response.success) {
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

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-blue-600 font-semibold">{email}</p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading || countdown > 0}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Back to Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/patient/signup")}
              className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Signup
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
