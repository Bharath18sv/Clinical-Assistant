import { Pill, Plus } from "lucide-react";

export default function MedicationCard({
  prescription,
  setShowLogModal,
  setLogForm,
  getAdherenceStats,
  setSelectedMedication,
}) {
  // console.log("prescription in MedicationCard:", prescription);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {prescription.medications.map((medication, index) => {
        const stats = getAdherenceStats(medication.name);
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Pill className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {medication.name}
                  </h3>
                  <p className="text-gray-600">{medication.dosage}mg</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  medication.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {medication.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="font-medium">{medication.duration} days</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Schedule</p>
                <div className="flex gap-2">
                  {medication.schedule.map((time) => (
                    <span
                      key={time}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {medication.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-sm text-gray-800">{medication.notes}</p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Adherence Rate</span>
                  <span
                    className={`font-medium ${
                      stats.adherenceRate >= 90
                        ? "text-green-600"
                        : stats.adherenceRate >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.adherenceRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${
                      stats.adherenceRate >= 90
                        ? "bg-green-500"
                        : stats.adherenceRate >= 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${stats.adherenceRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.taken} of {stats.total} doses taken
                </p>
              </div>

              {prescription.status == "active" && (
                <button
                  onClick={() => {
                    setSelectedMedication(medication);
                    setLogForm((prev) => ({
                      ...prev,
                      medicationName: medication.name,
                      dosage: medication.dosage,
                    }));
                    setShowLogModal(true);
                  }}
                  className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Log Dose
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
