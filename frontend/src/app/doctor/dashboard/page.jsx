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
  Pill,
} from "lucide-react";
import HealthCard from "@/components/HealthCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppointmentCard from "@/components/AppointmentCard";

export default function DoctorDashboardPage() {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();

  const [doctorData, setDoctorData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [refillRequests, setRefillRequests] = useState([]);
  const [loading, setLoading] = useState({
    profile: false,
    patients: false,
    appointments: false,
  });

  const fetchPatients = async () => {
    const patients = await viewMyPatients();
    console.log("Patients fetched: ", patients);
    if (patients) {
      setPatients(patients);
      console.log("patients : ", patients);
    }
  };

  const loadRefillRequests = () => {
    try {
      const storedRequests = JSON.parse(localStorage.getItem('refillRequests') || '[]');
      const doctorId = user?.user?._id;
      
      console.log('Loading refill requests for doctor:', doctorId);
      console.log('All stored requests:', storedRequests);
      
      const doctorRequests = storedRequests.filter(request => request.doctorId === doctorId);
      console.log('Doctor requests:', doctorRequests);
      
      // Find patients data
      const patientMap = {};
      if (patients && patients.length > 0) {
        patients.forEach(patient => {
          // Handle different patient object structures
          const patientId = patient.patientId || patient._id;
          if (patientId) {
            patientMap[patientId] = patient.patientDetails || patient;
          }
        });
      }
      
      console.log('Patient map:', patientMap);
      
      const enhancedRequests = doctorRequests.map(request => {
        const patient = patientMap[request.patientId];
        console.log('Processing request for patient ID:', request.patientId);
        console.log('Found patient:', patient);
        
        return {
          ...request,
          patientName: patient ? patient.fullname : `Patient ID: ${request.patientId}`,
          patientEmail: patient ? patient.email : 'N/A'
        };
      });
      
      console.log('Enhanced requests:', enhancedRequests);
      setRefillRequests(enhancedRequests);
    } catch (error) {
      console.error('Error loading refill requests:', error);
    }
  };

  useEffect(() => {
    setDoctorData(user?.user);
    fetchPatients();
    getAppointments();
  }, [doctorData]);

  useEffect(() => {
    if (patients.length > 0) {
      loadRefillRequests();
    }
  }, [patients]);

  const getAppointments = async () => {
    setLoading((prev) => ({ ...prev, appointments: true }));
    try {
      const response = await getDoctorAppointments();
      // console.log("appointment response.data :", response);
      setAppointments(response || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading((prev) => ({ ...prev, appointments: false }));
    }
  };

  const ongoingAppointments = appointments.filter(
    (appt) => appt.status?.toLowerCase() === "active"
  );
  
  const upcomingAppointments = appointments.filter(
    (appt) => ["pending", "approved"].includes(appt.status?.toLowerCase())
  );
  
  const completedAppointments = appointments.filter(
    (appt) => appt.status?.toLowerCase() === "completed"
  );
  // const formatAddress = (address) =>
  //   address
  //     ? `${address.street}, ${address.city}, ${address.state} ${address.zip}`
  //     : "Address not available";

  // const getStatusColor = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case "confirmed":
  //       return "status-confirmed";
  //     case "pending":
  //       return "status-pending";
  //     case "cancelled":
  //       return "status-cancelled";
  //     default:
  //       return "status-inactive";
  //   }
  // };

  // const formatDateTime = (dateString) => {
  //   if (!dateString) return "N/A";
  //   const date = new Date(dateString);

  //   const optionsDate = { year: "numeric", month: "short", day: "numeric" };
  //   const optionsTime = { hour: "2-digit", minute: "2-digit" };

  //   const apptDate = date.toLocaleDateString("en-US", optionsDate);
  //   const apptTime = date.toLocaleTimeString("en-US", optionsTime);

  //   return `${apptDate} at ${apptTime}`;
  // };

  if (authLoading || !doctorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={doctorData} />

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
              title="Total Appointments"
              value={appointments.length}
              color="green"
            />
            <HealthCard
              icon={TrendingUp}
              title="Active Cases"
              value={ongoingAppointments.length}
              color="purple"
            />
            <HealthCard
              icon={MessageSquare}
              title="Pending Messages"
              value="3" //do this later
              color="orange"
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
                      <h3 className="text-lg font-semibold text-gray-900">Refill Requests</h3>
                      <p className="text-sm text-gray-600">Prescription refill requests from your patients</p>
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
                    <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{request.patientName}</p>
                              <p className="text-sm text-gray-500">{request.patientEmail}</p>
                            </div>
                          </div>
                          <div className="ml-11">
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">{request.medications?.length || 0}</span> medication(s) requested
                            </p>
                            {request.medications && request.medications.length > 0 && (
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
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.urgency === 'urgent' 
                              ? 'bg-red-100 text-red-800' 
                              : request.urgency === 'normal'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
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

          {/* Appointments and Patients Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Appointments Column */}
            <div className="space-y-6">
              {/* Upcoming Appointments */}
              <div className="card h-fit">
                <div className="card-header">
                  <h2 className="card-title">Upcoming Appointments</h2>
                </div>
                <div className="space-y-4">
                  {loading.appointments ? (
                    <div className="flex justify-center py-6">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                    upcomingAppointments.slice(0, 3).map((appointment) => (
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
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-6">
                      No upcoming appointments.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Completed Appointments */}
              <div className="card h-fit">
                <div className="card-header">
                  <h2 className="card-title">Completed Appointments</h2>
                </div>
                <div className="space-y-4">
                  {loading.appointments ? (
                    <div className="flex justify-center py-6">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : completedAppointments && completedAppointments.length > 0 ? (
                    completedAppointments.slice(0, 3).map((appointment) => (
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
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-6">
                      No completed appointments.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Patients Column */}
            <div className="card h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">Recent Patients</h2>
                <button
                  onClick={() => router.push("/doctor/patient/add")}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Patient
                </button>
              </div>
              {loading.patients ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner size="md" />
                </div>
              ) : patients && patients.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {patients.slice(0, 4).map((patient) => (
                    <div
                      key={patient.patientId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/doctor/patient/${patient.patientId}`)
                      }
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            patient.patientDetails.profilePic ||
                            "/default-avatar.png"
                          }
                          alt={patient.patientDetails.fullname}
                          className="h-12 w-12 rounded-full object-cover mr-4 border border-gray-200"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {patient.patientDetails.fullname}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {patient.patientDetails.age} years old •{" "}
                            {patient.patientDetails.gender}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-6">
                  No recent patients available.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions at Bottom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <button
              onClick={() => router.push("/doctor/patient/add")}
              className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">
                Add New Patient
              </span>
            </button>
            <button
              onClick={() => router.push("/doctor/patient/")}
              className="flex items-center justify-center p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
            >
              <Stethoscope className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">
                View Your Patients
              </span>
            </button>
            <button
              onClick={() => router.push("/doctor/appointment")}
              className="flex items-center justify-center p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer"
            >
              <Calendar className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">
                Manage Appointments
              </span>
            </button>
            <button
              onClick={() => router.push("/doctor/reports")}
              className="flex items-center justify-center p-4 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors cursor-pointer"
            >
              <FileText className="h-5 w-5 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-gray-700">
                View Reports
              </span>
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
