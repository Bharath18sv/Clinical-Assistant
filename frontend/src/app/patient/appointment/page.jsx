"use client";

import { useContext, useState, useEffect } from "react";
import { Calendar, Clock, User, Plus } from "lucide-react";
import { fetchMyAppointments } from "@/utils/api";
import API from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function PatientAppointments() {
  const { user, authLoading } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAppointments = async () => {
    try {
      const appts = await fetchMyAppointments();
      setAppointments(appts || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await API.delete(`/appointments/${appointmentId}`);
      await loadAppointments();
      alert("Appointment cancelled successfully");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment");
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadAppointments();
    }
  }, [authLoading, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">
            View and manage your scheduled appointments
          </p>
        </div>
        <button
          onClick={() => router.push('/patient/doctor/all')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Book New Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Appointments
          </h3>
          <p className="text-gray-600">
            You don't have any appointments scheduled yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-3">
                    {appointment.doctorId?.profilePic ? (
                      <img
                        src={appointment.doctorId.profilePic}
                        alt={appointment.doctorId.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.doctorId?.fullname || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.doctorId?.specialization?.[0] || "General Practice"}
                      </p>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="ml-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(appointment.scheduledAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {appointment.reason && (
                      <p className="text-sm text-gray-500 mt-1">
                        Reason: {appointment.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </span>

                  {appointment.status === "pending" && (
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {appointment.status === "completed" && (
                    <button
                      onClick={() => router.push(`/patient/doctor/${appointment.doctorId?._id}/appointment`)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Book Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}