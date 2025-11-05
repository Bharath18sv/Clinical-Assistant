"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { getDoctorAppointments, viewMyPatients } from "@/utils/api";
import { getUnreadNotifications } from "@/utils/api/notification.api";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Phone,
  MapPin,
  Edit,
  Plus,
  Users,
  Stethoscope,
  TrendingUp,
  MessageSquare,
  Pill,
  Bell,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import HealthCard from "@/components/HealthCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppointmentCard from "@/components/AppointmentCard";

export default function DoctorDashboardPage() {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [refillRequests, setRefillRequests] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get doctor data directly from context
  const doctorData = user?.user;

  const fetchPatients = async () => {
    try {
      const patients = await viewMyPatients();
      console.log("Patients fetched:", patients);
      setPatients(patients || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  const getAppointments = async () => {
    try {
      const response = await getDoctorAppointments();
      console.log("Appointments fetched:", response);
      setAppointments(response || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await getUnreadNotifications();
      console.log("Unread notifications fetched:", response);
      if (response && response.data) {
        setUnreadNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      setUnreadNotifications([]);
    }
  };

  const loadRefillRequests = () => {
    try {
      const storedRequests = JSON.parse(
        localStorage.getItem("refillRequests") || "[]"
      );
      const doctorId = user?.user?._id;

      console.log("Loading refill requests for doctor:", doctorId);
      console.log("All stored requests:", storedRequests);

      const doctorRequests = storedRequests.filter(
        (request) => request.doctorId === doctorId
      );
      console.log("Doctor requests:", doctorRequests);

      // Find patients data
      const patientMap = {};
      if (patients && patients.length > 0) {
        patients.forEach((patient) => {
          // Handle different patient object structures
          const patientId = patient.patientId || patient._id;
          if (patientId) {
            patientMap[patientId] = patient.patientDetails || patient;
          }
        });
      }

      console.log("Patient map:", patientMap);

      const enhancedRequests = doctorRequests.map((request) => {
        const patient = patientMap[request.patientId];
        console.log("Processing request for patient ID:", request.patientId);
        console.log("Found patient:", patient);

        return {
          ...request,
          patientName: patient
            ? patient.fullname
            : `Patient ID: ${request.patientId}`,
          patientEmail: patient ? patient.email : "N/A",
        };
      });

      console.log("Enhanced requests:", enhancedRequests);
      setRefillRequests(enhancedRequests);
    } catch (error) {
      console.error("Error loading refill requests:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ADR_ALERT":
        return <AlertCircle className="h-5 w-5" />;
      case "APPOINTMENT":
        return <Calendar className="h-5 w-5" />;
      case "PRESCRIPTION":
        return <Pill className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "ADR_ALERT":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      case "APPOINTMENT":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      case "PRESCRIPTION":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  const getNotificationIconColor = (type) => {
    switch (type) {
      case "ADR_ALERT":
        return "bg-red-100 text-red-600";
      case "APPOINTMENT":
        return "bg-blue-100 text-blue-600";
      case "PRESCRIPTION":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Single useEffect to fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      if (authLoading) {
        console.log("Auth still loading...");
        return;
      }

      if (!user || !doctorData) {
        console.log("No user or doctor data available");
        setLoading(false);
        return;
      }

      console.log("Doctor logged in:", doctorData.fullname);
      setLoading(true);

      try {
        await Promise.all([
          fetchPatients(),
          getAppointments(),
          fetchUnreadNotifications(),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [authLoading, user]);

  // Load refill requests when patients are available
  useEffect(() => {
    if (patients.length > 0) {
      loadRefillRequests();
    }
  }, [patients]);

  const ongoingAppointments = appointments.filter(
    (appt) => appt.status?.toLowerCase() === "active"
  );

  const upcomingAppointments = appointments.filter((appt) =>
    ["pending", "approved"].includes(appt.status?.toLowerCase())
  );

  const completedAppointments = appointments.filter(
    (appt) => appt.status?.toLowerCase() === "completed"
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <main className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-2 py-2">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Dr. {doctorData?.fullname}!
          </h1>
          <p className="text-gray-600">
            Here's your practice overview for today
          </p>
        </div>

        {/* Unread Notifications Section - Only show if there are unread notifications */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-lg border border-orange-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Bell className="h-6 w-6 text-orange-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Unread Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      You have {unreadNotifications.length} unread notification
                      {unreadNotifications.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/doctor/notifications")}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {unreadNotifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification._id}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${getNotificationColor(
                      notification.type
                    )}`}
                    onClick={() => router.push("/doctor/notifications")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${getNotificationIconColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {notification.type === "ADR_ALERT" && (
                        <div className="flex-shrink-0">
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full animate-pulse">
                            URGENT
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {unreadNotifications.length > 3 && (
                  <button
                    onClick={() => router.push("/doctor/notifications")}
                    className="w-full text-center text-sm text-orange-700 hover:text-orange-800 font-medium py-2 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    View {unreadNotifications.length - 3} more notification
                    {unreadNotifications.length - 3 !== 1 ? "s" : ""}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <HealthCard
            icon={Users}
            title="Total Patients"
            value={patients.length}
            color="blue"
            subtitle="Registered"
          />
          <HealthCard
            icon={Calendar}
            title="Total Appointments"
            value={appointments.length}
            color="green"
            subtitle="All time"
          />
          <HealthCard
            icon={TrendingUp}
            title="Active Cases"
            value={ongoingAppointments.length}
            color="purple"
            subtitle="Ongoing"
          />
          <HealthCard
            icon={Bell}
            title="Notifications"
            value={unreadNotifications.length}
            color="orange"
            subtitle="Unread"
          />
        </div>

        {/* Refill Requests Section */}
        {refillRequests.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Pill className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Refill Requests
                    </h3>
                    <p className="text-sm text-gray-600">
                      Prescription refill requests from your patients
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => loadRefillRequests()}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Refresh
                  </button>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {refillRequests.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {refillRequests.slice(0, 5).map((request, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.patientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.patientEmail}
                            </p>
                          </div>
                        </div>
                        <div className="ml-11">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">
                              {request.medications?.length || 0}
                            </span>{" "}
                            medication(s) requested
                          </p>
                          {request.medications &&
                            request.medications.length > 0 && (
                              <p className="text-xs text-gray-500 mb-2">
                                Medications: {request.medications.join(", ")}
                              </p>
                            )}
                          {request.message && (
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-2 border-blue-200">
                              "{request.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.urgency === "urgent"
                              ? "bg-red-100 text-red-800"
                              : request.urgency === "normal"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {request.urgency}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {refillRequests.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{refillRequests.length - 5} more requests
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments and Patients Grid - Only show if data exists */}
        {((upcomingAppointments && upcomingAppointments.length > 0) ||
          (completedAppointments && completedAppointments.length > 0) ||
          (patients && patients.length > 0)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
            {/* Appointments Column - Only show if any appointments exist */}
            {((upcomingAppointments && upcomingAppointments.length > 0) ||
              (completedAppointments && completedAppointments.length > 0)) && (
              <div className="space-y-6">
                {/* Upcoming Appointments - Only show if data exists */}
                {upcomingAppointments && upcomingAppointments.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Upcoming Appointments
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {upcomingAppointments.slice(0, 3).map((appointment) => (
                        <AppointmentCard
                          key={appointment._id}
                          appointment={{
                            id: appointment._id,
                            userDetails: appointment?.patientId,
                            reason: appointment.reason || "Consultation",
                            time: appointment.scheduledAt,
                            status: appointment.status,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Appointments - Only show if data exists */}
                {completedAppointments && completedAppointments.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Completed Appointments
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {completedAppointments.slice(0, 3).map((appointment) => (
                        <AppointmentCard
                          key={appointment._id}
                          appointment={{
                            id: appointment._id,
                            userDetails: appointment?.patientId,
                            reason: appointment.reason || "Consultation",
                            time: appointment.scheduledAt,
                            status: appointment.status,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Patients Column - Only show if data exists */}
            {patients && patients.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Patients
                  </h2>
                  <button
                    onClick={() => router.push("/doctor/patient/add")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Patient
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {patients.slice(0, 5).map((patient) => (
                    <div
                      key={patient.patientId}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer border border-gray-200"
                      onClick={() =>
                        router.push(`/doctor/patient/${patient.patientId}`)
                      }
                    >
                      <div className="flex-shrink-0">
                        {patient.patientDetails?.profilePic ? (
                          <img
                            src={patient.patientDetails.profilePic}
                            alt={patient.patientDetails.fullname}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-200">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {patient.patientDetails?.fullname || "Unknown"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {patient.patientDetails?.age
                            ? `${patient.patientDetails.age} years`
                            : "Age N/A"}{" "}
                          • {patient.patientDetails?.gender || "Gender N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optional: Empty State - Show only when NO data exists at all */}
        {(!upcomingAppointments || upcomingAppointments.length === 0) &&
          (!completedAppointments || completedAppointments.length === 0) &&
          (!patients || patients.length === 0) && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center mb-8">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Welcome to Your Dashboard
                </h3>
                <p className="text-gray-600 mb-6">
                  You don't have any appointments or patients yet. Get started
                  by adding a patient or waiting for appointment bookings.
                </p>
                <button
                  onClick={() => router.push("/doctor/patient/add")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Patient
                </button>
              </div>
            </div>
          )}

        {/* Quick Actions at Bottom */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/doctor/patient/add")}
              className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all cursor-pointer border border-blue-200"
            >
              <div className="p-3 bg-blue-100 rounded-lg mr-3">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Add New Patient
              </span>
            </button>
            <button
              onClick={() => router.push("/doctor/patient/")}
              className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 hover:shadow-md transition-all cursor-pointer border border-green-200"
            >
              <div className="p-3 bg-green-100 rounded-lg mr-3">
                <Stethoscope className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                View Your Patients
              </span>
            </button>
            <button
              onClick={() => router.push("/doctor/appointment")}
              className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 hover:shadow-md transition-all cursor-pointer border border-purple-200"
            >
              <div className="p-3 bg-purple-100 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Manage Appointments
              </span>
            </button>
            <button
              onClick={() => router.push("/doctor/reports")}
              className="flex items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 hover:shadow-md transition-all cursor-pointer border border-orange-200"
            >
              <div className="p-3 bg-orange-100 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                View Reports
              </span>
            </button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
