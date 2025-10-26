import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pill,
  Calendar,
  Edit3,
  Save,
  X,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  RefreshCw,
} from "lucide-react";
import {
  getPatientPendingMedicationLogs,
  updateMedicationLogStatus,
} from "@/utils/api";
import toast from "react-hot-toast";

const PendingMedicationLogs = () => {
  const [pendingLogs, setPendingLogs] = useState([]);
  const [logsByDate, setLogsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    notes: "",
    sideEffects: "",
  });

  useEffect(() => {
    fetchPendingLogs();
  }, []);

  const fetchPendingLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPatientPendingMedicationLogs();
      if (response?.success) {
        // Filter out cancelled and completed prescriptions
        const activeLogs = (response.data?.logs || []).filter(
          (log) =>
            log.prescriptionId?.status !== "cancelled" &&
            log.prescriptionId?.status !== "completed"
        );
        setPendingLogs(activeLogs);

        // Filter logs by date and only include active prescriptions
        const filteredLogsByDate = {};
        Object.keys(response.data?.logsByDate || {}).forEach((date) => {
          const dateLogs = response.data.logsByDate[date].filter(
            (log) =>
              log.prescriptionId?.status !== "cancelled" &&
              log.prescriptionId?.status !== "completed"
          );
          if (dateLogs.length > 0) {
            filteredLogsByDate[date] = dateLogs;
          }
        });
        setLogsByDate(filteredLogsByDate);
      } else {
        setPendingLogs([]);
        setLogsByDate({});
      }
    } catch (error) {
      console.error("Error fetching pending logs:", error);
      setPendingLogs([]);
      setLogsByDate({});
      setError("Failed to fetch medication logs");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (logId, status) => {
    try {
      const response = await updateMedicationLogStatus(logId, { status });
      if (response.success) {
        setPendingLogs((prevLogs) =>
          prevLogs.map((log) =>
            log._id === logId ? { ...log, status: response.data.status } : log
          )
        );

        setLogsByDate((prevLogsByDate) => {
          const newLogsByDate = { ...prevLogsByDate };
          Object.keys(newLogsByDate).forEach((date) => {
            newLogsByDate[date] = newLogsByDate[date].map((log) =>
              log._id === logId ? { ...log, status: response.data.status } : log
            );
          });
          return newLogsByDate;
        });

        toast.success("Medication status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update medication status");
    }
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setEditForm({
      status: log.status,
      notes: log.notes || "",
      sideEffects: log.sideEffects || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingLog) return;

    try {
      const response = await updateMedicationLogStatus(
        editingLog._id,
        editForm
      );
      if (response.success) {
        setPendingLogs((prevLogs) =>
          prevLogs.map((log) =>
            log._id === editingLog._id ? response.data : log
          )
        );

        setLogsByDate((prevLogsByDate) => {
          const newLogsByDate = { ...prevLogsByDate };
          Object.keys(newLogsByDate).forEach((date) => {
            newLogsByDate[date] = newLogsByDate[date].map((log) =>
              log._id === editingLog._id ? response.data : log
            );
          });
          return newLogsByDate;
        });

        setEditingLog(null);
        toast.success("Medication log updated successfully!");
      }
    } catch (error) {
      console.error("Error updating log:", error);
      toast.error("Failed to update medication log");
    }
  };

  const cancelEdit = () => {
    setEditingLog(null);
    setEditForm({
      status: "",
      notes: "",
      sideEffects: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-300";
      case "taken":
        return "bg-green-50 text-green-700 border-green-300";
      case "missed":
        return "bg-red-50 text-red-700 border-red-300";
      case "skipped":
        return "bg-gray-50 text-gray-700 border-gray-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "taken":
        return <CheckCircle className="w-4 h-4" />;
      case "missed":
        return <XCircle className="w-4 h-4" />;
      case "skipped":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTimeOfDayIcon = (timeOfDay) => {
    switch (timeOfDay) {
      case "morning":
        return <Sun className="w-4 h-4" />;
      case "afternoon":
        return <CloudSun className="w-4 h-4" />;
      case "evening":
        return <Sunset className="w-4 h-4" />;
      case "night":
        return <Moon className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getTodayLogs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return pendingLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  };

  const getUpcomingLogs = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return pendingLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate >= tomorrow;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Data
            </h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPendingLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const todayLogs = getTodayLogs();
  const upcomingLogs = getUpcomingLogs();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Medication Schedule
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Track your daily medications
                </p>
              </div>
            </div>
            <button
              onClick={fetchPendingLogs}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Doses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {todayLogs.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900">
                  {upcomingLogs.length}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Medications */}
        {todayLogs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Today's Medications ({todayLogs.length})
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {todayLogs.map((log) => (
                <div
                  key={log._id}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                        <Pill className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {log.medicationName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {log.dosage}mg • {log.timeOfDay}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(
                          log.status
                        )}`}
                      >
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>

                      {log.status === "pending" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusUpdate(log._id, "taken")}
                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Mark as taken"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(log._id, "missed")
                            }
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Mark as missed"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleEditLog(log)}
                        className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Medications (View Only - No Actions) */}
        {upcomingLogs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Medications
                </h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                View-only. You can log these when the time comes.
              </p>
            </div>
            <div className="p-6">
              {Object.entries(logsByDate)
                .filter(([date]) => {
                  const logDate = new Date(date);
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(0, 0, 0, 0);
                  return logDate >= tomorrow;
                })
                .map(([date, logs]) => (
                  <div key={date} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <h4 className="text-sm font-semibold text-gray-700">
                        {formatDate(date)}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log._id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-white rounded-lg flex-shrink-0">
                                <Pill className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-900 truncate">
                                  {log.medicationName}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {log.dosage}mg • {log.timeOfDay}
                                </p>
                              </div>
                            </div>

                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              {getTimeOfDayIcon(log.timeOfDay)}
                              Scheduled
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todayLogs.length === 0 && upcomingLogs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Medications Scheduled
            </h3>
            <p className="text-gray-600">
              You don't have any active medications at the moment.
            </p>
          </div>
        )}

        {/* Edit Modal */}
        {editingLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Edit Medication Log
                    </h3>
                  </div>
                  <button
                    onClick={cancelEdit}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Pill className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {editingLog.medicationName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {editingLog.dosage}mg
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="taken">Taken</option>
                    <option value="missed">Missed</option>
                    <option value="skipped">Skipped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    rows="2"
                    placeholder="Add notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Side Effects
                  </label>
                  <textarea
                    value={editForm.sideEffects}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sideEffects: e.target.value })
                    }
                    rows="2"
                    placeholder="Report any side effects..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingMedicationLogs;
