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
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition p-5">
      {/* Main Content */}
      <div className="flex items-start justify-between">
        {/* Left side - user info */}
        <div className="flex items-start">
          {/* Profile image */}
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user?.fullname || "User"}
              className="h-16 w-16 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-200">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          )}

          {/* User details */}
          <div className="ml-4 space-y-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {user?.fullname || "Unknown User"}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user?.email || "N/A"}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {user?.phone || "N/A"}
            </p>

            {/* Appointment time */}
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              <span className="font-medium">{date}</span>
              <span className="mx-2">•</span>
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* Right side - status badge */}
        <div>{getStatusBadge(appointment.status)}</div>
      </div>

      {/* Reason (if exists) */}
      {appointment.reason && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Reason</p>
          <p className="text-sm text-gray-700">{appointment.reason}</p>
        </div>
      )}

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
  );
}
