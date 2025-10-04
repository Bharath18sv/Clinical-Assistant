import React from "react";
import { Stethoscope } from "lucide-react";

function SymptomsLog({ patient }) {
  return (
    <div>
      {}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Symptoms Log
          </h3>
        </div>
        {patient.symptomsLog?.length > 0 ? (
          <div className="space-y-4">
            {patient.symptomsLog?.map((log, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap gap-2">
                    {log.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{log.date}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Severity:{" "}
                  <span
                    className={`font-medium ${
                      log.severity === "High"
                        ? "text-red-600"
                        : log.severity === "Moderate"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {log.severity}
                  </span>
                </p>
                {log.notes && (
                  <p className="text-sm text-gray-700">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No symptoms logged yet.</p>
        )}
      </div>
    </div>
  );
}

export default SymptomsLog;
