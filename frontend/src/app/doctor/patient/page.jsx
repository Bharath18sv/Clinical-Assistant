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
} from "lucide-react";

export default function DoctorPatientsPage({ params }) {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const doctorId = user?.user?._id;
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
        console.log("my patients :", patients);
        console.log("first patient profile pic:", patients[0]?.patientDetails?.profilePic);
        if (patients) {
          setPatients(patients || []);
        }
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
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demographics
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medical Info
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr
                        key={patient.patientDetails._id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() =>
                          handlePatientClick(patient.patientDetails._id)
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                              {patient.patientDetails.profilePic ? (
                                <img
                                  src={patient.patientDetails.profilePic}
                                  alt={`${patient.patientDetails.fullname}'s profile`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    // Fallback to default icon if image fails to load
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`h-full w-full bg-blue-100 rounded-full flex items-center justify-center ${
                                  patient.patientDetails.profilePic ? "hidden" : "flex"
                                }`}
                              >
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {patient.patientDetails.fullname}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {patient.patientDetails.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {patient.patientDetails.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              Age {patient.patientDetails.age}
                            </div>
                            <div className="text-sm text-gray-600">
                              {patient.patientDetails.gender}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                              {patient.patientDetails.chronicConditions
                                ?.length > 0 && (
                                <div className="flex items-start">
                                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">
                                      Chronic Conditions
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {patient.patientDetails.chronicConditions.join(
                                        ", "
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {patient.patientDetails.allergies?.length > 0 && (
                                <div className="flex items-start">
                                  <Pill className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">
                                      Allergies
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {patient.patientDetails.allergies.join(
                                        ", "
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {patient.patientDetails.symptoms?.length > 0 && (
                                <div className="flex items-start">
                                  <Stethoscope className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium text-gray-700">
                                      Current Symptoms
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {patient.patientDetails.symptoms.join(
                                        ", "
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors ml-4" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="bg-white rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => handlePatientClick(patient.patientDetails._id)}
                >
                  {/* Patient Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden">
                        {patient.patientDetails.profilePic ? (
                          <img
                            src={patient.patientDetails.profilePic}
                            alt={`${patient.patientDetails.fullname}'s profile`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-full w-full bg-blue-100 rounded-full flex items-center justify-center ${
                            patient.patientDetails.profilePic ? "hidden" : "flex"
                          }`}
                        >
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {patient.patientDetails.fullname}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Age {patient.patientDetails.age} •{" "}
                          {patient.patientDetails.gender}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-3 text-gray-400" />
                      {patient.patientDetails.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      {patient.patientDetails.phone}
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-3">
                    {patient.patientDetails.chronicConditions?.length > 0 && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center mb-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            Chronic Conditions
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {patient.patientDetails.chronicConditions.join(", ")}
                        </p>
                      </div>
                    )}

                    {patient.patientDetails.allergies?.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Pill className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            Allergies
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {patient.patientDetails.allergies.join(", ")}
                        </p>
                      </div>
                    )}

                    {patient.patientDetails.symptoms?.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Stethoscope className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            Current Symptoms
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {patient.patientDetails.symptoms.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
