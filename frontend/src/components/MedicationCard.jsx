import { Pill } from "lucide-react";

export default function MedicationCard({ medication }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="p-2 bg-purple-100 rounded-lg mr-4">
          <Pill className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{medication.name}</h3>
          <p className="text-sm text-gray-500">
            {medication.dosage} • {medication.frequency}
          </p>
          <p className="text-xs text-gray-400">
            Started: {medication.startDate}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      </div>
    </div>
  );
}
