"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  AlertTriangle,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await API.get("/patients/recent");
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      // Mock data for demo
      setPatients([
        {
          _id: "1",
          fullname: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          age: 45,
          gender: "Male",
          isActive: true,
          chronicConditions: ["Diabetes", "Hypertension"],
          allergies: ["Peanuts"],
          symptoms: ["Fatigue"],
          doctorId: {
            fullname: "Dr. Sarah Johnson",
            specialization: ["Cardiology"],
          },
          createdAt: "2024-01-10",
          address: {
            city: "New York",
            state: "NY",
          },
        },
        {
          _id: "2",
          fullname: "Jane Smith",
          email: "jane@example.com",
          phone: "098-765-4321",
          age: 32,
          gender: "Female",
          isActive: true,
          chronicConditions: ["Asthma"],
          allergies: ["Penicillin"],
          symptoms: ["Cough"],
          doctorId: {
            fullname: "Dr. Michael Chen",
            specialization: ["Pulmonology"],
          },
          createdAt: "2024-01-09",
          address: {
            city: "Los Angeles",
            state: "CA",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <UserCheck className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    );
  };

  const getRiskLevel = (patient) => {
    const riskFactors =
      (patient.chronicConditions?.length || 0) +
      (patient.allergies?.length || 0) +
      (patient.symptoms?.length || 0);

    if (riskFactors >= 5) return { level: "High", color: "text-red-600" };
    if (riskFactors >= 3) return { level: "Medium", color: "text-yellow-600" };
    return { level: "Low", color: "text-green-600" };
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.fullname
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && patient.isActive) ||
      (statusFilter === "inactive" && !patient.isActive);
    const matchesGender =
      genderFilter === "all" || patient.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                <p className="text-gray-600 mt-2">
                  Manage all patients in the system
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Total: {filteredPatients.length} patients
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Health Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => {
                      const risk = getRiskLevel(patient);
                      return (
                        <tr key={patient._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="p-2 bg-green-100 rounded-lg mr-4">
                                <UserCheck className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {patient.fullname}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {patient.age} years • {patient.gender}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {patient.address?.city}, {patient.address?.state}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center mb-1">
                                <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                {patient.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                {patient.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {patient.doctorId?.fullname || "No Doctor Assigned"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.doctorId?.specialization?.join(", ") || ""}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className={`text-sm font-medium ${risk.color}`}>
                                Risk: {risk.level}
                              </div>
                              <div className="text-xs text-gray-500">
                                {patient.chronicConditions?.length || 0} conditions
                              </div>
                              <div className="text-xs text-gray-500">
                                {patient.allergies?.length || 0} allergies
                              </div>
                              <div className="text-xs text-gray-500">
                                {patient.symptoms?.length || 0} symptoms
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                patient.isActive
                              )}`}
                            >
                              {getStatusIcon(patient.isActive)}
                              <span className="ml-1">
                                {patient.isActive ? "Active" : "Inactive"}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  router.push(`/admin/patients/${patient._id}`)
                                }
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredPatients.length === 0 && (
                  <div className="text-center py-12">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No patients found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No patients match your current filters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}