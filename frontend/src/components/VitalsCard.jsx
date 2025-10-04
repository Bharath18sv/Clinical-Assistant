import React, { useEffect, useState } from "react";
import { getVitalsById } from "@/utils/api";

function VitalsCard({ patient }) {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(
      "useEffect triggered for VitalsCard with patient ID:",
      patient._id
    );
    fetchVitals();
  }, [patient._id]);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      console.log("Fetching vitals for patient ID:", patient._id);
      const response = await getVitalsById(patient._id);
      console.log("Fetched vitals data in card:", response.data);
      setVitals(response.data || []);
    } catch (error) {
      console.error("Error fetching vitals data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getVitalStatus = (vital) => {
    const systolic = vital.bloodPressure?.systolic;
    const diastolic = vital.bloodPressure?.diastolic;

    if (systolic && diastolic) {
      if (systolic > 140 || diastolic > 90) return "high";
      if (systolic < 90 || diastolic < 60) return "low";
      return "normal";
    }
    return "unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "high":
        return "text-red-600 bg-red-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      case "normal":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const hasVitals = vitals && vitals.length > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Recent Vitals History
          </h3>
          {hasVitals && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {vitals.length} record{vitals.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {hasVitals ? (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date Taken
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Blood Pressure
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Heart Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Temperature
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {vitals.map((vital, index) => {
                      const status = getVitalStatus(vital);
                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(vital.takenAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {vital.bloodPressure?.systolic &&
                              vital.bloodPressure?.diastolic
                                ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}`
                                : "-"}
                            </div>
                            {vital.bloodPressure?.systolic &&
                              vital.bloodPressure?.diastolic && (
                                <div className="text-xs text-gray-500">
                                  mmHg
                                </div>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {vital.heartRate || "-"}
                            </div>
                            {vital.heartRate && (
                              <div className="text-xs text-gray-500">bpm</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {vital.temperature || "-"}
                            </div>
                            {vital.temperature && (
                              <div className="text-xs text-gray-500">°F</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-mono">
                              {vital.weight || "-"}
                            </div>
                            {vital.weight && (
                              <div className="text-xs text-gray-500">lbs</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {vitals.map((vital, index) => {
                const status = getVitalStatus(vital);
                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(vital.takenAt)}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Blood Pressure
                        </div>
                        <div className="text-sm font-mono text-gray-900">
                          {vital.bloodPressure?.systolic &&
                          vital.bloodPressure?.diastolic
                            ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg`
                            : "-"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Heart Rate
                        </div>
                        <div className="text-sm font-mono text-gray-900">
                          {vital.heartRate ? `${vital.heartRate} bpm` : "-"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Temperature
                        </div>
                        <div className="text-sm font-mono text-gray-900">
                          {vital.temperature ? `${vital.temperature}°F` : "-"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Weight
                        </div>
                        <div className="text-sm font-mono text-gray-900">
                          {vital.weight ? `${vital.weight} lbs` : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Vitals Recorded
            </h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Vital signs will appear here once they are recorded for this
              patient.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VitalsCard;
