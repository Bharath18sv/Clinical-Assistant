"use client";

import { Calendar, User, CheckCircle } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import API, { fetchDPAppointment } from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";

export default function AppointmentPage() {
  const { user, authLoading } = useContext(AuthContext);
  const { id } = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState(null);
  const [apptDate, setApptDate] = useState(null);
  const [apptTime, setApptTime] = useState(null);
  const [loading, setLoading] = useState(true);


  // booking form state
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [reason, setReason] = useState("");

  const patientId = user?.data?.user?._id;

  // Check for existing appointment
  useEffect(() => {
    if (authLoading) return;
    
    // Always show booking form
    setLoading(false);
    setAppointment(null);
  }, [authLoading]);

  // Book Appointment
  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scheduledAt = new Date(`${formDate}T${formTime}`);
      const { data } = await API.post("/appointments", {
        doctorId: id,
        patientId,
        scheduledAt,
        reason,
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
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
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
      <div className="max-w-2xl mx-auto">
        {!appointment ? (
          // Booking form
          <div className="bg-white rounded-xl shadow-lg border">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                Book Appointment
              </h3>
              <p className="text-blue-100 text-sm">
                Choose your preferred date and time
              </p>
            </div>

            <form onSubmit={handleBook} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formDate ? 'text-gray-900' : 'text-gray-400'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formTime ? 'text-gray-900' : 'text-gray-400'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for visit..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Appointment
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Appointment Confirmation */}
            <div className="bg-white rounded-xl shadow-lg border mb-6">
              
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
                        {appointment.doctorId.fullname || "Unknown"}
                      </h4>
                      <p className="text-sm text-blue-600 font-medium">
                        {appointment.doctorId.specialization?.[0] || "General Practice"}
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
                      <Calendar className="w-4 h-4 text-purple-600" />
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
                    <h4 className="font-semibold text-gray-800 mb-2">Reason for Visit</h4>
                    <p className="text-gray-700 leading-relaxed">{appointment.reason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => router.push('/patient/doctor/all')}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => router.push('/patient/doctor/all')}
                    className="flex-1 bg-red-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            </div>


          </>
        )}
      </div>
    </div>
  );
}
