"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";

export default function PatientAddedSuccessPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingVerificationEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      router.push("/doctor/patient");
    }
  }, [router]);

  const handleBackToPatients = () => {
    localStorage.removeItem("pendingVerificationEmail");
    router.push("/doctor/patient");
  };

  const handleGoToVerification = () => {
    router.push(`/patient/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Patient Added Successfully!
          </h1>
          <p className="text-gray-600">
            The patient has been created and added to your care.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Email Verification Required
            </h2>
            <p className="text-gray-600 text-sm">
              A verification email has been sent to:
            </p>
            <p className="text-blue-600 font-semibold mt-1">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Important:</strong> The patient must verify their email address before they can log in to the system.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoToVerification}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              Go to Verification Page
            </button>
            
            <button
              onClick={handleBackToPatients}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold flex items-center justify-center"
            >

              <ArrowLeft className="w-4 w-4 mr-2" />
              Back to Patient List
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            The patient should check their email (including spam folder) for the verification code.
          </p>
        </div>
      </div>
    </div>
  );
}