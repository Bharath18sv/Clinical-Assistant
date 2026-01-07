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
  Mail,
  Phone,
  Award,
  Briefcase,
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
                <option value="all">All </option>
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

          {/* Doctors Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="card text-center py-12">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="card hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Header with Status */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`status-badge ${getStatusColor(doctor.status)}`}
                    >
                      {getStatusIcon(doctor.status)}
                      <span className="ml-1">{doctor.status || "Active"}</span>
                    </span>
                  </div>

                  {/* Profile Section */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-blue-100">
                      {doctor.profilePic ? (
                        <img
                          src={doctor.profilePic}
                          alt={doctor.fullname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="icon-container icon-blue w-full h-full flex items-center justify-center">
                          <Stethoscope className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      Dr. {doctor.fullname}
                    </h3>
                  </div>

                  {/* Info Section */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start text-sm">
                      <Award className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {doctor.specialization?.join(", ") || "General"}
                        </p>
                        {doctor.qualifications && (
                          <p className="text-gray-500 text-xs">
                            {doctor.qualifications.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">
                        {doctor.experience} years experience
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 truncate">
                        {doctor.email}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{doctor.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => router.push(`/admin/doctors/${doctor._id}`)}
                        className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      {doctor.status === "pending" && (
                        <button
                          onClick={() => handleApprove(doctor._id)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(doctor._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {doctor.status === "pending" && (
                      <button
                        onClick={() => handleReject(doctor._id)}
                        className="w-full mt-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-100 transition-colors text-sm flex items-center justify-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
