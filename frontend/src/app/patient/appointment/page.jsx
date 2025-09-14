"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, Plus } from "lucide-react";
import AppointmentCard from "@/components/AppointmentCard";
import { fetchMyAppointments, completeAppointment } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchMyAppointments();
        console.log("my appts :", res);
        if (!mounted) return;
        setAppointments(res);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleEndAppointment = async (appointmentId) => {
    try {
      const appt = await completeAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appt._id ? appt : a))
      );
      if (selected?._id === appt._id) setSelected(appt);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered appointments based on status
  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") return appointments;
    return appointments.filter((appt) => appt.status === statusFilter);
  }, [appointments, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header with filter + button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">
            View and manage your appointments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Create Appointment Button */}
          <button
            onClick={() => router.push("/patient/doctor/all")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Create Appointment</span>
          </button>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              All Appointments
            </h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : filteredAppointments.length === 0 ? (
                <p className="text-gray-500">No appointments found.</p>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    onClick={() => setSelected(appointment)}
                    className="cursor-pointer hover:bg-gray-50 rounded-lg"
                  >
                    <AppointmentCard appointment={appointment} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Appointment Details
            </h2>
            {!selected ? (
              <p className="text-gray-500 text-center py-8">
                Select an appointment to view details
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {new Date(selected.scheduledAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    Doctor Specialization:{" "}
                    {selected.doctorId.specialization.join(", ")}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Reason</h3>
                  <p className="text-sm text-gray-600">
                    {selected.reason || "-"}
                  </p>
                </div>

                {selected.status === "active" && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEndAppointment(selected._id)}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      End Appointment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
