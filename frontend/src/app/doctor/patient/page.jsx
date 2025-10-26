"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { viewMyPatients } from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  AlertTriangle,
  Pill,
  Stethoscope,
  ChevronRight,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Patient Card Component
const PatientCard = ({ patient, status, onPatientClick }) => {
  const calculateDuration = (lastVisit) => {
    if (!lastVisit) return "N/A";
    const now = new Date();
    const visitDate = new Date(lastVisit);
    const diffTime = Math.abs(now - visitDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years !== 1 ? "s" : ""}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "border-green-200 bg-green-50";
      case "completed":
        return "border-blue-200 bg-blue-50";
      case "cancelled":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 ${getStatusColor(status)} hover:shadow-md transition-all cursor-pointer group`}
      onClick={() => onPatientClick(patient.patientDetails._id)}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden">
            {patient.patientDetails.profilePic ? (
              <img
                src={patient.patientDetails.profilePic}
                alt={`${patient.patientDetails.fullname}'s profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {patient.patientDetails.fullname}
            </h3>
            <p className="text-sm text-gray-500">
              Age {patient.patientDetails.age} • {patient.patientDetails.gender}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            <span className="truncate">{patient.patientDetails.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {patient.patientDetails.phone}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{calculateDuration(patient.lastVisit)} since last visit</span>
          </div>
        </div>
        {(patient.patientDetails.chronicConditions?.length > 0 ||
          patient.patientDetails.allergies?.length > 0) && (
          <div className="space-y-2">
            {patient.patientDetails.chronicConditions?.length > 0 && (
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Conditions</p>
                  <p className="text-xs text-gray-600">
                    {patient.patientDetails.chronicConditions.slice(0, 2).join(", ")}
                    {patient.patientDetails.chronicConditions.length > 2 &&
                      " +" +
                        (patient.patientDetails.chronicConditions.length - 2)}
                  </p>
                </div>
              </div>
            )}
            {patient.patientDetails.allergies?.length > 0 && (
              <div className="flex items-start">
                <Pill className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Allergies</p>
                  <p className="text-xs text-gray-600">
                    {patient.patientDetails.allergies.slice(0, 2).join(", ")}
                    {patient.patientDetails.allergies.length > 2 &&
                      " +" + (patient.patientDetails.allergies.length - 2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function DoctorPatientsPage({ params }) {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePatientClick = (patientId) => {
    router.push(`/doctor/patient/${patientId}`);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patients = await viewMyPatients();
        setPatients(patients || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.user?._id) {
      fetchPatients();
    }
  }, [user]);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.patientDetails.fullname
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.patientDetails.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.patientDetails.phone?.includes(searchTerm)
  );

  // Group patients by appointment status
  const activePatients = filteredPatients.filter((p) =>
    ["pending", "approved", "active"].includes(p.latestStatus)
  );
  const completedPatients = filteredPatients.filter(
    (p) => p.latestStatus === "completed"
  );
  const cancelledPatients = filteredPatients.filter(
    (p) => p.latestStatus === "cancelled"
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Patients
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {patients.length} patient{patients.length !== 1 ? "s" : ""}{" "}
                  under your care
                </p>
              </div>
            </div>
            {/* Search Bar */}
            <div className="relative max-w-md w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "No matching patients found"
                : "No patients assigned"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Patients will appear here once they are assigned to your care"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Patients */}
            {activePatients.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 text-green-600 mr-2" />
                  Active Patients ({activePatients.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activePatients.map((patient) => (
                    <PatientCard
                      key={patient.patientDetails._id}
                      patient={patient}
                      status="active"
                      onPatientClick={handlePatientClick}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Completed Patients */}
            {completedPatients.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  Completed Patients ({completedPatients.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedPatients.map((patient) => (
                    <PatientCard
                      key={patient.patientDetails._id}
                      patient={patient}
                      status="completed"
                      onPatientClick={handlePatientClick}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Cancelled Patients */}
            {cancelledPatients.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  Cancelled Patients ({cancelledPatients.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cancelledPatients.map((patient) => (
                    <PatientCard
                      key={patient.patientDetails._id}
                      patient={patient}
                      status="cancelled"
                      onPatientClick={handlePatientClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
