"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Pill,
  Activity,
  CalendarPlus,
  ArrowLeft,
  Eye,
  TrendingUp,
  Shield,
  FileText,
  Clock,
  MapPin,
  UserCheck,
  Stethoscope,
  Heart,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  BarChart3,
} from "lucide-react";
import {
  getPatientById,
  getMedicationLogs,
  getAllMedicationLogs,
} from "@/utils/api";
import { downloadPatientReportPdfForDoctor } from "@/utils/api";
import BookAppointment from "@/components/BookAppointment";
import AddPrescription from "@/components/forms/AddPrescription";
import AddVitals from "@/components/forms/AddVitals";
import SymptomsLog from "@/components/SymptomsLog";
import ADRalerts from "@/components/ADRalerts";
import VitalsCard from "@/components/VitalsCard";
import PrescriptionCard from "@/components/PrescriptionCard";

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useContext(AuthContext);
  const patientId = params?.id;

  // Patient data state
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);

  // Medication logs state
  const [medicationLogs, setMedicationLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLogMedication, setSelectedLogMedication] = useState("all");
  const [logDateFilter, setLogDateFilter] = useState("all");
  const [logStatusFilter, setLogStatusFilter] = useState("all");

  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    time: "",
    type: "consultation",
    notes: "",
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        const patientData = await getPatientById(patientId);
        setPatient(patientData);
      } catch (error) {
        console.error("Error fetching patient:", error);
        setError("Failed to load patient data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  // Fetch medication logs when switching to logs tab
  useEffect(() => {
    if (activeTab === "medication-logs" && patientId) {
      fetchMedicationLogs();
    }
  }, [activeTab, patientId]);

  const fetchMedicationLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await getAllMedicationLogs(patientId);
      console.log("Fetched medication logs:", response);

      if (response.success && response.data) {
        setMedicationLogs(response.data.logs || []);
      } else {
        setMedicationLogs([]);
      }
    } catch (error) {
      console.error("Error fetching medication logs:", error);
      setMedicationLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    console.log("Booking appointment:", appointmentForm);
    alert("Appointment booked successfully!");
    setAppointmentForm({
      date: "",
      time: "",
      type: "consultation",
      notes: "",
    });
  };

  const handleViewAppointments = () => {
    router.push(`/doctor/patients/${patientId}/appointments`);
  };

  // Medication logs filtering and stats
  const getUniqueMedications = () => {
    const medicationSet = new Set();
    medicationLogs?.forEach((log) => {
      medicationSet.add(log.medicationName);
    });
    return Array.from(medicationSet).sort();
  };

  const getDateRangeFilter = () => {
    const today = new Date();
    const startDate = new Date();

    switch (logDateFilter) {
      case "today":
        return [today, today];
      case "week":
        startDate.setDate(today.getDate() - 7);
        return [startDate, today];
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        return [startDate, today];
      default:
        return null;
    }
  };

  const filteredLogs = medicationLogs?.filter((log) => {
    const matchesMedication =
      selectedLogMedication === "all" ||
      log.medicationName === selectedLogMedication;

    const matchesStatus =
      logStatusFilter === "all" || log.status === logStatusFilter;

    let matchesDate = true;
    if (logDateFilter !== "all") {
      const dateRange = getDateRangeFilter();
      if (dateRange) {
        const logDate = new Date(log.date);
        const [startDate, endDate] = dateRange;
        matchesDate = logDate >= startDate && logDate <= endDate;
      }
    }

    return matchesMedication && matchesStatus && matchesDate;
  });

  const getAdherenceStats = (medicationName) => {
    const logs = medicationLogs.filter(
      (log) => log.medicationName === medicationName
    );
    const taken = logs.filter((log) => log.status === "taken").length;
    const missed = logs.filter((log) => log.status === "missed").length;
    const skipped = logs.filter((log) => log.status === "skipped").length;
    const total = logs.length;

    return {
      taken,
      missed,
      skipped,
      total,
      adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
    };
  };

  const getOverallAdherence = () => {
    const total = medicationLogs.length;
    const taken = medicationLogs.filter((log) => log.status === "taken").length;
    return total > 0 ? Math.round((taken / total) * 100) : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "taken":
        return "text-green-700 bg-green-100 border-green-200";
      case "missed":
        return "text-red-700 bg-red-100 border-red-200";
      case "skipped":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading patient details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Patient
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Patient not found state
  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Patient Not Found
          </h3>
          <p className="text-gray-500 mb-4">
            The requested patient could not be found.
          </p>
          <button
            onClick={() => router.push("/doctor/patients")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  const EmptyStateCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white rounded-xl shadow-sm border p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );

  const uniqueMedications = getUniqueMedications();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={
                      patient?.profilePic
                        ? patient.profilePic
                        : patient?.gender === "female"
                          ? "/default-female.png"
                          : "/default-male.png"
                    }
                    alt={patient?.fullname || "Patient"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient?.fullname || "Unknown Patient"}
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-500">
                      ID: {patient?._id?.slice(-8) || "Unknown"}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Age {patient?.age || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <UserCheck className="w-4 h-4" />
                      <span>{patient?.gender || "Unknown"}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <button
              onClick={() => downloadPatientReportPdfForDoctor(patientId)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: Eye },
              { id: "vitals", name: "Vitals", icon: Activity },
              { id: "prescriptions", name: "Prescriptions", icon: Pill },
              {
                id: "medication-logs",
                name: "Medication Logs",
                icon: FileText,
              },
              {
                id: "appointments",
                name: "Book Appointment",
                icon: CalendarPlus,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Patient Information
                  </h3>
                </div>

                {patient.email || patient.phone || patient.address ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {patient.email && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-900 font-medium">
                              {patient.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {patient.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-900 font-medium">
                              {patient.phone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {patient.address && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-gray-900 font-medium">
                              {typeof patient.address === "string"
                                ? patient.address
                                : `${patient?.address?.street || ""}, ${patient?.address?.city || ""
                                  }, ${patient?.address?.state || ""} ${patient?.address?.zip || ""
                                  }, ${patient?.address?.country || ""}`
                                  .replace(/,\s*,/g, ",")
                                  .replace(/^,\s*|,\s*$/g, "")
                                  .trim()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Age & Gender</p>
                          <p className="text-gray-900 font-medium">
                            {patient.age || "Unknown"} years •{" "}
                            {patient.gender || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No contact information available
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Patient Status</p>
                      <p className="text-2xl font-bold">Active</p>
                    </div>
                    <Heart className="h-8 w-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Quick Actions</h4>
                    <Stethoscope className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab("vitals")}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        Add Vitals
                      </p>
                      <p className="text-xs text-gray-500">
                        Record new vital signs
                      </p>
                    </button>
                    <button
                      onClick={() => setActiveTab("prescriptions")}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        New Prescription
                      </p>
                      <p className="text-xs text-gray-500">
                        Prescribe medications
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chronic Conditions */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chronic Conditions
                  </h3>
                </div>
                {patient.chronicConditions &&
                  patient.chronicConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.chronicConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full border border-orange-200"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No chronic conditions recorded
                    </p>
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Allergies
                  </h3>
                </div>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full border border-red-200"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No known allergies</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Symptoms */}
            {patient.symptoms && patient.symptoms.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Current Symptoms
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full border border-blue-200"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Components */}
            <ADRalerts patient={patient} />
            <SymptomsLog patient={patient} />
          </div>
        )}

        {activeTab === "vitals" && (
          <div className="space-y-6">
            <VitalsCard patient={patient} />
            <AddVitals patient={patient} />
          </div>
        )}

        {activeTab === "prescriptions" && (
          <div className="space-y-6">
            <PrescriptionCard patient={patient} />
            <AddPrescription patient={patient} />
          </div>
        )}

        {activeTab === "medication-logs" && (
          <div className="space-y-6">
            {/* Adherence Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Overall Adherence</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {getOverallAdherence()}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Logs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {medicationLogs.length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Doses Taken</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {
                        medicationLogs.filter((log) => log.status === "taken")
                          .length
                      }
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Doses Missed</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">
                      {
                        medicationLogs.filter((log) => log.status === "missed")
                          .length
                      }
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Medication-wise Adherence */}
            {uniqueMedications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Medication-wise Adherence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueMedications.map((medication) => {
                    const stats = getAdherenceStats(medication);
                    return (
                      <div
                        key={medication}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Pill className="h-5 w-5 text-purple-600" />
                          <h4 className="font-medium text-gray-900">
                            {medication}
                          </h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Adherence:</span>
                            <span
                              className={`font-medium ${stats.adherenceRate >= 90
                                  ? "text-green-600"
                                  : stats.adherenceRate >= 70
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                            >
                              {stats.adherenceRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${stats.adherenceRate >= 90
                                  ? "bg-green-500"
                                  : stats.adherenceRate >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              style={{
                                width: `${stats.adherenceRate}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Taken: {stats.taken}</span>
                            <span>Missed: {stats.missed}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication
                  </label>
                  <select
                    value={selectedLogMedication}
                    onChange={(e) => setSelectedLogMedication(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Medications</option>
                    {uniqueMedications.map((medication) => (
                      <option key={medication} value={medication}>
                        {medication}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={logStatusFilter}
                    onChange={(e) => setLogStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="taken">Taken</option>
                    <option value="missed">Missed</option>
                    <option value="skipped">Skipped</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={logDateFilter}
                    onChange={(e) => setLogDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
              {(selectedLogMedication !== "all" ||
                logStatusFilter !== "all" ||
                logDateFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSelectedLogMedication("all");
                      setLogStatusFilter("all");
                      setLogDateFilter("all");
                    }}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
            </div>

            {/* Medication Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Medication Log History
                  </h3>
                  <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredLogs.length} of {medicationLogs.length} logs
                </p>
              </div>

              {logsLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading medication logs...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No medication logs found
                  </h3>
                  <p className="text-gray-600">
                    {medicationLogs.length === 0
                      ? "No medication logs have been recorded yet."
                      : "No logs match your current filters."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                          Medication
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                          Date & Time
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                          Dosage
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-6 font-medium text-gray-900 text-sm">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredLogs.map((log) => (
                        <tr
                          key={log._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Pill className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-gray-900">
                                {log.medicationName}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-gray-900 font-medium">
                                {formatDate(log.date)}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {log.timeOfDay}
                              </p>
                              {log.takenAt && (
                                <p className="text-xs text-gray-500">
                                  Logged: {formatDateTime(log.takenAt)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-900">
                            {log.dosage}mg
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {log.status === "taken" && (
                                <CheckCircle size={12} />
                              )}
                              {log.status === "missed" && <XCircle size={12} />}
                              {log.status === "skipped" && <Clock size={12} />}
                              {log.status.charAt(0).toUpperCase() +
                                log.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="max-w-xs">
                              {log.notes ? (
                                <p className="text-sm text-gray-600 truncate">
                                  {log.notes}
                                </p>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                              {log.sideEffects && (
                                <p className="text-xs text-red-600 mt-1">
                                  Side effects: {log.sideEffects}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <BookAppointment
            setAppointmentForm={setAppointmentForm}
            appointmentForm={appointmentForm}
            handleAppointmentSubmit={handleAppointmentSubmit}
          />
        )}
      </div>
    </div>
  );
}
