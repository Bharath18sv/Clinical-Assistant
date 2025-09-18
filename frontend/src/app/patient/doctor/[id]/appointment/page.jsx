"use client";

import { Calendar, User } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";
import API, { fetchDPAppointment } from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";

export default function AppointmentPage() {
  const { user, authLoading } = useContext(AuthContext);
  const { id } = useParams(); // doctorId from URL
  const [appointment, setAppointment] = useState(null);
  const [apptDate, setApptDate] = useState(null);
  const [apptTime, setApptTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // booking form state
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [reason, setReason] = useState("");

  const patientId = user?.data?.user?._id;

  // Fetch appointment
  useEffect(() => {
    if (!patientId || authLoading) return;

    const fetchData = async () => {
      try {
        const resAppt = await fetchDPAppointment(id);
        console.log("Appointment response: ", resAppt);
        if (resAppt) {
          const dateObj = new Date(resAppt.scheduledAt);
          const date = dateObj.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const time = dateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });
          setApptDate(date);
          setApptTime(time);
          setAppointment(resAppt);
        }
      } catch (err) {
        console.error("Error loading appointment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, patientId, authLoading]);

  // Book Appointment
  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const scheduledAt = new Date(`${formDate}T${formTime}`);
      const { data } = await API.post("/appointments", {
        doctorId: id,
        patientId,
        scheduledAt,
        reason,
      });
      setAppointment(data.data);
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  // Delete Appointment
  const handleDelete = async () => {
    try {
      await API.delete(`/appointments/${appointment._id}`);
      setAppointment(null);
      setShowConfirm(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            Loading your appointment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {!appointment ? (
          // Enhanced Booking form
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v6m6-6v6m-6-4h6"
                  />
                </svg>
                Schedule Your Appointment
              </h3>
              <p className="text-blue-100 mt-2">
                Choose your preferred date and time
              </p>
            </div>

            <form onSubmit={handleBook} className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v6m6-6v6m-6-4h6"
                      />
                    </svg>
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Appointment Time
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Reason for Visit
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors bg-gray-50 focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Book Appointment
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Enhanced Appointment Card with Doctor Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Appointment Confirmed
                    </h3>
                    <p className="text-emerald-100">
                      Your appointment has been successfully scheduled
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Doctor Info */}
                {appointment && (
                  <div className="flex items-center gap-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                    {/* Profile Image */}
                    {appointment?.doctorId?.profilePic ? (
                      <img
                        src={appointment.doctorId?.profilePic}
                        alt={appointment.doctorId.fullname}
                        className="w-20 h-20 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
                        <User className="w-15 h-15 rounded-full object-cover " />
                      </div>
                    )}

                    {/* Doctor Details */}
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xl font-semibold text-gray-900">
                        {appointment.doctorId.fullname}
                      </h4>
                      <p className="text-gray-600">
                        {Array.isArray(appointment?.doctorId?.specialization)
                          ? appointment.doctorId.specialization.length > 1
                            ? appointment.doctorId.specialization.join(", ")
                            : appointment.doctorId.specialization[0] ||
                              "General"
                          : appointment?.doctorId?.specialization || "General"}
                      </p>
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">Email:</span>{" "}
                        {appointment.doctorId.email}
                      </p>
                      <p className="text-gray-700 text-sm">
                        <span className="font-semibold">Phone:</span>{" "}
                        {appointment.doctorId.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Appointment Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v6m6-6v6m-6-4h6"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-800">Date</h4>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {apptDate}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-800">Time</h4>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {apptTime}
                    </p>
                  </div>
                </div>

                {/* Reason for Visit */}
                {appointment.reason && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-500 p-2 rounded-lg">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-800">
                        Reason for Visit
                      </h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {appointment.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Delete Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold px-8 py-3 rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Cancel Appointment
              </button>
            </div>

            {/* Enhanced Confirmation Dialog */}
            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                  <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-full">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-white">
                        Confirm Cancellation
                      </h4>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      Are you sure you want to cancel this appointment? This
                      action cannot be undone.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">
                        Appointment Details:
                      </p>
                      <p className="font-semibold text-gray-800">
                        {apptDate} at {apptTime}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Keep Appointment
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
                      >
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
