"use client";

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Pill,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  User,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { getPatientPrescriptions } from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";

export default function PatientPrescriptions() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const patient = user?.data?.user;
  const patientId = patient?._id;

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAllPrescriptions = async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getPatientPrescriptions(patientId);
      console.log("Fetched prescriptions:", response);

      if (response.success && response.data) {
        setPrescriptions(response.data);
      } else {
        setError("No prescriptions found.");
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to fetch prescriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPrescriptions();
  }, [patientId]);

  const handlePrescriptionClick = (prescriptionId) => {
    router.push(`/patient/prescriptions/${prescriptionId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-700 bg-green-100";
      case "completed":
        return "text-gray-700 bg-gray-100";
      case "pending":
        return "text-yellow-700 bg-yellow-100";
      case "cancelled":
        return "text-red-700 bg-red-100";
      default:
        return "text-blue-700 bg-blue-100";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications.some((med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" ||
      prescription.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getMedicationCount = (medications) => {
    return medications?.length || 0;
  };

  const getActiveMedicationCount = (medications) => {
    return medications?.filter((med) => med.status === "active")?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-600 mt-2">
          View and manage all your prescriptions from healthcare providers
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.length}
              </p>
              <p className="text-sm text-gray-600">Total Prescriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter((p) => p.status === "active").length}
              </p>
              <p className="text-sm text-gray-600">Active Prescriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.reduce(
                  (total, p) => total + getMedicationCount(p.medications),
                  0
                )}
              </p>
              <p className="text-sm text-gray-600">Total Medications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions or medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-2">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchAllPrescriptions}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "No prescriptions found matching your filters"
                : "No prescriptions available"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription._id}
                onClick={() => handlePrescriptionClick(prescription._id)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                              {prescription.title || "Untitled Prescription"}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Prescribed: {formatDate(prescription.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Pill className="h-4 w-4" />
                                <span>
                                  {getMedicationCount(prescription.medications)}{" "}
                                  medications
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Medications Preview */}
                        <div className="ml-11">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {prescription.medications
                              .slice(0, 3)
                              .map((medication, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {medication.name} - {medication.dosage}
                                  {medication.duration &&
                                    ` (${medication.duration} days)`}
                                </span>
                              ))}
                            {prescription.medications.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                                +{prescription.medications.length - 3} more
                              </span>
                            )}
                          </div>

                          {prescription.medications.length > 0 &&
                            prescription.medications[0].notes && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                <span className="font-medium">Notes:</span>{" "}
                                {prescription.medications[0].notes}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            prescription.status
                          )}`}
                        >
                          {prescription.status?.charAt(0).toUpperCase() +
                            prescription.status?.slice(1)}
                        </span>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Set Medication Reminders
                </h3>
                <p className="text-sm text-gray-500">
                  Never miss a dose with smart notifications
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/prescriptions/refill-request")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Pill className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Request Refill</h3>
                <p className="text-sm text-gray-500">
                  Request prescription refills from your doctor
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
