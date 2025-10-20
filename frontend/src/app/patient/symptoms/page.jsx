"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
  UserCircle,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyDoctors } from "@/utils/api";
import toast from "react-hot-toast";
import MyDoctors from "@/components/patient/MyDoctors";
import QuickActions from "@/components/patient/QuickActions";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PatientSymptomsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchAllDoctors();
  }, []);

  const fetchAllDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const allDoctors = await getMyDoctors();
      if (!Array.isArray(allDoctors)) {
        throw new Error("Invalid response format for all doctors list");
      }
      setDoctors(allDoctors);
    } catch (err) {
      console.error("Error fetching all doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  // const fetchDoctors = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     // Get doctor IDs who have symptom logs for this patient
  //     const symptomDoctors = await getDoctorListForPatient();
  //     console.log("Symptom doctors response:", symptomDoctors);

  //     const doctorIds = Array.isArray(symptomDoctors) ? symptomDoctors : [];

  //     if (doctorIds.length === 0) {
  //       fetchAllDoctors(); // Preload all doctors for better UX later
  //       setDoctors([]);
  //       return;
  //     }

  //     // Fetch full doctor details
  //     const allDoctors = await getMyDoctors();
  //     console.log("All doctors:", allDoctors);

  //     if (!Array.isArray(allDoctors)) {
  //       throw new Error("Invalid response format for doctors list");
  //     }

  //     // Match based on _id or id (cast to string for safety)
  //     const filteredDoctors = allDoctors.filter((doctor) =>
  //       doctorIds.includes(String(doctor._id || doctor.id))
  //     );

  //     console.log("Filtered doctors with symptom logs:", filteredDoctors);
  //     setDoctors(filteredDoctors);
  //   } catch (err) {
  //     console.error("Error fetching doctors list:", err);
  //     const errorMessage =
  //       err?.response?.data?.message ||
  //       err?.message ||
  //       "Failed to load doctors list";
  //     setError(errorMessage);
  //     toast.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDoctorClick = (doctorId) => {
    router.push(`/patient/symptoms/${doctorId}`);
  };

  if (loading) {
    return (
      <LoadingSpinner message="Loading your doctors with symptom logs..." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Your Doctors - Symptom Logs
            </h1>
          </div>
          <p className="text-gray-600">
            View and manage symptom logs for each of your doctors
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchDoctors}
                  className="text-sm text-red-600 hover:text-red-800 underline mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Doctors List */}
        <MyDoctors
          filteredDoctors={doctors}
          onDoctorClick={handleDoctorClick}
          actions={false}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start">
            <div className="p-2 bg-white rounded-lg mr-4">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                About Symptom Logs
              </h3>
              <p className="text-sm text-gray-700">
                Symptom logs help you track your health conditions and share
                them with your doctors. Each doctor can view only the symptom
                logs you've created for them, ensuring your privacy and
                organized healthcare management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
