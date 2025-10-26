"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  fetchAppointmentById,
  startAppointment,
  completeAppointment,
} from "@/utils/api";
import {
  Clock,
  User,
  Calendar,
  FileText,
  Play,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Activity,
  ArrowLeft,
} from "lucide-react";

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchAppointmentById(id);
        setAppointment(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: Activity,
          iconColor: "text-green-600",
        };
      case "approved":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: CheckCircle,
          iconColor: "text-blue-600",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
          iconColor: "text-yellow-600",
        };
      case "completed":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: CheckCircle,
          iconColor: "text-gray-600",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
          iconColor: "text-gray-600",
        };
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = isToday
      ? "Today"
      : date.toLocaleDateString("en-US", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

    return { date: formattedDate, time: formattedTime };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-lg">
            Loading appointment details...
          </p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-md mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Appointment Not Found
            </h2>
            <p className="text-gray-600">
              The appointment you're looking for doesn't exist or has been
              removed.
            </p>
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canStart =
    appointment.status === "approved" || appointment.status === "pending";
  const canComplete = appointment.status === "active";
  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;
  const { date, time } = formatDateTime(appointment.scheduledAt);

  // Helper function for patient profile image
  const getPatientProfileImage = (patient) => {
    if (!patient) return "/default-avatar.png";
    if (patient.profilePic) return patient.profilePic;
    if (patient.gender === "female") return "/default-female.png";
    if (patient.gender === "male") return "/default-male.png";
    return "/default-avatar.png";
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-2 py-2">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Appointments
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Appointment Details
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Comprehensive view of patient consultation
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full border ${statusConfig.color}`}
                >
                  <StatusIcon
                    className={`h-4 w-4 mr-2 ${statusConfig.iconColor}`}
                  />
                  <span className="font-medium capitalize">
                    {appointment.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Patient Information
                </h3>
              </div>

              {/* Patient Header */}
              <div className="flex items-start space-x-6 mb-6 pb-6 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <img
                    src={
                      appointment.patientId?.profilePic
                        ? appointment.patientId.profilePic
                        : appointment.patientId?.gender === "female"
                          ? "/default-female.png"
                          : "/default-male.png"
                    }
                    alt={appointment.patientId?.fullname || "Patient"}
                    className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />

                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                    {appointment.patientId?.fullname || "Unknown Patient"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        Age:
                      </span>
                      <span className="text-sm text-gray-900">
                        {appointment.patientId?.age || "N/A"} years
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        Gender:
                      </span>
                      <span className="text-sm text-gray-900">
                        {appointment.patientId?.gender || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {appointment.patientId?.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {appointment.patientId?.phone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-6">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Appointment Details
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <p className="text-gray-900 text-base">
                    {appointment.reason || "No specific reason provided"}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment ID
                  </label>
                  <p className="text-gray-600 text-sm font-mono break-all">
                    {appointment._id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}
