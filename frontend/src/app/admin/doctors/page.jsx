//view all doctors, with filter by specialization, active or inactive, search by name

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Stethoscope,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/doctors");
      if (response.data.success) {
        const doctorsData = response.data.data;
        const finalData = Array.isArray(doctorsData) ? doctorsData : [];
        setDoctors(finalData);
        console.log("doctors for admin: ", finalData);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleApprove = async (doctorId) => {
    try {
      await API.put(`/admin/doctors/${doctorId}/approve`, {
        status: "approved",
      });
      fetchDoctors(); // Refresh list
    } catch (error) {
      console.error("Error approving doctor:", error);
    }
  };

  const handleReject = async (doctorId) => {
    if (confirm("Are you sure you want to reject this doctor?")) {
      try {
        await API.put(`/admin/doctors/${doctorId}/approve`, {
          status: "rejected",
        });
        fetchDoctors(); // Refresh list
      } catch (error) {
        console.error("Error rejecting doctor:", error);
      }
    }
  };

  const handleDelete = async (doctorId) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      try {
        await API.delete(`/admin/doctors/${doctorId}`);
        fetchDoctors(); // Refresh list
      } catch (error) {
        console.error("Error deleting doctor:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "rejected":
        return "status-cancelled";
      default:
        return "status-inactive";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredDoctors = Array.isArray(doctors)
    ? doctors.filter((doctor) => {
        const matchesSearch = doctor.fullname
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || doctor.status === statusFilter;
        const matchesSpecialization =
          specializationFilter === "all" ||
          doctor.specialization?.includes(specializationFilter);

        return matchesSearch && matchesStatus && matchesSpecialization;
      })
    : [];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
                <p className="text-gray-600 mt-2">
                  Manage all doctors in the system
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/doctors/add")}
                className="btn-primary flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Doctor
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input outline-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Specialization Filter */}
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="input outline-none"
              >
                <option value="all">All Specializations</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
              </select>
            </div>
          </div>

          {/* Doctors List */}
          <div className="card">
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
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
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
                    {filteredDoctors.map((doctor) => (
                      <tr key={doctor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                              {doctor.profilePic ? (
                                <img
                                  src={doctor.profilePic}
                                  alt={doctor.fullname}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="icon-container icon-blue w-full h-full flex items-center justify-center">
                                  <Stethoscope className="h-6 w-6" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Dr. {doctor.fullname}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doctor.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doctor.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {doctor.specialization?.join(", ") || "General"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.qualifications?.join(", ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {doctor.experience} years
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`status-badge ${getStatusColor(
                              doctor.status
                            )}`}
                          >
                            {getStatusIcon(doctor.status)}
                            <span className="ml-1">
                              {doctor.status || "Active"}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                router.push(`/admin/doctors/${doctor._id}`)
                              }
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {doctor.status === "pending" && (
                              <button
                                onClick={() => handleApprove(doctor._id)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {/* Reject (only if pending) */}
                            {doctor.status === "pending" && (
                              <button
                                onClick={() => handleReject(doctor._id)}
                                className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(doctor._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredDoctors.length === 0 && (
                  <div className="text-center py-12">
                    <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No doctors found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding a new doctor.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => router.push("/admin/doctors/add")}
                        className="btn-primary inline-flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Doctor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
