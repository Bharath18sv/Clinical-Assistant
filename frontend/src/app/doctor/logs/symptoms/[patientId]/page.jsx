"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Activity,
  Thermometer,
} from "lucide-react";
import { getSymptomLogsOfPatientByDoctor } from "@/utils/api/symptoms.api";
import { useParams } from "next/navigation";

const DoctorSymptomLogs = () => {
  const params = useParams();
  const patientId = params.patientId;
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sort States
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    if (patientId) {
      fetchSymptomLogs();
    }
  }, [patientId]);

  const fetchSymptomLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSymptomLogsOfPatientByDoctor(patientId);

      console.log("Symptom logs response:", response);

      if (response && response.data) {
        setSymptomLogs(response.data);
        setFilteredLogs(response.data);

        // Extract unique symptoms from all logs
        const allSymptoms = response.data.flatMap((log) => log.symptoms || []);
        const uniqueSymptoms = [...new Set(allSymptoms)];
        setSymptoms(uniqueSymptoms);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching symptom logs:", error);
      setError("Failed to fetch symptom logs. Please try again.");
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...symptomLogs];

    // Search filter - search in symptoms array
    if (searchTerm) {
      result = result.filter((log) => {
        const symptomsString = (log.symptoms || []).join(" ").toLowerCase();
        return symptomsString.includes(searchTerm.toLowerCase());
      });
    }

    // Symptom filter
    if (selectedSymptom) {
      result = result.filter((log) =>
        (log.symptoms || []).includes(selectedSymptom)
      );
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter(
        (log) => new Date(log.createdAt) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      result = result.filter((log) => new Date(log.createdAt) <= toDate);
    }

    // Sorting
    result.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "date":
          compareA = new Date(a.createdAt);
          compareB = new Date(b.createdAt);
          break;
        case "symptom":
          compareA = (a.symptoms || [])[0]?.toLowerCase() || "";
          compareB = (b.symptoms || [])[0]?.toLowerCase() || "";
          break;
        case "count":
          compareA = (a.symptoms || []).length;
          compareB = (b.symptoms || []).length;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    setFilteredLogs(result);
  }, [
    searchTerm,
    selectedSymptom,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    symptomLogs,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSymptom("");
    setDateFrom("");
    setDateTo("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const activeFiltersCount = [selectedSymptom, dateFrom, dateTo].filter(
    Boolean
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading symptom logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchSymptomLogs}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Patient Symptom Logs
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage patient symptom reports
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by symptom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter size={20} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Symptom Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptom
                  </label>
                  <select
                    value={selectedSymptom}
                    onChange={(e) => setSelectedSymptom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Symptoms</option>
                    {symptoms.map((symptom, index) => (
                      <option key={index} value={symptom}>
                        {symptom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredLogs.length}
                </p>
              </div>
              <AlertCircle className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Symptoms</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredLogs.reduce(
                    (sum, log) => sum + (log.symptoms?.length || 0),
                    0
                  )}
                </p>
              </div>
              <Activity className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logs with Vitals</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLogs.filter((log) => log.vitals !== null).length}
                </p>
              </div>
              <Thermometer className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 font-medium">Sort by:</span>

            <button
              onClick={() => toggleSort("date")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                sortBy === "date"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Date
              {sortBy === "date" &&
                (sortOrder === "asc" ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                ))}
            </button>

            <button
              onClick={() => toggleSort("symptom")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                sortBy === "symptom"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Symptom
              {sortBy === "symptom" &&
                (sortOrder === "asc" ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                ))}
            </button>

            <button
              onClick={() => toggleSort("count")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                sortBy === "count"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Symptom Count
              {sortBy === "count" &&
                (sortOrder === "asc" ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                ))}
            </button>
          </div>
        </div>

        {/* Symptom Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No symptom logs found</p>
              <p className="text-gray-400 text-sm mt-2">
                {symptomLogs.length === 0
                  ? "This patient hasn't logged any symptoms yet"
                  : "Try adjusting your filters or search terms"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symptoms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vitals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="mr-2 text-gray-400" size={16} />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {log.symptoms && log.symptoms.length > 0 ? (
                            log.symptoms.map((symptom, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                              >
                                {symptom}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">
                              No symptoms recorded
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.vitals ? (
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <Thermometer size={14} className="text-red-500" />
                              <span className="text-xs text-gray-600">
                                Vitals recorded
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No vitals
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="text-green-600" size={16} />
                          </div>
                          <div className="ml-3">
                            <div className="text-xs text-gray-500">
                              ID: {log.doctorId.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredLogs.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredLogs.length} of {symptomLogs.length} total logs
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSymptomLogs;
