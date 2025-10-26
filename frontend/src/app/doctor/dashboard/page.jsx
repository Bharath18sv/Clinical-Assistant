"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { getDoctorAppointments, viewMyPatients } from "@/utils/api";
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
        await Promise.all([fetchPatients(), getAppointments()]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [authLoading, user]); // Only depend on authLoading and user

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
      {/* <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"> */}
      {/* <Navbar user={doctorData} /> */}

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
            icon={MessageSquare}
            title="Pending Messages"
            value="3"
            color="orange"
            subtitle="Unread"
          />
        </div>

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
      {/* </div> */}
    </ProtectedRoute>
  );
}
