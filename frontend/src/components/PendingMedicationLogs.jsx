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
  Plus,
} from "lucide-react";
import {
  getPatientPendingMedicationLogs,
  updateMedicationLogStatus,
} from "@/utils/api";

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
      const response = await getPatientPendingMedicationLogs();
      if (response.success) {
        setPendingLogs(response.data.logs);
        setLogsByDate(response.data.logsByDate);
      }
    } catch (error) {
      console.error("Error fetching pending logs:", error);
      setError("Failed to fetch pending medication logs");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (logId, status) => {
    try {
      const response = await updateMedicationLogStatus(logId, { status });
      if (response.success) {
        // Update local state
        setPendingLogs((prevLogs) =>
          prevLogs.map((log) =>
            log._id === logId ? { ...log, status: response.data.status } : log
          )
        );

        // Update logsByDate
        setLogsByDate((prevLogsByDate) => {
          const newLogsByDate = { ...prevLogsByDate };
          Object.keys(newLogsByDate).forEach((date) => {
            newLogsByDate[date] = newLogsByDate[date].map((log) =>
              log._id === logId ? { ...log, status: response.data.status } : log
            );
          });
          return newLogsByDate;
        });

        alert("Medication status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update medication status");
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
        // Update local state
        setPendingLogs((prevLogs) =>
          prevLogs.map((log) =>
            log._id === editingLog._id ? response.data : log
          )
        );

        // Update logsByDate
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
        alert("Medication log updated successfully!");
      }
    } catch (error) {
      console.error("Error updating log:", error);
      alert("Failed to update medication log");
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
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "taken":
        return "text-green-700 bg-green-100 border-green-200";
      case "missed":
        return "text-red-700 bg-red-100 border-red-200";
      case "skipped":
        return "text-gray-700 bg-gray-100 border-gray-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
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

  const getTimeOfDayColor = (timeOfDay) => {
    switch (timeOfDay) {
      case "morning":
        return "bg-orange-100 text-orange-800";
      case "afternoon":
        return "bg-yellow-100 text-yellow-800";
      case "evening":
        return "bg-blue-100 text-blue-800";
      case "night":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
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

  const getUpcomingLogs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return pendingLogs.filter((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate >= today && log.status === "pending";
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          Loading pending medications...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  const upcomingLogs = getUpcomingLogs();
  const todayLogs = getTodayLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Medication Schedule
              </h2>
              <p className="text-sm text-gray-600">
                Manage your scheduled medications
              </p>
            </div>
          </div>
          <button
            onClick={fetchPendingLogs}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Today's Medications */}
      {todayLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Today's Medications ({todayLogs.length})
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {todayLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {log.medicationName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {log.dosage}mg • {log.timeOfDay}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getTimeOfDayColor(
                      log.timeOfDay
                    )}`}
                  >
                    {log.timeOfDay}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      log.status
                    )}`}
                  >
                    {getStatusIcon(log.status)}
                    {log.status}
                  </span>

                  <div className="flex gap-2">
                    {log.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(log._id, "taken")}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as taken"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(log._id, "missed")}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Mark as missed"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEditLog(log)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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

      {/* Upcoming Medications */}
      {upcomingLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Upcoming Medications ({upcomingLogs.length})
            </h3>
          </div>
          <div className="p-6">
            {Object.entries(logsByDate)
              .filter(([date]) => {
                const logDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return logDate > today;
              })
              .map(([date, logs]) => (
                <div key={date} className="mb-6 last:mb-0">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    {formatDate(date)}
                  </h4>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                            <Pill className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {log.medicationName}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {log.dosage}mg • {log.timeOfDay}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getTimeOfDayColor(
                              log.timeOfDay
                            )}`}
                          >
                            {log.timeOfDay}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              log.status
                            )}`}
                          >
                            {getStatusIcon(log.status)}
                            {log.status}
                          </span>

                          <button
                            onClick={() => handleEditLog(log)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
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
      {pendingLogs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Pending Medications
          </h3>
          <p className="text-gray-600">
            You don't have any pending medications scheduled at the moment.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit Medication Log
                </h3>
              </div>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Pill className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {editingLog.medicationName} - {editingLog.dosage}mg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="taken">Taken</option>
                  <option value="missed">Missed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows="3"
                  placeholder="Add any notes about taking this medication..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Side Effects
                </label>
                <textarea
                  value={editForm.sideEffects}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sideEffects: e.target.value })
                  }
                  rows="2"
                  placeholder="Report any side effects experienced..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingMedicationLogs;
