import React, { useEffect, useState } from "react";
import { getPatientPrescriptions, updatePrescription } from "@/utils/api";
import {
  Calendar,
  Clock,
  Pill,
  FileText,
  AlertTriangle,
  CheckCircle,
  User,
  Activity,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";

function PrescriptionCard({ patient }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const prescriptionData = await getPatientPrescriptions(patient._id);
        setPrescriptions(prescriptionData.data || []);
        console.log(
          "Fetched prescriptions data in card:",
          prescriptionData.data
        );
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError("Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    };

    if (patient._id) {
      fetchPrescriptions();
    }
  }, [patient._id]);

  const handleEditClick = (prescription) => {
    setEditingPrescription(prescription._id);
    setEditForm({
      title: prescription.title || prescription.name || "",
      status: prescription.status || "active",
      medications: prescription.medications.map((med) => ({
        name: med.name,
        dosage: med.dosage,
        duration: med.duration,
        notes: med.notes || "",
        status: med.status || "active",
        schedule: med.schedule || [],
      })),
    });
  };

  const handleCancelEdit = () => {
    setEditingPrescription(null);
    setEditForm(null);
  };

  const handleSaveEdit = async (prescriptionId) => {
    try {
      setSaving(true);
      const updatedData = {
        ...editForm,
        _id: prescriptionId,
        patientId: patient._id,
      };

      const response = await updatePrescription(prescriptionId, updatedData);

      if (response.success) {
        // Update local state
        setPrescriptions((prev) =>
          prev.map((p) =>
            p._id === prescriptionId ? { ...p, ...updatedData } : p
          )
        );
        setEditingPrescription(null);
        setEditForm(null);
        alert("Prescription updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update prescription");
      }
    } catch (err) {
      console.error("Error updating prescription:", err);
      alert(`Error: ${err.message || "Failed to update prescription"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const handleScheduleChange = (medIndex, timeOfDay) => {
    setEditForm((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) => {
        if (i === medIndex) {
          const currentSchedule = med.schedule || [];
          const hasTime = currentSchedule.includes(timeOfDay);
          return {
            ...med,
            schedule: hasTime
              ? currentSchedule.filter((t) => t !== timeOfDay)
              : [...currentSchedule, timeOfDay],
          };
        }
        return med;
      }),
    }));
  };

  const handleAddMedication = () => {
    setEditForm((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: "",
          dosage: "",
          duration: "",
          notes: "",
          status: "active",
          schedule: [],
        },
      ],
    }));
  };

  const handleRemoveMedication = (index) => {
    if (editForm.medications.length === 1) {
      alert("At least one medication is required");
      return;
    }
    setEditForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        bgColor: "bg-green-50",
      },
      completed: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: CheckCircle,
        bgColor: "bg-gray-50",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle,
        bgColor: "bg-red-50",
      },
    };
    return configs[status] || configs.active;
  };

  const formatTimeOfDay = (schedule) => {
    if (!schedule || schedule.length === 0) return "No schedule";
    return schedule
      .map((time) => time.charAt(0).toUpperCase() + time.slice(1))
      .join(", ");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Prescriptions
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading prescriptions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Prescriptions
        </h3>
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-10">
      <div className="flex items-center gap-2 mb-6">
        <Pill className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Current Prescriptions
        </h3>
        {prescriptions.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {prescriptions.length}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {prescriptions && prescriptions.length > 0 ? (
          prescriptions.map((prescription) => {
            const isEditing = editingPrescription === prescription._id;
            const statusConfig = getStatusConfig(
              isEditing ? editForm.status : prescription.status
            );
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={prescription._id || prescription.id}
                className={`border border-gray-200 rounded-xl p-6 ${statusConfig.bgColor} hover:shadow-md transition-shadow`}
              >
                {/* Prescription Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prescription Title
                            </label>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) =>
                                handleFormChange("title", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter prescription title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={editForm.status}
                              onChange={(e) =>
                                handleFormChange("status", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {prescription.title ||
                              prescription.name ||
                              "General Prescription"}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Prescribed on{" "}
                              {new Date(prescription.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2">
                    {!isEditing && (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${statusConfig.color}`}
                      >
                        <StatusIcon size={14} />
                        {prescription.status
                          ? prescription.status.charAt(0).toUpperCase() +
                            prescription.status.slice(1)
                          : "Unknown"}
                      </span>
                    )}
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(prescription._id)}
                          disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(prescription)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Medications List */}
                {((isEditing && editForm.medications) ||
                  prescription.medications) &&
                  (isEditing ? editForm.medications : prescription.medications)
                    .length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-700 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Medications (
                          {isEditing
                            ? editForm.medications.length
                            : prescription.medications.length}
                          )
                        </h5>
                        {isEditing && (
                          <button
                            onClick={handleAddMedication}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Add Medication
                          </button>
                        )}
                      </div>
                      <div className="grid gap-4">
                        {(isEditing
                          ? editForm.medications
                          : prescription.medications
                        ).map((med, medIndex) => (
                          <div
                            key={medIndex}
                            className="bg-white rounded-lg border border-gray-200 p-4"
                          >
                            {isEditing ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h6 className="font-semibold text-gray-900">
                                    Medication {medIndex + 1}
                                  </h6>
                                  {editForm.medications.length > 1 && (
                                    <button
                                      onClick={() =>
                                        handleRemoveMedication(medIndex)
                                      }
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Medication Name *
                                    </label>
                                    <input
                                      type="text"
                                      value={med.name}
                                      onChange={(e) =>
                                        handleMedicationChange(
                                          medIndex,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="e.g., Metformin"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Dosage (mg) *
                                    </label>
                                    <input
                                      type="number"
                                      value={med.dosage}
                                      onChange={(e) =>
                                        handleMedicationChange(
                                          medIndex,
                                          "dosage",
                                          parseInt(e.target.value) || ""
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="500"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Duration (days) *
                                    </label>
                                    <input
                                      type="number"
                                      value={med.duration}
                                      onChange={(e) =>
                                        handleMedicationChange(
                                          medIndex,
                                          "duration",
                                          parseInt(e.target.value) || ""
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="30"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Status
                                    </label>
                                    <select
                                      value={med.status}
                                      onChange={(e) =>
                                        handleMedicationChange(
                                          medIndex,
                                          "status",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="active">Active</option>
                                      <option value="completed">
                                        Completed
                                      </option>
                                      <option value="cancelled">
                                        Cancelled
                                      </option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Schedule *
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {[
                                      "morning",
                                      "afternoon",
                                      "evening",
                                      "night",
                                    ].map((time) => (
                                      <button
                                        key={time}
                                        type="button"
                                        onClick={() =>
                                          handleScheduleChange(medIndex, time)
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                          med.schedule?.includes(time)
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                      >
                                        {time.charAt(0).toUpperCase() +
                                          time.slice(1)}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes / Instructions
                                  </label>
                                  <textarea
                                    value={med.notes}
                                    onChange={(e) =>
                                      handleMedicationChange(
                                        medIndex,
                                        "notes",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="2"
                                    placeholder="e.g., Take with meals"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-gray-600" />
                                    <h6 className="font-semibold text-gray-900 text-base">
                                      {med.name}
                                    </h6>
                                  </div>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      med.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : med.status === "completed"
                                        ? "bg-gray-100 text-gray-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {med.status?.charAt(0).toUpperCase() +
                                      med.status?.slice(1)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                                  {med.dosage && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Dosage
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">
                                        {med.dosage} mg
                                      </p>
                                    </div>
                                  )}
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Schedule
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 mt-1">
                                      {formatTimeOfDay(med.schedule)}
                                    </p>
                                  </div>
                                  {med.duration && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Duration
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">
                                        {med.duration} days
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {med.notes && (
                                  <div className="bg-yellow-50 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide mb-1">
                                          Instructions
                                        </p>
                                        <p className="text-sm text-yellow-800">
                                          {med.notes}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Prescriptions
            </h4>
            <p className="text-gray-600">
              This patient has no active prescriptions yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrescriptionCard;
