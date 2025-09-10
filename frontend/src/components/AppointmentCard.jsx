import { Calendar, Clock } from "lucide-react";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AppointmentCard({ appointment }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg mr-4">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {appointment.doctorName}
          </h3>
          <p className="text-sm text-gray-500">{appointment.type}</p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock className="h-3 w-3 mr-1" />
            {appointment.date} at {appointment.time}
          </div>
        </div>
      </div>
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
