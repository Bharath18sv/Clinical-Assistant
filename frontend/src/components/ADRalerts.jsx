import React from 'react';
import { AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

const ADRAlerts = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">No ADR warnings detected</span>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        ⚠️ ADR Warnings ({alerts.length})
      </h3>
      
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">
                  {Array.isArray(alert.medications) ? alert.medications.join(' + ') : alert.medication}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/50 uppercase">
                  {alert.type}
                </span>
                {alert.confidence && (
                  <span className="text-xs text-gray-600">
                    ({Math.round(alert.confidence * 100)}% confidence)
                  </span>
                )}
              </div>
              <p className="text-sm mb-2">{alert.message}</p>
              <p className="text-xs font-medium">
                💡 Recommendation: {alert.recommendation}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ADRAlerts;
