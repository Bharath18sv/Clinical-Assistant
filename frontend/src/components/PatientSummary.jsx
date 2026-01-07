"use client";

import { User, Calendar, FileText, AlertTriangle, Pill } from "lucide-react";

export default function PatientSummary({ summary }) {
  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">No summary available</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
      </div>

      {/* Summary Period */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
      <div className="bg-white rounded-lg shadow-sm p-6">
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
        <div className="bg-white rounded-lg shadow-sm p-6">
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
  );
}
