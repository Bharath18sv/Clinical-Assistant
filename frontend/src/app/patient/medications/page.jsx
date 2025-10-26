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
  Pill,
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
        // Filter out logs from cancelled/completed prescriptions
        const activeLogs = (response.data.logs || []).filter(
          (log) =>
            log.prescriptionId?.status !== "cancelled" &&
            log.prescriptionId?.status !== "completed"
        );
        setAllLogs(activeLogs);
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
        return "text-yellow-700 bg-yellow-50 border-yellow-300";
      case "taken":
        return "text-green-700 bg-green-50 border-green-300";
      case "missed":
        return "text-red-700 bg-red-50 border-red-300";
      case "skipped":
        return "text-gray-700 bg-gray-50 border-gray-300";
      default:
        return "text-gray-700 bg-gray-50 border-gray-300";
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Medications
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage your medication schedule and track adherence
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex px-6">
              {[
                { id: "pending", name: "Schedule", icon: Clock },
                { id: "history", name: "History", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Adherence Rate
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.adherenceRate}%
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Logs</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.total}
                        </p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Doses Taken
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.taken}
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Doses Missed
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {stats.missed}
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 rounded-lg">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Filters</h3>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Medication History
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Showing {filteredLogs.length} of {allLogs.length} logs
                        </p>
                      </div>
                      <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-600 text-sm">
                        Loading medication logs...
                      </p>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        No medication logs found
                      </h3>
                      <p className="text-gray-600 text-sm">
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
                            <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">
                              Medication
                            </th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">
                              Date & Time
                            </th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">
                              Dosage
                            </th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">
                              Status
                            </th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">
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
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-blue-50 rounded">
                                    <Pill className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <span className="font-medium text-gray-900 text-sm">
                                    {log.medicationName}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <div>
                                  <p className="text-gray-900 text-sm font-medium">
                                    {formatDate(log.date)}
                                  </p>
                                  <p className="text-xs text-gray-600 capitalize">
                                    {log.timeOfDay}
                                  </p>
                                  {log.takenAt && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Logged: {formatDateTime(log.takenAt)}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-5 text-gray-900 text-sm">
                                {log.dosage}mg
                              </td>
                              <td className="py-4 px-5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                                    log.status
                                  )}`}
                                >
                                  {getStatusIcon(log.status)}
                                  {log.status.charAt(0).toUpperCase() +
                                    log.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                <div className="max-w-xs">
                                  {log.notes ? (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {log.notes}
                                    </p>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      No notes
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
    </div>
  );
}
