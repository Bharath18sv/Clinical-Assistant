"use client";

import { Calendar, User, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function AppointmentPage() {
  const { user, authLoading } = useContext(AuthContext);
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState(null);
  const [apptDate, setApptDate] = useState(null);
  const [apptTime, setApptTime] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [formDate, setFormDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [reason, setReason] = useState("");

  const patientId = user?.data?.user?._id;

  // Generate time slots (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        slots.push({
          value: timeString,
          display: displayTime,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get max date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split("T")[0];
  };

  // Check for existing appointment
  useEffect(() => {
    if (authLoading) return;
    setLoading(false);
    setAppointment(null);
  }, [authLoading]);

  // Book Appointment
  const handleBook = async (e) => {
    e.preventDefault();

    if (!formDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTimeSlot) {
      toast.error("Please select a time slot");
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = new Date(`${formDate}T${selectedTimeSlot}`);

      const { data } = await API.post("/appointments", {
        doctorId: id,
        patientId,
        scheduledAt,
        reason: reason.trim() || "General consultation",
      });

      const newAppointment = data.data;
      setAppointment(newAppointment);

      if (newAppointment?.scheduledAt) {
        const dateObj = new Date(newAppointment.scheduledAt);
        setApptDate(
          dateObj.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
        setApptTime(
          dateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }

      toast.success("Appointment booked successfully!");
    } catch (err) {
      console.error("Booking failed:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "Failed to book appointment. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {!appointment ? (
          // Booking form
          <div className="bg-white rounded-xl shadow-lg border">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Book Appointment</h3>
              <p className="text-blue-100 text-sm">
                Choose your preferred date and time slot
              </p>
            </div>

            <form onSubmit={handleBook} className="p-6 space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      setSelectedTimeSlot(""); // Reset time slot when date changes
                    }}
                    min={getTodayDate()}
                    max={getMaxDate()}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available dates: Today to{" "}
                  {new Date(getMaxDate()).toLocaleDateString()}
                </p>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Slot *{" "}
                  <span className="text-xs text-gray-500">
                    (30-minute intervals)
                  </span>
                </label>

                {!formDate ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Please select a date first
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.value)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTimeSlot === slot.value
                            ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                )}

                {selectedTimeSlot && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Selected:{" "}
                      <span className="font-semibold">
                        {
                          timeSlots.find((s) => s.value === selectedTimeSlot)
                            ?.display
                        }
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for visit..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reason.length}/500 characters
                </p>
              </div>

              {/* Summary Box */}
              {formDate && selectedTimeSlot && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    Appointment Summary
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(formDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {
                        timeSlots.find((s) => s.value === selectedTimeSlot)
                          ?.display
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formDate || !selectedTimeSlot}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // Appointment Confirmation
          <div className="bg-white rounded-xl shadow-lg border">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-6 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Appointment Confirmed!
                  </h3>
                  <p className="text-green-100 text-sm">
                    Your appointment has been successfully scheduled
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor Info */}
              {appointment?.doctorId && (
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  {appointment.doctorId.profilePic ? (
                    <img
                      src={appointment.doctorId.profilePic}
                      alt={appointment.doctorId.fullname}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      Dr. {appointment.doctorId.fullname || "Unknown"}
                    </h4>
                    <p className="text-sm text-blue-600 font-medium">
                      {appointment.doctorId.specialization?.[0] ||
                        "General Practice"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.doctorId.email || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* Appointment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Date</h4>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {apptDate || "Not set"}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-purple-800">Time</h4>
                  </div>
                  <p className="text-lg font-bold text-purple-900">
                    {apptTime || "Not set"}
                  </p>
                </div>
              </div>

              {/* Reason */}
              {appointment?.reason && (
                <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Reason for Visit
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {appointment.reason}
                  </p>
                </div>
              )}

              {/* Important Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Important:</span> Please
                  arrive 10 minutes before your scheduled time. You will receive
                  a confirmation email shortly.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => router.push("/patient/appointments")}
                  className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  View All Appointments
                </button>
                <button
                  onClick={() => router.push("/patient/dashboard")}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
