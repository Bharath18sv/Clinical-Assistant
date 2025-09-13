"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import API from "@/utils/api";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  Activity,
  AlertTriangle,
  Plus,
  Eye,
  Stethoscope,
  CheckCircle,
  Clock,
} from "lucide-react";
import HealthCard from "@/components/HealthCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboardPage() {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    activeUsers: 0,
  });
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState({
    stats: false,
    doctors: false,
    patients: false,
  });

  // Fetch dashboard stats
  const getDashboardStats = async () => {
    setLoading((prev) => ({ ...prev, stats: true }));
    try {
      const response = await API.get("/admin/dashboard/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats({
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        activeUsers: 0,
      });
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  };

  // Fetch recent doctors
  const getRecentDoctors = async () => {
    setLoading((prev) => ({ ...prev, doctors: true }));
    try {
      const response = await API.get("/admin/doctors");
      if (response.data.success) {
        setRecentDoctors(response.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setRecentDoctors([]);
    } finally {
      setLoading((prev) => ({ ...prev, doctors: false }));
    }
  };

  // Fetch recent patients
  const getRecentPatients = async () => {
    setLoading((prev) => ({ ...prev, patients: true }));
    try {
      const response = await API.get("/patients/recent");
      if (response.data.success) {
        setRecentPatients(response.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setRecentPatients([]);
    } finally {
      setLoading((prev) => ({ ...prev, patients: false }));
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      getDashboardStats();
      getRecentDoctors();
      getRecentPatients();
    }
  }, [user, authLoading]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user.fullname}! Here's your system overview.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <HealthCard
              icon={Users}
              title="Total Doctors"
              value={loading.stats ? "..." : stats.totalDoctors}
              color="blue"
            />
            <HealthCard
              icon={UserCheck}
              title="Total Patients"
              value={loading.stats ? "..." : stats.totalPatients}
              color="green"
            />
            <HealthCard
              icon={Calendar}
              title="Appointments"
              value={loading.stats ? "..." : stats.totalAppointments}
              color="purple"
            />
            <HealthCard
              icon={Activity}
              title="Active Users"
              value={loading.stats ? "..." : stats.activeUsers}
              color="orange"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/admin/doctors/add")}
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-6 w-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Add Doctor</div>
                  <div className="text-sm text-gray-500">
                    Register new doctor
                  </div>
                </div>
              </button>
              <button
                onClick={() => router.push("/admin/doctors")}
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Eye className="h-6 w-6 text-green-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">View Doctors</div>
                  <div className="text-sm text-gray-500">
                    Manage all doctors
                  </div>
                </div>
              </button>
              <button
                onClick={() => router.push("/admin/patients")}
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <UserCheck className="h-6 w-6 text-purple-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">View Patients</div>
                  <div className="text-sm text-gray-500">
                    Manage all patients
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Doctors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Doctors
                </h2>
                <button
                  onClick={() => router.push("/admin/doctors")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {loading.doctors ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDoctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {doctor.fullname}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {doctor.specialization?.join(", ") || "General"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {doctor.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          doctor.status
                        )}`}
                      >
                        {doctor.status || "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Patients
                </h2>
                <button
                  onClick={() => router.push("/admin/patients")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {loading.patients ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-4">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {patient.fullname}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {patient.age} years • {patient.gender}
                          </p>
                          <p className="text-xs text-gray-400">
                            {patient.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}