"use client";

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import PendingMedicationLogs from "@/components/PendingMedicationLogs";
import { getPatientMedicationLogs } from "@/utils/api";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  BarChart3,
} from "lucide-react";

export default function PatientMedicationsPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("pending");
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    medication: "all",
    dateRange: "all",
  });

  useEffect(() => {
    if (activeTab === "history") {
      fetchAllLogs();
    }
  }, [activeTab]);

  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      const response = await getPatientMedicationLogs();
      if (response.success) {
        setAllLogs(response.data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching all logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueMedications = () => {
    const medicationSet = new Set();
    allLogs.forEach((log) => {
      medicationSet.add(log.medicationName);
    });
    return Array.from(medicationSet).sort();
  };

  const getDateRangeFilter = () => {
    const today = new Date();
    const startDate = new Date();

    switch (filters.dateRange) {
      case "today":
        return [today, today];
      case "week":
        startDate.setDate(today.getDate() - 7);
        return [startDate, today];
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        return [startDate, today];
      default:
        return null;
    }
  };

  const filteredLogs = allLogs.filter((log) => {
    const matchesMedication =
      filters.medication === "all" || log.medicationName === filters.medication;

    const matchesStatus =
      filters.status === "all" || log.status === filters.status;

    let matchesDate = true;
    if (filters.dateRange !== "all") {
      const dateRange = getDateRangeFilter();
      if (dateRange) {
        const logDate = new Date(log.date);
        const [startDate, endDate] = dateRange;
        matchesDate = logDate >= startDate && logDate <= endDate;
      }
    }

    return matchesMedication && matchesStatus && matchesDate;
  });

  const getAdherenceStats = () => {
    const taken = allLogs.filter((log) => log.status === "taken").length;
    const missed = allLogs.filter((log) => log.status === "missed").length;
    const skipped = allLogs.filter((log) => log.status === "skipped").length;
    const pending = allLogs.filter((log) => log.status === "pending").length;
    const total = allLogs.length;

    return {
      taken,
      missed,
      skipped,
      pending,
      total,
      adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
    };
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = getAdherenceStats();
  const uniqueMedications = getUniqueMedications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Medications</h1>
        <p className="text-gray-600 mt-2">
          Manage your medication schedule and track your adherence
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "pending", name: "Pending", icon: Clock },
              { id: "history", name: "History", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "pending" && <PendingMedicationLogs />}

          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Adherence Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Overall Adherence</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats.adherenceRate}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Logs</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {stats.total}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Doses Taken</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {stats.taken}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Doses Missed</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">
                        {stats.missed}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medication
                    </label>
                    <select
                      value={filters.medication}
                      onChange={(e) =>
                        setFilters({ ...filters, medication: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Medications</option>
                      {uniqueMedications.map((medication) => (
                        <option key={medication} value={medication}>
                          {medication}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="taken">Taken</option>
                      <option value="missed">Missed</option>
                      <option value="skipped">Skipped</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) =>
                        setFilters({ ...filters, dateRange: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>
                {(filters.medication !== "all" ||
                  filters.status !== "all" ||
                  filters.dateRange !== "all") && (
                  <button
                    onClick={() =>
                      setFilters({
                        status: "all",
                        medication: "all",
                        dateRange: "all",
                      })
                    }
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Medication Logs Table */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Medication Log History
                    </h3>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {filteredLogs.length} of {allLogs.length} logs
                  </p>
                </div>

                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading medication logs...</p>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No medication logs found
                    </h3>
                    <p className="text-gray-600">
                      {allLogs.length === 0
                        ? "No medication logs have been recorded yet."
                        : "No logs match your current filters."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                            Medication
                          </th>
                          <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                            Date & Time
                          </th>
                          <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                            Dosage
                          </th>
                          <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                            Status
                          </th>
                          <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredLogs.map((log) => (
                          <tr
                            key={log._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-purple-600" />
                                <span className="font-medium text-gray-900">
                                  {log.medicationName}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-gray-900 font-medium">
                                  {formatDate(log.date)}
                                </p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {log.timeOfDay}
                                </p>
                                {log.takenAt && (
                                  <p className="text-xs text-gray-500">
                                    Logged: {formatDateTime(log.takenAt)}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-900">
                              {log.dosage}mg
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  log.status
                                )}`}
                              >
                                {getStatusIcon(log.status)}
                                {log.status.charAt(0).toUpperCase() +
                                  log.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="max-w-xs">
                                {log.notes ? (
                                  <p className="text-sm text-gray-600 truncate">
                                    {log.notes}
                                  </p>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    -
                                  </span>
                                )}
                                {log.sideEffects && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Side effects: {log.sideEffects}
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
