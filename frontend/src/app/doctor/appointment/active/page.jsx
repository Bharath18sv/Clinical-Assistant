"use client";
import { useEffect, useState } from "react";
import {
  fetchDoctorActiveAppointments,
  startAppointment,
  completeAppointment,
} from "@/utils/api";
import {
  Clock,
  User,
  Calendar,
  CheckCircle,
  Activity,
  Phone,
  Video,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function DoctorActiveAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingIds, setCompletingIds] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDoctorActiveAppointments();
        setAppointments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCompleteAppointment = async (appointmentId) => {
    setCompletingIds((prev) => new Set([...prev, appointmentId]));
    try {
      const updated = await completeAppointment(appointmentId);
      setAppointments((prev) => prev.filter((x) => x._id !== updated._id));
    } catch (error) {
      console.error("Failed to complete appointment:", error);
      // You might want to show an error toast here
    } finally {
      setCompletingIds((prev) => {
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

  const getAppointmentDuration = (scheduledAt) => {
    const start = new Date(scheduledAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - start) / (1000 * 60));

    if (diffMinutes < 1) return "Just started";
    if (diffMinutes < 60) return `${diffMinutes} min`;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading active appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Activity className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Active Appointments
          </h1>
        </div>
        <p className="text-gray-600">
          Manage your ongoing consultations and appointments
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Sessions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Duration
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.reduce((total, apt) => {
                  const duration = new Date() - new Date(apt.scheduledAt);
                  return total + Math.floor(duration / (1000 * 60));
                }, 0)}{" "}
                min
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Awaiting Action
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No Active Appointments
            </h3>
            <p className="text-gray-600 max-w-md">
              You don't have any active appointments at the moment. New
              appointments will appear here when patients join.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.scheduledAt);
            const duration = getAppointmentDuration(appointment.scheduledAt);
            const isCompleting = completingIds.has(appointment._id);

            return (
              <Link
                key={appointment._id}
                href={`/doctor/appointment/${appointment._id}`}
                className="block"
              >
                <div
                  key={appointment._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* Patient Info */}
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientId?.fullname ||
                              "Unknown Patient"}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-1 sm:space-y-0">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {date}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              {time}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                              Active for {duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
                        {/* <button className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </button> */}
                        <button className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </button>
                        <button
                          onClick={() =>
                            handleCompleteAppointment(appointment._id)
                          }
                          disabled={isCompleting}
                          className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                        >
                          {isCompleting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Ending...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              End Session
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {appointment.reason && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span>{" "}
                          {appointment.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
