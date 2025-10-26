import {
  Calendar,
  Clock,
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function AppointmentCard({ appointment, onCancel }) {
  const user = appointment.userDetails || {};

  const formatDate = (scheduledAt) => {
    const dateObj = new Date(scheduledAt);
    const date = dateObj.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { date, time };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: Check,
        label: "Approved",
      },
      cancelled: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: X,
        label: "Cancelled",
      },
      active: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
        label: "Active",
      },
      completed: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Check,
        label: "Completed",
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}
      >
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  const { date, time } = formatDate(appointment.time);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user?.fullname || "User"}
                className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-200">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with name and status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base truncate">
                  {user?.fullname || "Unknown User"}
                </h3>
                {user?.specialization && user.specialization.length > 0 && (
                  <p className="text-sm text-blue-600 font-medium mt-0.5">
                    {user.specialization.join(", ")}
                  </p>
                )}
              </div>
              {getStatusBadge(appointment.status)}
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 mb-3">
              {user?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-semibold text-gray-900">{date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-sm font-semibold text-gray-900">{time}</p>
                </div>
              </div>
            </div>

            {/* Reason (if exists) */}
            {appointment.reason && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-sm text-gray-700">{appointment.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {appointment.status?.toLowerCase() === "pending" && onCancel && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm(
                    "Are you sure you want to cancel this appointment?"
                  )
                ) {
                  onCancel(appointment.id);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
            >
              <X className="w-4 h-4" />
              Cancel Appointment
            </button>
          </div>
        )}

        {appointment.status?.toLowerCase() === "approved" && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm border border-blue-200">
              <Calendar className="w-4 h-4" />
              View Details
            </button>
            {onCancel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      "Are you sure you want to cancel this appointment?"
                    )
                  ) {
                    onCancel(appointment.id);
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
