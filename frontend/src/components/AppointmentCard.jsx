import { Calendar, Clock } from "lucide-react";

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

export default function AppointmentCard({ appointment }) {
  console.log("appointments in card : ", appointment);
  const user = appointment.userDetails;

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

  return (
    <div className="flex items-center justify-between p-5 bg-white shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition">
      {/* Left side - user info */}
      <div className="flex items-center">
        {/* Profile image */}
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt={user.fullname}
          className="h-16 w-16 rounded-full object-cover border border-gray-200"
        />

        {/* User details */}
        <div className="ml-4 space-y-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {user.fullname}
          </h3>
          <p className="text-sm text-gray-500">📧 {user.email}</p>
          <p className="text-sm text-gray-500">📞 {user.phone}</p>

          {/* Appointment time */}
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <Clock className="h-4 w-4 mr-1 text-blue-500" />
            {formatDate(appointment.time)}
          </div>
        </div>
      </div>

      {/* Right side - status badge */}
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
          appointment.status
        )}`}
      >
        {appointment.status}
      </span>
    </div>
  );
}
