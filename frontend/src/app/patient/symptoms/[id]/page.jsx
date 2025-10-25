"use client";

import { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getSymptomLogOfDoctorByPatient,
  createSymptomLog,
} from "@/utils/api/symptoms.api";
import {
  Plus,
  Activity,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import { SYMPTOMS } from "@/data/constant";

export default function PatientSymptoms() {
  const { user } = useContext(AuthContext);
  // console.log("user", user);
  const [patientId, setPatientId] = useState(user?.user?._id);
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id;
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");

  const [newSymptom, setNewSymptom] = useState({
    selectedSymptoms: [],
    customSymptom: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const getPatientId = () => {
    console.log("user: ", user);
    if (user && user.data && user.data.user && user.data.user._id) {
      setPatientId(user.data.user._id);
    }
    return null;
  };
  useEffect(() => {
    if (!doctorId) {
      toast.error("Doctor ID is required");
      router.push("/patient/symptoms");
      return;
    }
    fetchSymptoms();
    getPatientId();
  }, [doctorId]); //add doctorId as dependency

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("doctorId: ", doctorId);
      const response = await getSymptomLogOfDoctorByPatient(doctorId);
      console.log("symptom log response: ", response);
      if (response?.data) {
        // Format symptoms for display
        const formattedSymptoms =
          response.data.symptoms?.map((symptom, index) => ({
            id: `${response.data._id}-${index}`,
            logId: response.data._id,
            name: symptom,
            date: new Date(response.data.createdAt).toLocaleDateString(),
            time: new Date(response.data.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            createdAt: response.data.createdAt,
          })) || [];

        setSymptoms(formattedSymptoms);
      }
    } catch (err) {
      console.error("Error fetching symptoms:", err);
      if (err?.response?.status === 404) {
        setSymptoms([]);
      } else {
        setError(err?.response?.data?.message || "Failed to load symptoms");
        toast.error("Failed to load symptoms");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (
      newSymptom.selectedSymptoms.length === 0 &&
      !newSymptom.customSymptom.trim()
    ) {
      errors.symptoms =
        "Please select at least one symptom or add a custom symptom";
    }

    if (
      newSymptom.customSymptom.trim() &&
      newSymptom.customSymptom.trim().length < 2
    ) {
      errors.customSymptom = "Custom symptom must be at least 2 characters";
    }

    if (
      newSymptom.customSymptom.trim() &&
      newSymptom.customSymptom.trim().length > 50
    ) {
      errors.customSymptom = "Custom symptom must not exceed 50 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleToggleSymptom = (symptom) => {
    const normalizedSymptom = symptom.trim();
    setNewSymptom((prev) => {
      const isSelected = prev.selectedSymptoms.includes(normalizedSymptom);
      return {
        ...prev,
        selectedSymptoms: isSelected
          ? prev.selectedSymptoms.filter((s) => s !== normalizedSymptom)
          : [...prev.selectedSymptoms, normalizedSymptom],
      };
    });

    if (fieldErrors.symptoms) {
      setFieldErrors((prev) => ({ ...prev, symptoms: undefined }));
    }
  };

  const handleAddSymptom = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Combine selected symptoms with custom symptom
      let allSymptoms = [...newSymptom.selectedSymptoms];
      if (newSymptom.customSymptom.trim()) {
        allSymptoms.push(newSymptom.customSymptom.toLowerCase().trim());
      }

      // Remove duplicates
      allSymptoms = [...new Set(allSymptoms)];

      const symptomData = {
        doctorId: doctorId,
        symptoms: allSymptoms,
        patientId: patientId,
      };
      console.log("symptom data: ", symptomData);
      const res = await createSymptomLog(symptomData);

      toast.success("Symptoms logged successfully!");

      // Reset form
      setNewSymptom({
        selectedSymptoms: [],
        customSymptom: "",
      });
      setShowAddForm(false);
      setFieldErrors({});

      // Refresh symptoms list
      fetchSymptoms();
    } catch (err) {
      console.error("Error creating symptom log:", err);
      const errorMessage =
        err?.response?.data?.message || "Failed to log symptoms";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewSymptom({
      selectedSymptoms: [],
      customSymptom: "",
    });
    setFieldErrors({});
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading symptoms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/patient/symptoms")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Symptom Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Log and track your symptoms for this doctor
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Symptoms
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Add Symptom Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Log New Symptoms
            </h2>
            <form onSubmit={handleAddSymptom} className="space-y-6">
              {/* Common Symptoms Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Symptoms *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {SYMPTOMS.map((symptom) => (
                    <label
                      key={symptom}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all ${
                        newSymptom.selectedSymptoms.includes(symptom)
                          ? "bg-blue-100 border-blue-500 border-2"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newSymptom.selectedSymptoms.includes(symptom)}
                        onChange={() => handleToggleSymptom(symptom)}
                        className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm capitalize">{symptom}</span>
                    </label>
                  ))}
                </div>
                {fieldErrors.symptoms && (
                  <p className="text-xs text-red-500 mt-2">
                    {fieldErrors.symptoms}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {newSymptom.selectedSymptoms.length} symptom(s)
                </p>
              </div>

              {/* Custom Symptom Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Custom Symptom (Optional)
                </label>
                <input
                  type="text"
                  value={newSymptom.customSymptom}
                  onChange={(e) => {
                    setNewSymptom({
                      ...newSymptom,
                      customSymptom: e.target.value,
                    });
                    if (fieldErrors.customSymptom) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        customSymptom: undefined,
                      }));
                    }
                  }}
                  className={`w-full border ${
                    fieldErrors.customSymptom
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., tingling sensation, blurred vision"
                  maxLength={50}
                />
                {fieldErrors.customSymptom && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.customSymptom}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  If your symptom is not listed above, add it here
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Logging...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Log Symptoms
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Symptoms List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Symptoms
          </h2>
          <div className="space-y-3">
            {symptoms.length > 0 ? (
              symptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="p-2 bg-orange-100 rounded-lg mr-4">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 capitalize mb-2">
                        {symptom.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="mr-4">{symptom.date}</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{symptom.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No symptoms logged yet</p>
                <p className="text-sm text-gray-400">
                  Start tracking your symptoms by clicking "Log Symptoms" above
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Log New Symptoms
                  </h3>
                  <p className="text-sm text-gray-500">
                    Record how you're feeling
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push("/patient/symptoms")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    View All Doctors
                  </h3>
                  <p className="text-sm text-gray-500">See all your doctors</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
