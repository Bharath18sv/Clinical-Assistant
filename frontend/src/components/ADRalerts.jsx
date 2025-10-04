import React from "react";
import { Zap } from "lucide-react";

function ADRalerts({ patient }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">ADR Alerts</h3>
      </div>
      {patient.adrAlerts?.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="space-y-3">
            {patient.adrAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === "Critical"
                    ? "bg-red-50 border-red-400"
                    : alert.severity === "High"
                    ? "bg-orange-50 border-orange-400"
                    : "bg-yellow-50 border-yellow-400"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-sm font-medium ${
                      alert.severity === "Critical"
                        ? "text-red-800"
                        : alert.severity === "High"
                        ? "text-orange-800"
                        : "text-yellow-800"
                    }`}
                  >
                    {alert.type} - {alert.severity}
                  </span>
                  <span className="text-xs text-gray-500">{alert.date}</span>
                </div>
                <p className="text-sm text-gray-700">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">No ADR alerts.</p>
      )}
    </div>
  );
}

export default ADRalerts;
