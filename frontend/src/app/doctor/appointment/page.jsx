"use client";
import { useEffect, useState } from "react";
import { fetchMyAppointments } from "@/utils/api";
import AppointmentCard from "@/components/AppointmentCard";
import { Check, X, FileText, AlertCircle, Clock } from "lucide-react";
import { updateAppointment } from "@/utils/api";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [showNotesModal, setShowNotesModal] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyAppointments();
        console.log("data from fetch appointments : ", data);
        setAppointments(data.filter((a) => !!a.patientId));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleActionClick = (appointmentId, action) => {
    setPendingAction({ appointmentId, action });
    setShowNotesModal(appointmentId);
    setDoctorNotes("");
  };

  const handleActionConfirm = async () => {
    if (!pendingAction || !doctorNotes.trim()) return;

    const { appointmentId, action } = pendingAction;

    setActionLoading((prev) => ({ ...prev, [appointmentId]: true }));

    try {
      const res = await updateAppointment(appointmentId, {
        status: action === "approve" ? "approved" : "cancelled",
        doctorNotes: doctorNotes.trim(),
      });
      console.log(
        `${action} appointment ${appointmentId} with notes:`,
        doctorNotes
      );

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId
            ? {
                ...apt,
                status: action === "approve" ? "approved" : "cancelled",
                doctorNotes: doctorNotes,
              }
            : apt
        )
      );

      // Close modal and reset state
      setShowNotesModal(null);
      setPendingAction(null);
      setDoctorNotes("");
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Check,
      },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: X },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent size={12} />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
        <div className="text-sm text-gray-600">
          Total: {appointments.length} appointments
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading appointments...</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No appointments found
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
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 p-6">
                {/* Appointment Card */}
                <div className="flex-1">
                  <AppointmentCard
                    appointment={{
                      id: appointment._id,
                      userDetails: appointment?.patientId,
                      reason: appointment.reason || "Consultation",
                      time: appointment.scheduledAt,
                      status: appointment.status,
                    }}
                  />
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-center gap-3">
                  {/* {getStatusBadge(appointment.status)} */}

                  {/* Action Buttons - Only show for pending appointments */}
                  {appointment.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleActionClick(appointment._id, "approve")
                        }
                        disabled={actionLoading[appointment._id]}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleActionClick(appointment._id, "cancel")
                        }
                        disabled={actionLoading[appointment._id]}
                        className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Show doctor notes if appointment is processed */}
                  {(appointment.status === "approved" ||
                    appointment.status === "cancelled") &&
                    appointment.doctorNotes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg max-w-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <FileText size={14} className="text-gray-600" />
                          <span className="text-xs font-medium text-gray-700">
                            Doctor's Notes:
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {appointment.doctorNotes}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {pendingAction?.action === "approve" ? (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {pendingAction?.action === "approve"
                    ? "Approve Appointment"
                    : "Cancel Appointment"}
                </h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor's Notes *
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder={
                    pendingAction?.action === "approve"
                      ? "Add any instructions or notes for the patient..."
                      : "Provide a reason for cancellation..."
                  }
                  className="w-full px-3 py-3  outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This note will be visible to the patient.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNotesModal(null);
                    setPendingAction(null);
                    setDoctorNotes("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionConfirm}
                  disabled={
                    !doctorNotes.trim() || actionLoading[showNotesModal]
                  }
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    pendingAction?.action === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionLoading[showNotesModal] ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    `${
                      pendingAction?.action === "approve" ? "Approve" : "Cancel"
                    } Appointment`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
