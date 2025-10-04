import { Pill } from "lucide-react";

export default function MedicationList({ prescription }) {
  if (!prescription?.medications || prescription.medications.length === 0) {
    return (
      <p className="text-gray-600 text-sm">
        No medications prescribed for this patient.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Medications</h2>
      <ul className="space-y-4">
        {prescription.medications.map((medication, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pill className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{medication.name}</p>
                <p className="text-sm text-gray-600">
                  {medication.dosage}mg · {medication.duration} days
                </p>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
