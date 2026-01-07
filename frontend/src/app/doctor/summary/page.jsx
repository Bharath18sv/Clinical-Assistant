"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";
import { FileText, Calendar, User, Eye, Plus, Trash2, Edit } from "lucide-react";

export default function DoctorSummariesPage() {
  const router = useRouter();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchSummaries();
    fetchPatients();
  }, [page, selectedPatient]);

  const fetchPatients = async () => {
    try {
      const response = await API.get("/doctors");
      if (response.data?.data?.patients) {
        setPatients(response.data.data.patients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (selectedPatient) params.patientId = selectedPatient;

      const response = await API.get("/summaries", { params });
      if (response.data?.data) {
        setSummaries(response.data.data.summaries || []);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch summaries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (summaryId) => {
    if (!confirm("Are you sure you want to delete this summary?")) return;

    try {
      await API.delete(`/summaries/${summaryId}`);
      handleApiSuccess("Summary deleted successfully");
      fetchSummaries();
    } catch (error) {
      handleApiError(error, "Failed to delete summary");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Summaries</h1>
              <p className="text-gray-600 mt-2">View and manage patient care summaries</p>
            </div>
            <button
              onClick={() => router.push("/doctor/summary/create")}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Summary
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filter by Patient:</label>
            <select
              value={selectedPatient}
              onChange={(e) => {
                setSelectedPatient(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient.patientId}>
                  {patient.patientDetails?.fullname || "Unknown"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summaries List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : summaries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No summaries found</h3>
            <p className="text-gray-600 mb-6">
              {selectedPatient
                ? "No summaries for this patient yet"
                : "Create your first patient summary to get started"}
            </p>
            <button
              onClick={() => router.push("/doctor/summary/create")}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Summary
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {summaries.map((summary) => (
                <div
                  key={summary._id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Patient Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <User size={18} className="text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {summary.patientId?.fullname || "Unknown Patient"}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({summary.patientId?.age}y, {summary.patientId?.gender})
                        </span>
                      </div>

                      {/* Period */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>
                          {formatDate(summary.periodStart)} - {formatDate(summary.periodEnd)}
                        </span>
                      </div>

                      {/* Summary Text Preview */}
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {summary.textSummary}
                      </p>

                      {/* Metadata */}
                      <div className="flex gap-4 text-sm text-gray-500">
                        {summary.prescriptions?.length > 0 && (
                          <span>{summary.prescriptions.length} Prescription(s)</span>
                        )}
                        {summary.keyAlerts?.length > 0 && (
                          <span className="text-red-600">
                            {summary.keyAlerts.length} Alert(s)
                          </span>
                        )}
                        <span>Created {formatDate(summary.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/doctor/summary/${summary._id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => router.push(`/doctor/summary/${summary._id}/edit`)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(summary._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
