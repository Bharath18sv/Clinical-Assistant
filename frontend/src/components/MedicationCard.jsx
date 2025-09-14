import { Pill } from "lucide-react";

export default function MedicationCard({ medication }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="icon-container icon-purple">
          <Pill className="h-5 w-5" />
        </div>
        <div className="ml-4">
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
        <span className="status-badge status-confirmed">
          Active
        </span>
      </div>
    </div>
  );
}
