import { Calendar, Clock } from "lucide-react";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "upcoming":
      return "status-badge status-active";
    case "confirmed":
      return "status-badge status-confirmed";
    case "completed":
      return "status-badge status-inactive";
    case "cancelled":
      return "status-badge status-cancelled";
    default:
      return "status-badge status-inactive";
  }
};

export default function AppointmentCard({ appointment }) {
  const dateObject = new Date(appointment.scheduledAt);
  const date = dateObject.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = dateObject.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="icon-container icon-blue">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="ml-4">
          <h3 className="font-medium text-gray-900">
            {appointment.doctorId.fullname}
          </h3>
          <p className="text-sm text-gray-500">
            Phone : {appointment.doctorId.phone}
          </p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock className="h-3 w-3 mr-1" />
            {date} at {time}
          </div>
        </div>
      </div>
      <span className={getStatusColor(appointment.status)}>
        {appointment.status}
      </span>
    </div>
  );
}
