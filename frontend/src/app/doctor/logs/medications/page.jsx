//doctor can view all the logs from all the patients
//doctor can filter the logs based on patient name, medication name, date range
//doctor can search the logs based on patient name, medication name
//doctor can sort the logs based on date, patient name, medication name

"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Pill,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  TrendingUp,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { getAllMedicationLogs } from "@/utils/api";

const AllMedicationLogsPage = () => {
  const router = useRouter();
  const { user, authLoading } = useContext(AuthContext);
  const doctorId = user?.data?.user?._id || user?._id;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPatient, setFilterPatient] = useState("all");
  const [filterMedication, setFilterMedication] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch all medication logs
  useEffect(() => {
    console.log("fetching all logs for doctor:", doctorId);
    fetchAllLogs();
  }, [doctorId, authLoading]);

  const fetchAllLogs = async () => {
    console.log("fetching all logs...");
    setLoading(true);
    setError(null);
    try {
      const response = await getAllMedicationLogs();
      console.log("Fetched all medication logs:", response);

      if (response.success && response.data) {
        setLogs(response.data.logs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching medication logs:", err);
      setError("Failed to fetch medication logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get unique patients and medications for filters
  const getUniquePatients = () => {
    const patientMap = new Map();
    logs.forEach((log) => {
      if (log.patientId) {
        const id = log.patientId._id || log.patientId;
        const name =
          log.patientId.fullname || log.patientId.name || "Unknown Patient";
        patientMap.set(id, { id, name });
      }
    });
    return Array.from(patientMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  const getUniqueMedications = () => {
    const medications = new Set();
    logs.forEach((log) => {
      if (log.medicationName) {
        medications.add(log.medicationName);
      }
    });
    return Array.from(medications).sort();
  };

  // Date range filter
  const getDateRangeFilter = () => {
    const today = new Date();
    const startDate = new Date();

    switch (filterDateRange) {
      case "today":
        return [today, today];
      case "week":
        startDate.setDate(today.getDate() - 7);
        return [startDate, today];
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        return [startDate, today];
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        return [startDate, today];
      default:
        return null;
    }
  };

  // Filter and search logic
  const getFilteredLogs = () => {
    return logs.filter((log) => {
      // Search filter
      const patientName = log.patientId?.fullname || log.patientId?.name || "";
      const matchesSearch =
        patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.medicationName.toLowerCase().includes(searchTerm.toLowerCase());

      // Patient filter
      const logPatientId = log.patientId?._id || log.patientId;
      const matchesPatient =
        filterPatient === "all" || logPatientId === filterPatient;

      // Medication filter
      const matchesMedication =
        filterMedication === "all" || log.medicationName === filterMedication;

      // Status filter
      const matchesStatus =
        filterStatus === "all" || log.status === filterStatus;

      // Date range filter
      let matchesDate = true;
      if (filterDateRange !== "all") {
        const dateRange = getDateRangeFilter();
        if (dateRange) {
          const logDate = new Date(log.date);
          const [startDate, endDate] = dateRange;
          endDate.setHours(23, 59, 59, 999);
          matchesDate = logDate >= startDate && logDate <= endDate;
        }
      }

      return (
        matchesSearch &&
        matchesPatient &&
        matchesMedication &&
        matchesStatus &&
        matchesDate
      );
    });
  };

  // Sorting logic
  const getSortedLogs = (filteredLogs) => {
    return [...filteredLogs].sort((a, b) => {
      let compareA, compareB;

      switch (sortField) {
        case "date":
          compareA = new Date(a.date).getTime();
          compareB = new Date(b.date).getTime();
          break;
        case "patient":
          compareA = (
            a.patientId?.fullname ||
            a.patientId?.name ||
            ""
          ).toLowerCase();
          compareB = (
            b.patientId?.fullname ||
            b.patientId?.name ||
            ""
          ).toLowerCase();
          break;
        case "medication":
          compareA = a.medicationName.toLowerCase();
          compareB = b.medicationName.toLowerCase();
          break;
        case "status":
          compareA = a.status;
          compareB = b.status;
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterPatient("all");
    setFilterMedication("all");
    setFilterStatus("all");
    setFilterDateRange("all");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterPatient !== "all") count++;
    if (filterMedication !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterDateRange !== "all") count++;
    return count;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "taken":
        return "text-green-700 bg-green-100 border-green-200";
      case "missed":
        return "text-red-700 bg-red-100 border-red-200";
      case "skipped":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
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

  const handleViewPatient = (patientId) => {
    router.push(`/patients/${patientId}`);
  };

  const handleViewPrescription = (prescriptionId) => {
    router.push(`/prescriptions/${prescriptionId}`);
  };

  // Calculate statistics
  const getStatistics = () => {
    const total = logs.length;
    const taken = logs.filter((log) => log.status === "taken").length;
    const missed = logs.filter((log) => log.status === "missed").length;
    const skipped = logs.filter((log) => log.status === "skipped").length;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { total, taken, missed, skipped, adherenceRate };
  };

  const filteredLogs = getFilteredLogs();
  const sortedLogs = getSortedLogs(filteredLogs);
  const uniquePatients = getUniquePatients();
  const uniqueMedications = getUniqueMedications();
  const stats = getStatistics();

  //   if (authLoading || loading) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //           <p className="text-gray-600 text-lg">Loading medication logs...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAllLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                All Medication Logs
              </h1>
              <p className="text-gray-600 mt-1">
                View and monitor medication adherence across all patients
              </p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                <p className="text-gray-600 text-sm">Overall Adherence</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats.adherenceRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Taken</p>
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
                <p className="text-gray-600 text-sm">Missed</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.missed}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Skipped</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats.skipped}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by patient name or medication name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter size={20} />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <select
                    value={filterPatient}
                    onChange={(e) => setFilterPatient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Patients</option>
                    {uniquePatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication
                  </label>
                  <select
                    value={filterMedication}
                    onChange={(e) => setFilterMedication(e.target.value)}
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
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="taken">Taken</option>
                    <option value="missed">Missed</option>
                    <option value="skipped">Skipped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>

              {getActiveFiltersCount() > 0 && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Medication Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Medication Logs
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {sortedLogs.length} of {logs.length} logs
                </p>
              </div>
            </div>
          </div>

          {sortedLogs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No medication logs found
              </h3>
              <p className="text-gray-600">
                {logs.length === 0
                  ? "No medication logs have been recorded yet."
                  : "No logs match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      className="text-left py-3 px-6 font-medium text-gray-900 text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("patient")}
                    >
                      <div className="flex items-center gap-2">
                        Patient
                        <SortIcon field="patient" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-6 font-medium text-gray-900 text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("medication")}
                    >
                      <div className="flex items-center gap-2">
                        Medication
                        <SortIcon field="medication" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-6 font-medium text-gray-900 text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        Date & Time
                        <SortIcon field="date" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                      Dosage
                    </th>
                    <th
                      className="text-left py-3 px-6 font-medium text-gray-900 text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                      Notes
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={log.patientId?.profilePic} alt="" className="h-10 w-15"/>
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.patientId?.fullname ||
                                log.patientId?.name ||
                                "Unknown Patient"}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID:{" "}
                              {(
                                log.patientId?._id ||
                                log.patientId ||
                                ""
                              ).slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-purple-600" />
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
                          {log.status === "taken" && <CheckCircle size={12} />}
                          {log.status === "missed" && <XCircle size={12} />}
                          {log.status === "skipped" && <Clock size={12} />}
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
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                          {log.sideEffects && (
                            <p className="text-xs text-red-600 mt-1 truncate">
                              Side effects: {log.sideEffects}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleViewPatient(
                                log.patientId?._id || log.patientId
                              )
                            }
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            title="View Patient"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {log.prescriptionId && (
                            <button
                              onClick={() =>
                                handleViewPrescription(log.prescriptionId)
                              }
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                              title="View Prescription"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
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
    </div>
  );
};

export default AllMedicationLogsPage;
