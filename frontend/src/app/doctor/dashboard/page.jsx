"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import API from "@/utils/api";
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
import AddPatientForm from "@/components/AddPatientForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DoctorDashboardPage() {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();

  const [doctorData, setDoctorData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState({
    profile: false,
    patients: false,
    appointments: false,
  });
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);

  // Safely get the doctor info from context
  const doctor = user?.user || null;

  useEffect(() => {
    if (doctor) {
      setDoctorData(doctor);
      setPatients(doctor.patients || []);
      getAppointments(doctor._id);
    }
  }, [doctor]);

  const getAppointments = async (doctorId) => {
    setLoading((prev) => ({ ...prev, appointments: true }));
    try {
      // Replace this with real API call
      const response = await API.get(`/appointments/${doctorId}`);
      setAppointments(response.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  };

  const handlePatientAdded = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setShowAddPatientForm(false);
  };

  const formatAddress = (address) =>
    address
      ? `${address.street}, ${address.city}, ${address.state} ${address.zip}`
      : "Address not available";

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-inactive";
    }
  };

  if (authLoading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={doctor} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Dr. {doctorData?.fullname}!
            </h1>
            <p className="text-gray-600">
              Here's your practice overview for today
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <HealthCard
              icon={Users}
              title="Total Patients"
              value={patients.length}
              color="blue"
            />
            <HealthCard
              icon={Calendar}
              title="Today's Appointments"
              value={
                appointments.filter((a) => a.status === "Confirmed").length
              }
              color="green"
            />
            <HealthCard
              icon={TrendingUp}
              title="Active Cases"
              value={patients.filter((p) => p.symptoms?.length > 0).length}
              color="purple"
            />
            <HealthCard
              icon={MessageSquare}
              title="Pending Messages"
              value="3"
              color="orange"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title">Profile</h2>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 icon-container icon-blue rounded-full flex items-center justify-center">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">
                      {doctorData?.fullname}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {doctorData?.specialization?.join(", ") ||
                        "General Medicine"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{doctorData?.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {formatAddress(doctorData?.address)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Quick Actions</h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">
                      Add New Patient
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Patients & Appointments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appointments */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title">Today's Appointments</h2>
                </div>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="icon-container icon-blue mr-4">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {appointment.patientName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {appointment.type}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {appointment.date} at {appointment.time}
                          </div>
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patients */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title">Recent Patients</h2>
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Patient
                  </button>
                </div>
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div
                      key={patient._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="icon-container icon-green mr-4">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {patient.fullname}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {patient.age} years old • {patient.gender}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <AddPatientForm
          isOpen={showAddPatientForm}
          onClose={() => setShowAddPatientForm(false)}
          onSuccess={handlePatientAdded}
        />
      </div>
    </ProtectedRoute>
  );
}
