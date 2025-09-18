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

        // Map backend 'notes' field to frontend 'doctorNotes' field
        const appointmentsWithMappedNotes = data
          .filter((a) => !!a.patientId)
          .map((appointment) => ({
            ...appointment,
            doctorNotes: appointment.notes || appointment.doctorNotes || "",
          }));

        setAppointments(appointmentsWithMappedNotes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleActionClick = (appointmentId, action) => {
    console.log("handleActionClick called with:", { appointmentId, action });

    // Show notes modal for all actions now
    const actionData = { appointmentId, action };
    console.log("Setting pendingAction to:", actionData);

    setPendingAction(actionData);
    setShowNotesModal(appointmentId);
    setDoctorNotes("");
  };

  const handleActionConfirm = async () => {
    console.log("pendingAction:", pendingAction);

    if (!pendingAction) {
      console.log("No pending action available");
      return;
    }

    const { appointmentId, action } = pendingAction;
    console.log("appointmentId:", appointmentId);
    console.log("action:", action);

    // Require notes for all actions
    if (!doctorNotes.trim()) {
      console.log("No doctor notes provided");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [appointmentId]: true }));

    try {
      let payload = { doctorNotes: doctorNotes.trim() };

      if (action === "approve") {
        payload.status = "approved";
      } else if (action === "cancel") {
        payload.status = "cancelled";
      } else if (action === "start") {
        payload.status = "in-progress"; // This will map to 'active' in backend
      } else if (action === "end") {
        payload.status = "completed";
      }

      console.log("Final payload:", payload);
      const res = await updateAppointment(appointmentId, payload);

      // Update local state with the correct status mapping
      let updatedStatus = payload.status;
      if (payload.status === "in-progress") {
        updatedStatus = "active"; // Match backend status
      }

      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === appointmentId
            ? {
                ...apt,
                status: updatedStatus,
                doctorNotes: payload.doctorNotes,
              }
            : apt
        )
      );

      // Reset modal state
      setShowNotesModal(null);
      setDoctorNotes("");
      setPendingAction(null);
    } catch (error) {
      console.error(`Error updating appointment:`, error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  const getModalTitle = (action) => {
    switch (action) {
      case "approve":
        return "Approve Appointment";
      case "cancel":
        return "Cancel Appointment";
      case "start":
        return "Start Appointment";
      case "end":
        return "End Appointment";
      default:
        return "Update Appointment";
    }
  };

  const getModalIcon = (action) => {
    switch (action) {
      case "approve":
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-5 w-5 text-green-600" />
          </div>
        );
      case "cancel":
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <X className="h-5 w-5 text-red-600" />
          </div>
        );
      case "start":
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
        );
      case "end":
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Check className="h-5 w-5 text-purple-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };

  const getModalPlaceholder = (action) => {
    switch (action) {
      case "approve":
        return "Add any instructions or notes for the patient...";
      case "cancel":
        return "Provide a reason for cancellation...";
      case "start":
        return "Add notes before starting the appointment...";
      case "end":
        return "Add completion notes and any follow-up instructions...";
      default:
        return "Add your notes here...";
    }
  };

  const getButtonColor = (action) => {
    switch (action) {
      case "approve":
        return "bg-green-600 hover:bg-green-700";
      case "cancel":
        return "bg-red-600 hover:bg-red-700";
      case "start":
        return "bg-blue-600 hover:bg-blue-700";
      case "end":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
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

                {/* Status and Actions */}
                <div className="flex flex-col items-center gap-3">
                  {/* status badge will be displayed in the appointment card */}

                  {/* Action Buttons based on status */}
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

                  {appointment.status === "approved" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleActionClick(appointment._id, "start")
                        }
                        disabled={actionLoading[appointment._id]}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Clock size={14} />
                        Start
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

                  {appointment.status === "active" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleActionClick(appointment._id, "end")
                        }
                        disabled={actionLoading[appointment._id]}
                        className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check size={14} />
                        End
                      </button>
                    </div>
                  )}

                  {/* Show doctor notes if appointment has notes */}
                  {appointment.doctorNotes && (
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
      {showNotesModal && pendingAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {getModalIcon(pendingAction.action)}
                <h3 className="text-lg font-semibold text-gray-900">
                  {getModalTitle(pendingAction.action)}
                </h3>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor's Notes *
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder={getModalPlaceholder(pendingAction.action)}
                  className="w-full px-3 py-3 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor(
                    pendingAction.action
                  )}`}
                >
                  {actionLoading[showNotesModal] ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    `${getModalTitle(pendingAction.action)}`
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
