"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/AuthContext";
// import { doctorApi } from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";
import API from "@/utils/api";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Clock,
  User,
  Pill,
  Activity,
  AlertTriangle,
  Heart,
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

  // Mock data for now - will be replaced with real API calls
  const mockPatients = [
    {
      _id: "1",
      fullname: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      age: 45,
      gender: "Male",
      chronicConditions: ["Diabetes", "Hypertension"],
      allergies: ["Peanuts"],
      symptoms: ["Fatigue", "Headache"],
      lastVisit: "2024-01-10",
    },
    {
      _id: "2",
      fullname: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "098-765-4321",
      age: 32,
      gender: "Female",
      chronicConditions: ["Asthma"],
      allergies: ["Penicillin"],
      symptoms: ["Cough", "Shortness of breath"],
      lastVisit: "2024-01-08",
    },
  ];

  const mockAppointments = [
    {
      id: "1",
      patientName: "John Doe",
      patientId: "1",
      date: "2024-01-15",
      time: "10:00 AM",
      type: "Check-up",
      status: "Confirmed",
      notes: "Follow-up for diabetes management",
    },
    {
      id: "2",
      patientName: "Jane Smith",
      patientId: "2",
      date: "2024-01-16",
      time: "2:30 PM",
      type: "Consultation",
      status: "Pending",
      notes: "New patient consultation",
    },
  ];

  const getDoctorData = async () => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const response = await API.get("admin/doctors/");
      if (response.success && response.data) {
        setDoctorData(response.data);
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const getPatients = async () => {
    setLoading((prev) => ({ ...prev, patients: true }));
    try {
      // TODO: Replace with real API call
      setPatients(mockPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading((prev) => ({ ...prev, patients: false }));
    }
  };

  const handlePatientAdded = () => {
    getPatients(); // Refresh the patient list
  };

  const getAppointments = async () => {
    setLoading((prev) => ({ ...prev, appointments: true }));
    try {
      // TODO: Replace with real API call
      setAppointments(mockAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      getDoctorData();
      getPatients();
      getAppointments();
    }
  }, [user, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/doctor/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatAddress = (address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={doctorData || user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, Dr. {doctorData?.fullname || user.fullname}!
            </h1>
            <p className="text-gray-600">
              Here's your practice overview for today
            </p>
          </div>

          {/* Practice Overview Cards */}
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
              value={patients.filter((p) => p.symptoms.length > 0).length}
              color="purple"
            />
            <HealthCard
              icon={MessageSquare}
              title="Pending Messages"
              value="3"
              color="orange"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile and Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile
                  </h2>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {loading.profile ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">
                          Dr. {doctorData?.fullname || user.fullname}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {doctorData?.specialization || "General Medicine"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {doctorData?.phone || user.phone}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {doctorData?.address
                            ? formatAddress(doctorData.address)
                            : "Address not available"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h2>
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
                  <button className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <Calendar className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">
                      Schedule Appointment
                    </span>
                  </button>
                  <button className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <FileText className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">
                      View Medical Records
                    </span>
                  </button>
                  <button className="w-full flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <MessageSquare className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">
                      Patient Messages
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Patients and Appointments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Appointments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Today's Appointments
                  </h2>
                  <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule New
                  </button>
                </div>
                {loading.appointments ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-4">
                            <User className="h-5 w-5 text-blue-600" />
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
                            {appointment.notes && (
                              <p className="text-xs text-gray-400 mt-1">
                                {appointment.notes}
                              </p>
                            )}
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
                    ))}
                  </div>
                )}
              </div>

              {/* Patient List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Patients
                  </h2>
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Patient
                  </button>
                </div>
                {loading.patients ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <div
                        key={patient._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg mr-4">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {patient.fullname}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {patient.age} years old • {patient.gender}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {patient.phone}
                            </div>
                            {patient.lastVisit && (
                              <p className="text-xs text-gray-400 mt-1">
                                Last visit: {patient.lastVisit}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {patient.chronicConditions
                              .slice(0, 2)
                              .map((condition, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                >
                                  {condition}
                                </span>
                              ))}
                            {patient.chronicConditions.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                +{patient.chronicConditions.length - 2}
                              </span>
                            )}
                          </div>
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Add Patient Form Modal */}
        <AddPatientForm
          isOpen={showAddPatientForm}
          onClose={() => setShowAddPatientForm(false)}
          onSuccess={handlePatientAdded}
        />
      </div>
    </ProtectedRoute>
  );
}
