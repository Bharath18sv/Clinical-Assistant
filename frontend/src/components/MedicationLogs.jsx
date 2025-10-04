import React from "react";
import { Plus, Pill } from "lucide-react";

const MedicationLogs = ({
  prescriptionStatus,
  setShowLogModal,
  medicationLogs,
  getStatusColor,
}) => {
  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Medication Logs
          </h2>
          {prescriptionStatus === "active" && (
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Log Entry
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Medication
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Dosage
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {medicationLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Pill className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-gray-900">
                          {log.medicationName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-gray-900">
                          {new Date(log.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {log.timeOfDay}
                        </p>
                        {log.takenAt && (
                          <p className="text-xs text-gray-500">
                            Taken: {new Date(log.takenAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{log.dosage}mg</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm max-w-xs truncate">
                      {log.notes || "-"}
                      {log.sideEffects && (
                        <p className="text-red-600 text-xs mt-1">
                          Side effects: {log.sideEffects}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationLogs;
