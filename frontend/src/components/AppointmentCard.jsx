import { Calendar, Clock, Check, X, User } from "lucide-react";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "upcoming":
      return "bg-blue-100 text-blue-700";
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "completed":
      return "bg-gray-100 text-gray-600";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};


export default function AppointmentCard({ appointment, onCancel }) {
  console.log("appointments in card : ", appointment);
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
    return `${date} at ${time}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Check,
        label: "Approved",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: X,
        label: "Cancelled",
      },
      active: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
        label: "Active",
      },
      completed: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Check,
        label: "Completed",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex items-center justify-between p-5 bg-white shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition">
      {/* Left side - user info */}
      <div className="flex items-center">
        {/* Profile image */}
        {user?.profilePic ? (
          <img
            src={user.profilePic || "/default-avatar.png"}
            alt={user?.fullname || "User"}
            className="h-16 w-16 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <img
            src="/default-doctor.png"
            alt="Default Doctor"
            className="h-16 w-16 rounded-full object-cover border border-gray-200"
          />
        )}

        {/* User details */}
        <div className="ml-4 space-y-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {user?.fullname || "Unknown User"}
          </h3>
          <p className="text-sm text-gray-500">📧 {user?.email || "N/A"}</p>
          <p className="text-sm text-gray-500">📞 {user?.phone || "N/A"}</p>

          {/* Appointment time */}
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <Clock className="h-4 w-4 mr-1 text-blue-500" />
            {formatDate(appointment.time)}
          </div>
        </div>
      </div>

      {/* Right side - status and actions */}
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
            appointment.status
          )}`}
        >
          {getStatusBadge(appointment.status)}
        </span>
        
        {/* Cancel button for pending appointments */}
        {appointment.status === 'pending' && onCancel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to cancel this appointment?')) {
                onCancel(appointment.id);
              }
            }}
            className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full hover:bg-red-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
