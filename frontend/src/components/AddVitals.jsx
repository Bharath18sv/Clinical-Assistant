import React, { useState } from "react";
import {
  Plus,
  Save,
  X,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  Droplets,
  AlertCircle,
} from "lucide-react";
import VitalsCard from "@/components/VitalsCard";
import { addVitals } from "@/utils/api";

function AddVitals({ patient }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: {
      systolic: "",
      diastolic: "",
    },
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    oxygenSaturation: "",
    respiratoryRate: "",
  });

  // Validation ranges for vital signs
  const VITAL_RANGES = {
    systolic: { min: 70, max: 250, label: "Systolic pressure" },
    diastolic: { min: 40, max: 150, label: "Diastolic pressure" },
    heartRate: { min: 30, max: 220, label: "Heart rate" },
    temperature: { min: 95, max: 108, label: "Temperature" },
    weight: { min: 0.5, max: 500, label: "Weight" },
    height: { min: 1, max: 9, label: "Height" },
    oxygenSaturation: { min: 70, max: 100, label: "Oxygen saturation" },
    respiratoryRate: { min: 8, max: 60, label: "Respiratory rate" },
  };

  const resetForm = () => {
    setVitalsForm({
      bloodPressure: {
        systolic: "",
        diastolic: "",
      },
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
      oxygenSaturation: "",
      respiratoryRate: "",
    });
    setErrors({});
    setGeneralError("");
  };

  const openModal = () => {
    setShowModal(true);
    resetForm();
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateNumericInput = (field, value, min, max, label) => {
    if (value === "" || value === null || value === undefined) {
      return null; // Empty is allowed (optional field)
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return `${label} must be a valid number`;
    }

    if (numValue < min || numValue > max) {
      return `${label} must be between ${min} and ${max}`;
    }

    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if at least one field is filled
    const hasAnyValue =
      vitalsForm.heartRate ||
      vitalsForm.temperature ||
      vitalsForm.weight ||
      vitalsForm.height ||
      vitalsForm.oxygenSaturation ||
      vitalsForm.respiratoryRate ||
      vitalsForm.bloodPressure.systolic ||
      vitalsForm.bloodPressure.diastolic;

    if (!hasAnyValue) {
      setGeneralError("Please enter at least one vital sign measurement");
      return false;
    }

    // Validate blood pressure systolic
    if (vitalsForm.bloodPressure.systolic) {
      const error = validateNumericInput(
        "systolic",
        vitalsForm.bloodPressure.systolic,
        VITAL_RANGES.systolic.min,
        VITAL_RANGES.systolic.max,
        VITAL_RANGES.systolic.label
      );
      if (error) newErrors.systolic = error;
    }

    // Validate blood pressure diastolic
    if (vitalsForm.bloodPressure.diastolic) {
      const error = validateNumericInput(
        "diastolic",
        vitalsForm.bloodPressure.diastolic,
        VITAL_RANGES.diastolic.min,
        VITAL_RANGES.diastolic.max,
        VITAL_RANGES.diastolic.label
      );
      if (error) newErrors.diastolic = error;
    }

    // Additional blood pressure validation: systolic should be greater than diastolic
    if (
      vitalsForm.bloodPressure.systolic &&
      vitalsForm.bloodPressure.diastolic
    ) {
      const systolic = parseFloat(vitalsForm.bloodPressure.systolic);
      const diastolic = parseFloat(vitalsForm.bloodPressure.diastolic);

      if (!isNaN(systolic) && !isNaN(diastolic) && systolic <= diastolic) {
        newErrors.systolic = "Systolic must be greater than diastolic";
        newErrors.diastolic = "Diastolic must be less than systolic";
      }
    }

    // Validate heart rate
    if (vitalsForm.heartRate) {
      const error = validateNumericInput(
        "heartRate",
        vitalsForm.heartRate,
        VITAL_RANGES.heartRate.min,
        VITAL_RANGES.heartRate.max,
        VITAL_RANGES.heartRate.label
      );
      if (error) newErrors.heartRate = error;
    }

    // Validate temperature
    if (vitalsForm.temperature) {
      const error = validateNumericInput(
        "temperature",
        vitalsForm.temperature,
        VITAL_RANGES.temperature.min,
        VITAL_RANGES.temperature.max,
        VITAL_RANGES.temperature.label
      );
      if (error) newErrors.temperature = error;
    }

    // Validate weight
    if (vitalsForm.weight) {
      const error = validateNumericInput(
        "weight",
        vitalsForm.weight,
        VITAL_RANGES.weight.min,
        VITAL_RANGES.weight.max,
        VITAL_RANGES.weight.label
      );
      if (error) newErrors.weight = error;
    }

    // Validate height
    if (vitalsForm.height) {
      const error = validateNumericInput(
        "height",
        vitalsForm.height,
        VITAL_RANGES.height.min,
        VITAL_RANGES.height.max,
        VITAL_RANGES.height.label
      );
      if (error) newErrors.height = error;
    }

    // Validate oxygen saturation
    if (vitalsForm.oxygenSaturation) {
      const error = validateNumericInput(
        "oxygenSaturation",
        vitalsForm.oxygenSaturation,
        VITAL_RANGES.oxygenSaturation.min,
        VITAL_RANGES.oxygenSaturation.max,
        VITAL_RANGES.oxygenSaturation.label
      );
      if (error) newErrors.oxygenSaturation = error;
    }

    // Validate respiratory rate
    if (vitalsForm.respiratoryRate) {
      const error = validateNumericInput(
        "respiratoryRate",
        vitalsForm.respiratoryRate,
        VITAL_RANGES.respiratoryRate.min,
        VITAL_RANGES.respiratoryRate.max,
        VITAL_RANGES.respiratoryRate.label
      );
      if (error) newErrors.respiratoryRate = error;
    }

    setErrors(newErrors);
    setGeneralError("");

    return Object.keys(newErrors).length === 0;
  };

  const handleVitalsSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Additional check for patient
    if (!patient || !patient._id) {
      setGeneralError("Patient information is missing. Please try again.");
      return;
    }

    setLoading(true);
    setGeneralError("");

    try {
      const vitalsData = {
        patientId: patient._id,
        ...vitalsForm,
      };

      console.log("Submitting vitals:", vitalsData);
      const res = await addVitals(vitalsData);
      console.log("Add vitals response:", res);

      if (res && res.success) {
        alert("Vitals recorded successfully!");
        closeModal();
      } else {
        throw new Error(res?.message || "Failed to record vitals");
      }
    } catch (error) {
      console.error("Error adding vitals:", error);
      setGeneralError(
        error.response?.data?.message ||
          error.message ||
          "Failed to record vitals. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateBloodPressure = (field, value) => {
    setVitalsForm({
      ...vitalsForm,
      bloodPressure: {
        ...vitalsForm.bloodPressure,
        [field]: value,
      },
    });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateVitalField = (field, value) => {
    setVitalsForm({
      ...vitalsForm,
      [field]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Vitals Button */}
      <div className="text-center">
        <button
          onClick={openModal}
          className="flex items-center gap-2 mx-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add New Vitals
        </button>
      </div>

      {/* Vitals Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Record Vital Signs
                  </h3>
                  <p className="text-sm text-gray-500">
                    Patient: {patient?.fullname || "Unknown Patient"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* General Error Message */}
              {generalError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Validation Error
                    </p>
                    <p className="text-sm text-red-700 mt-1">{generalError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Blood Pressure - Systolic */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Systolic Pressure
                    </label>
                  </div>
                  <input
                    type="number"
                    placeholder="120"
                    value={vitalsForm.bloodPressure.systolic}
                    onChange={(e) =>
                      updateBloodPressure("systolic", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.systolic
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">mmHg (70-250)</p>
                  {errors.systolic && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.systolic}
                    </p>
                  )}
                </div>

                {/* Blood Pressure - Diastolic */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Diastolic Pressure
                    </label>
                  </div>
                  <input
                    type="number"
                    placeholder="80"
                    value={vitalsForm.bloodPressure.diastolic}
                    onChange={(e) =>
                      updateBloodPressure("diastolic", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.diastolic
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">mmHg (40-150)</p>
                  {errors.diastolic && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.diastolic}
                    </p>
                  )}
                </div>

                {/* Heart Rate */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-pink-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Heart Rate
                    </label>
                  </div>
                  <input
                    type="number"
                    placeholder="72"
                    value={vitalsForm.heartRate}
                    onChange={(e) =>
                      updateVitalField("heartRate", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.heartRate
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">bpm (30-220)</p>
                  {errors.heartRate && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.heartRate}
                    </p>
                  )}
                </div>

                {/* Respiratory Rate */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Respiratory Rate
                    </label>
                  </div>
                  <input
                    type="number"
                    placeholder="16"
                    value={vitalsForm.respiratoryRate}
                    onChange={(e) =>
                      updateVitalField("respiratoryRate", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.respiratoryRate
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    breaths/min (8-60)
                  </p>
                  {errors.respiratoryRate && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.respiratoryRate}
                    </p>
                  )}
                </div>

                {/* Temperature */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Temperature
                    </label>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={vitalsForm.temperature}
                    onChange={(e) =>
                      updateVitalField("temperature", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.temperature
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">°F (95-108)</p>
                  {errors.temperature && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.temperature}
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-5 h-5 text-green-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Weight
                    </label>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={vitalsForm.weight}
                    onChange={(e) => updateVitalField("weight", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.weight
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">kg (0.5-500)</p>
                  {errors.weight && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.weight}
                    </p>
                  )}
                </div>

                {/* Height */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Ruler className="w-5 h-5 text-purple-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Height
                    </label>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5.8"
                    value={vitalsForm.height}
                    onChange={(e) => updateVitalField("height", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.height
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">feet (1-9)</p>
                  {errors.height && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.height}
                    </p>
                  )}
                </div>

                {/* Oxygen Saturation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5 text-cyan-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Oxygen Saturation
                    </label>
                  </div>
                  <input
                    type="number"
                    placeholder="98"
                    min="0"
                    max="100"
                    value={vitalsForm.oxygenSaturation}
                    onChange={(e) =>
                      updateVitalField("oxygenSaturation", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.oxygenSaturation
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">% (70-100)</p>
                  {errors.oxygenSaturation && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.oxygenSaturation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleVitalsSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Record Vitals
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddVitals;
