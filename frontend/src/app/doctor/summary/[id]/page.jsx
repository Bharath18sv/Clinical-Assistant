"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import {
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Pill,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";

export default function SummaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSummary();
    }
  }, [params.id]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/summaries/${params.id}`);
      if (response.data?.data) {
        setSummary(response.data.data);
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch summary");
      router.push("/doctor/summary");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this summary?")) return;

    try {
      await API.delete(`/summaries/${params.id}`);
      router.push("/doctor/summary");
    } catch (error) {
      handleApiError(error, "Failed to delete summary");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Summary not found</h2>
          <button
            onClick={() => router.push("/doctor/summary")}
            className="text-blue-600 hover:underline"
          >
            Back to summaries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/doctor/summary")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Summaries
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Summary</h1>
              <p className="text-gray-600">
                Created on {formatDate(summary.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/doctor/summary/${params.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-medium text-gray-900">
                {summary.patientId?.fullname || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-gray-900">
                {summary.patientId?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="text-lg font-medium text-gray-900">
                {summary.patientId?.age || "N/A"} years
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-lg font-medium text-gray-900">
                {summary.patientId?.gender || "N/A"}
              </p>
            </div>
          </div>

          {/* Allergies and Chronic Conditions */}
          {(summary.patientId?.allergies?.length > 0 ||
            summary.patientId?.chronicConditions?.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {summary.patientId?.allergies?.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Allergies</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {summary.patientId.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {summary.patientId?.chronicConditions?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {summary.patientId.chronicConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Period */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Summary Period</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="text-lg font-medium text-gray-900">
                {formatDate(summary.periodStart)}
              </p>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">End Date</p>
              <p className="text-lg font-medium text-gray-900">
                {formatDate(summary.periodEnd)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Text */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Clinical Summary</h2>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{summary.textSummary}</p>
          </div>
        </div>

        {/* Key Alerts */}
        {summary.keyAlerts && summary.keyAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={24} className="text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Key Alerts</h2>
            </div>
            <div className="space-y-3">
              {summary.keyAlerts.map((alert, index) => (
                <div
                  key={alert._id || index}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-900">{alert.description || "Alert"}</p>
                  {alert.severity && (
                    <span className="text-xs text-red-700 mt-1 inline-block">
                      Severity: {alert.severity}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescriptions */}
        {summary.prescriptions && summary.prescriptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Pill size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Associated Prescriptions
              </h2>
            </div>
            <div className="space-y-3">
              {summary.prescriptions.map((prescription, index) => (
                <div
                  key={prescription._id || index}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p className="font-medium text-blue-900">
                    {prescription.title || `Prescription ${index + 1}`}
                  </p>
                  {prescription.medications && prescription.medications.length > 0 && (
                    <div className="mt-2 text-sm text-blue-800">
                      {prescription.medications.map((med, medIndex) => (
                        <div key={medIndex}>
                          • {med.name} - {med.dosage} ({med.frequency})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
