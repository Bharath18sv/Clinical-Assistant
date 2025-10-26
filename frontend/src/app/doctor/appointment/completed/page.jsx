"use client";
import { useEffect, useState } from "react";
import {
  fetchDoctorCompletedAppointments,
  startAppointment,
} from "@/utils/api";
import {
  Clock,
  User,
  Calendar,
  CheckCircle,
  Play,
  FileText,
  MessageSquare,
  RotateCcw,
  Filter,
  Search,
} from "lucide-react";

export default function DoctorCompletedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restartingIds, setRestartingIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDoctorCompletedAppointments();
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter appointments based on search and date filter
  useEffect(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patientId?.fullname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (apt) => new Date(apt.completedAt) >= filterDate
          );
          break;
        case "week":
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter(
            (apt) => new Date(apt.completedAt) >= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(filterDate.getMonth() - 1);
          filtered = filtered.filter(
            (apt) => new Date(apt.completedAt) >= filterDate
          );
          break;
      }
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, dateFilter, appointments]);

  const handleRestartAppointment = async (appointmentId) => {
    setRestartingIds((prev) => new Set([...prev, appointmentId]));
    try {
      const updated = await startAppointment(appointmentId);
      // Remove from completed list since it's now active
      setAppointments((prev) => prev.filter((x) => x._id !== appointmentId));
      // You might want to show a success message or redirect to active appointments
    } catch (error) {
      console.error("Failed to restart appointment:", error);
      // You might want to show an error toast here
    } finally {
      setRestartingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const dateOptions = {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    };

    const time = date.toLocaleTimeString("en-US", timeOptions);
    const dateStr = isToday
      ? "Today"
      : date.toLocaleDateString("en-US", dateOptions);

    return { date: dateStr, time };
  };

  const getAppointmentDuration = (scheduledAt, completedAt) => {
    const start = new Date(scheduledAt);
    const end = new Date(completedAt);
    const diffMinutes = Math.floor((end - start) / (1000 * 60));

    if (diffMinutes < 1) return "< 1 min";
    if (diffMinutes < 60) return `${diffMinutes} min`;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMinutes > 0)
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading completed appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Completed Appointments
          </h1>
        </div>
        <p className="text-gray-600">
          Review your completed consultations and restart if needed
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Completed
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.length > 0
                  ? Math.round(
                      appointments.reduce((total, apt) => {
                        const duration =
                          new Date(apt.completedAt) - new Date(apt.scheduledAt);
                        return total + duration / (1000 * 60);
                      }, 0) / appointments.length
                    )
                  : 0}{" "}
                min
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Filter className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Filtered Results
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredAppointments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or reason..."
              className="outline-none w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {searchTerm || dateFilter !== "all"
                ? "No Results Found"
                : "No Completed Appointments"}
            </h3>
            <p className="text-gray-600 max-w-md">
              {searchTerm || dateFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Completed appointments will appear here after you finish consultations."}
            </p>
            {(searchTerm || dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("all");
                }}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.length > 0 &&
            filteredAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.scheduledAt);
              const completedTime = formatDateTime(appointment.completedAt);
              const duration = getAppointmentDuration(
                appointment.scheduledAt,
                appointment.completedAt
              );
              const timeAgo = getTimeAgo(appointment.completedAt);
              const isRestarting = restartingIds.has(appointment._id);

              return (
                <div
                  key={appointment._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* Patient Info */}
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientId?.fullname ||
                              "Unknown Patient"}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-1 sm:space-y-0">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {date} at {time}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              Duration: {duration}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed {timeAgo}
                            </span>
                            <span className="text-xs text-gray-500">
                              Ended at {completedTime.time} on{" "}
                              {completedTime.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
                        <button className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                          <FileText className="h-4 w-4 mr-2" />
                          View Notes
                        </button>
                        <button
                          onClick={() =>
                            handleRestartAppointment(appointment._id)
                          }
                          disabled={isRestarting}
                          className="flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                        >
                          {isRestarting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Starting...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restart Session
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {appointment.reason && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Reason
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.reason}
                            </p>
                          </div>
                        )}
                        {appointment.diagnosis && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Diagnosis
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.diagnosis}
                            </p>
                          </div>
                        )}
                        {appointment.prescription && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Prescription
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.prescription}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
