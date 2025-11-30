"use client";
import { useEffect, useState } from "react";
import { fetchMyAppointments, updateAppointment } from "@/utils/api";
import { Check, X, FileText, Clock } from "lucide-react";
import Link from "next/link";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [showNotesModal, setShowNotesModal] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyAppointments();
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
    setPendingAction({ appointmentId, action });
    setShowNotesModal(appointmentId);
    setDoctorNotes("");
  };

  const handleActionConfirm = async () => {
    if (!pendingAction || !doctorNotes.trim()) return;

    const { appointmentId, action } = pendingAction;
    setActionLoading((prev) => ({ ...prev, [appointmentId]: true }));

    try {
      let payload = { doctorNotes: doctorNotes.trim() };
      if (action === "approve") payload.status = "approved";
      else if (action === "cancel") payload.status = "cancelled";
      else if (action === "start") payload.status = "in-progress";
      else if (action === "end") payload.status = "completed";

      await updateAppointment(appointmentId, payload);

      let updatedStatus =
        payload.status === "in-progress" ? "active" : payload.status;

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

      setShowNotesModal(null);
      setDoctorNotes("");
      setPendingAction(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
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

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = searchTerm
      ? (apt.patientId?.fullname || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (apt.reason || "").toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus =
      filterStatus === "all" ? true : apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              All Appointments
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track all appointments. {appointments.length} total
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patient or reason..."
              className="w-64 pl-3 pr-10 py-2 border border-gray-200 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
            <div className="col-span-4">Patient</div>
            <div className="col-span-3">Date & Time</div>
            <div className="col-span-3">Reason</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading appointments...
              </span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No appointments
              </h3>
              <p className="text-gray-600">
                No appointments match your filters.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAppointments.map((appointment) => (
                <Link
                  key={appointment._id}
                  href={`/doctor/appointment/${appointment._id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Patient */}
                  <div className="md:col-span-4 flex items-center gap-3">
                    <img
                      src={
                        appointment.patientId?.profilePic
                          ? appointment.patientId.profilePic
                          : appointment.patientId?.gender === "female"
                          ? "/default-female.png"
                          : "/default-male.png"
                      }
                      alt={appointment.patientId?.fullname || "Patient"}
                      className="h-10 w-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {appointment.patientId?.fullname || "Unknown Patient"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.patientId?.email || ""}
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="md:col-span-3 text-sm text-gray-700">
                    {appointment.scheduledAt
                      ? new Date(appointment.scheduledAt).toLocaleString()
                      : "-"}
                  </div>

                  {/* Reason */}
                  <div className="md:col-span-3 text-sm text-gray-700">
                    {appointment.reason || "Consultation"}
                  </div>

                  {/* Status */}
                  <div className="md:col-span-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : appointment.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : appointment.status === "active"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "completed"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appointment.status || "-"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    className="md:col-span-1 text-right flex items-center justify-end gap-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    {appointment.status === "pending" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleActionClick(appointment._id, "approve");
                          }}
                          disabled={actionLoading[appointment._id]}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleActionClick(appointment._id, "cancel");
                          }}
                          disabled={actionLoading[appointment._id]}
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {appointment.status === "approved" && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleActionClick(appointment._id, "start");
                        }}
                        disabled={actionLoading[appointment._id]}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        Start
                      </button>
                    )}
                    {appointment.status === "active" && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleActionClick(appointment._id, "end");
                        }}
                        disabled={actionLoading[appointment._id]}
                        className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
                      >
                        End
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Tip: Use the search and filters to find appointments quickly.
        </div>
      </div>

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
                    getModalTitle(pendingAction.action)
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
