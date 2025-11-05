import React, { useState } from "react";
import { Plus, Save, Trash2, X, Clock } from "lucide-react";
import { addPrescription } from "@/utils/api";
import PrescriptionCard from "@/components/PrescriptionCard";

const AddPrescription = ({ patient }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const [medications, setMedications] = useState([
    {
      name: "",
      dosage: "",
      duration: "",
      notes: "",
      schedule: [], // array of strings as per your current schema
    },
  ]);

  const timeOptions = ["morning", "afternoon", "evening", "night"];

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        name: "",
        dosage: "",
        duration: "",
        notes: "",
        schedule: [],
      },
    ]);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index, field, value) => {
    const updatedMedications = medications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updatedMedications);
  };

  const updateSchedule = (medIndex, timeOfDay, isChecked) => {
    const updatedMedications = medications.map((med, i) => {
      if (i === medIndex) {
        let newSchedule = [...med.schedule];
        if (isChecked) {
          if (!newSchedule.includes(timeOfDay)) newSchedule.push(timeOfDay);
        } else {
          newSchedule = newSchedule.filter((time) => time !== timeOfDay);
        }
        return { ...med, schedule: newSchedule };
      }
      return med;
    });
    setMedications(updatedMedications);
  };

  const resetForm = () => {
    setTitle("");
    setMedications([
      {
        name: "",
        dosage: "",
        duration: "",
        notes: "",
        status: "active",
        schedule: [],
      },
    ]);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const openModal = () => {
    setShowModal(true);
    resetForm();
  };

  const validateForm = () => {
    if (!title.trim()) {
      alert("Please enter a prescription title");
      return false;
    }

    const errors = [];
    let atLeastOneMedication = false;

    medications.forEach((med, index) => {
      // Skip completely empty medications
      if (!med.name.trim() && !med.dosage && !med.duration) {
        return;
      }

      const medErrors = [];

      // Validate medication name
      if (!med.name.trim()) {
        medErrors.push("Name is required");
      }

      // Validate dosage
      if (!med.dosage) {
        medErrors.push("Dosage is required");
      } else {
        const dosageNum = Number(med.dosage);
        if (isNaN(dosageNum)) {
          medErrors.push(`Dosage "${med.dosage}" is not a valid number`);
        } else if (dosageNum <= 0) {
          medErrors.push(`Dosage ${med.dosage} must be greater than 0`);
        } else if (!Number.isInteger(dosageNum)) {
          medErrors.push(`Dosage ${med.dosage} must be a whole number`);
        }
      }

      // Validate duration
      if (!med.duration) {
        medErrors.push("Duration is required");
      } else {
        const durationNum = Number(med.duration);
        if (isNaN(durationNum)) {
          medErrors.push(`Duration "${med.duration}" is not a valid number`);
        } else if (durationNum <= 0) {
          medErrors.push(`Duration ${med.duration} must be greater than 0`);
        } else if (!Number.isInteger(durationNum)) {
          medErrors.push(`Duration ${med.duration} must be a whole number`);
        }
      }

      // Validate schedule
      if (!med.schedule || med.schedule.length === 0) {
        medErrors.push("At least one schedule time must be selected");
      }

      if (medErrors.length > 0) {
        errors.push(
          `Medication ${index + 1} (${
            med.name || "Unnamed"
          }):\n- ${medErrors.join("\n- ")}`
        );
      } else {
        atLeastOneMedication = true;
      }
    });

    if (!atLeastOneMedication) {
      alert(
        "Please add at least one complete medication with name, dosage, and duration"
      );
      return false;
    }

    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n\n"));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const prescriptionData = {
        title: title.trim(),
        patientId: patient._id || patient.id,
        status,
        medications: medications
          .filter((med) => med.name.trim() !== "")
          .map((med) => {
            const dosageNum = Number(med.dosage);
            const durationNum = Number(med.duration);

            if (isNaN(dosageNum) || dosageNum <= 0) {
              throw new Error(
                `Invalid dosage for ${med.name}: ${med.dosage}. Dosage must be a positive number.`
              );
            }

            if (isNaN(durationNum) || durationNum <= 0) {
              throw new Error(
                `Invalid duration for ${med.name}: ${med.duration}. Duration must be a positive number.`
              );
            }

            return {
              name: med.name.trim(),
              dosage: dosageNum,
              duration: durationNum,
              notes: med.notes?.trim() || "",
              status: med.status || "active",
              schedule: med.schedule.length > 0 ? med.schedule : ["morning"],
            };
          }),
      };

      console.log("Submitting prescription:", prescriptionData);

      await addPrescription(prescriptionData);
      alert("Prescription added successfully!");
      closeModal();
    } catch (err) {
      console.error("Error adding prescription:", err);
      alert(`Failed to add prescription: ${err.message || "Please try again"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Prescription Button */}
      <div className="text-center">
        <button
          onClick={openModal}
          className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add New Prescription
        </button>
      </div>

      {/* Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Add New Prescription
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Prescription Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Diabetes Management, Post-surgery care"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Medications Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">
                    Medications
                  </h4>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add Medication
                  </button>
                </div>

                {medications.map((medication, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-700">
                        Medication {index + 1}
                      </h5>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
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
                          placeholder="e.g., Metformin"
                          value={medication.name}
                          onChange={(e) =>
                            updateMedication(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="e.g., 500"
                          value={medication.dosage}
                          onChange={(e) =>
                            updateMedication(index, "dosage", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Number of days"
                          value={medication.duration}
                          onChange={(e) =>
                            updateMedication(index, "duration", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      {/* removed status option */}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Notes
                        </label>
                        <textarea
                          placeholder="e.g., Take with food, avoid alcohol"
                          rows="2"
                          value={medication.notes}
                          onChange={(e) =>
                            updateMedication(index, "notes", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Schedule Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-1" />
                        Schedule (Time of Day)
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {timeOptions.map((time) => {
                          const isChecked = medication.schedule.includes(time);
                          return (
                            <label
                              key={time}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  updateSchedule(index, time, e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {time}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {medication.schedule.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Selected: {medication.schedule.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Prescription
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPrescription;
