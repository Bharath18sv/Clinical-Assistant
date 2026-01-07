"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateSummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [formData, setFormData] = useState({
    patientId: "",
    periodStart: "",
    periodEnd: "",
    textSummary: "",
    prescriptions: [],
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (formData.patientId) {
      fetchPatientPrescriptions(formData.patientId);
    }
  }, [formData.patientId]);

  const fetchPatients = async () => {
    try {
      const response = await API.get("/doctors");
      if (response.data?.data?.patients) {
        setPatients(response.data.data.patients);
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch patients");
    }
  };

  const fetchPatientPrescriptions = async (patientId) => {
    try {
      const response = await API.get(`/prescriptions/patient/${patientId}`);
      if (response.data?.data) {
        setPrescriptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setPrescriptions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await API.post("/summaries", formData);
      handleApiSuccess("Summary created successfully");
      router.push("/doctor/summary");
    } catch (error) {
      handleApiError(error, "Failed to create summary");
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionToggle = (prescriptionId) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.includes(prescriptionId)
        ? prev.prescriptions.filter((id) => id !== prescriptionId)
        : [...prev.prescriptions, prescriptionId],
    }));
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Create Patient Summary</h1>
          <p className="text-gray-600 mt-2">
            Document patient care and treatment outcomes
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient *
            </label>
            <select
              required
              value={formData.patientId}
              onChange={(e) =>
                setFormData({ ...formData, patientId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient.patientId}>
                  {patient.patientDetails?.fullname || "Unknown"} -{" "}
                  {patient.patientDetails?.email || ""}
                </option>
              ))}
            </select>
          </div>

          {/* Summary Period */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary Period</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.periodStart}
                  onChange={(e) =>
                    setFormData({ ...formData, periodStart: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.periodEnd}
                  onChange={(e) =>
                    setFormData({ ...formData, periodEnd: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Clinical Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinical Summary *
            </label>
            <textarea
              required
              rows={10}
              value={formData.textSummary}
              onChange={(e) =>
                setFormData({ ...formData, textSummary: e.target.value })
              }
              placeholder="Enter detailed clinical summary including diagnosis, treatment progress, observations, and recommendations..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.textSummary.length} characters
            </p>
          </div>

          {/* Associated Prescriptions */}
          {prescriptions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Associated Prescriptions (Optional)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Select prescriptions relevant to this summary period
              </p>
              <div className="space-y-2">
                {prescriptions.map((prescription) => (
                  <label
                    key={prescription._id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.prescriptions.includes(prescription._id)}
                      onChange={() => handlePrescriptionToggle(prescription._id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {prescription.title || "Untitled Prescription"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(prescription.date).toLocaleDateString()} •{" "}
                        {prescription.medications?.length || 0} medication(s)
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/doctor/summary")}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {loading ? "Creating..." : "Create Summary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
