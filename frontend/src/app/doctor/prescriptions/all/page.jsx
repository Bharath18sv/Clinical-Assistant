"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  User,
  Calendar,
  Search,
  Filter,
  Pill,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  X,
  Activity,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { getDoctorPrescriptions, getPrescriptionById } from "@/utils/api";

const AllPrescriptionsPage = () => {
  const router = useRouter();
  const { user, authLoading } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPatient, setFilterPatient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchAllPrescriptions = async () => {

    try {
      setLoading(true);
      setError(null);

      const response = await getDoctorPrescriptions();
      console.log("Fetched prescriptions:", response);

      if (response.success && response.data) {
        setPrescriptions(response.data);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to fetch prescriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllPrescriptions();
    }
  }, [user, authLoading]);

  const getDateRangeFilter = () => {
    const today = new Date();
    const startDate = new Date();

    switch (filterDate) {
      case "today":
        return [
          today.toISOString().split("T")[0],
          today.toISOString().split("T")[0],
        ];
      case "week":
        startDate.setDate(today.getDate() - 7);
        return [
          startDate.toISOString().split("T")[0],
          today.toISOString().split("T")[0],
        ];
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        return [
          startDate.toISOString().split("T")[0],
          today.toISOString().split("T")[0],
        ];
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        return [
          startDate.toISOString().split("T")[0],
          today.toISOString().split("T")[0],
        ];
      default:
        return null;
    }
  };

  const getUniquePatients = () => {
    const patientMap = new Map();
    prescriptions.forEach((prescription) => {
      if (
        prescription.patientId &&
        !patientMap.has(prescription.patientId._id || prescription.patientId)
      ) {
        const id = prescription.patientId._id || prescription.patientId;
        const name =
          prescription.patientId.fullname ||
          prescription.patientId.name ||
          "Unknown Patient";
        patientMap.set(id, { id, name });
      }
    });
    return Array.from(patientMap.values());
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    // Search filter - search through title and medications
    const matchesSearch =
      prescription.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications?.some((med) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (prescription.patientId?.fullname || prescription.patientId?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Patient filter
    const prescriptionPatientId =
      prescription.patientId?._id || prescription.patientId;
    const matchesPatient =
      filterPatient === "all" || prescriptionPatientId === filterPatient;

    // Status filter
    const matchesStatus =
      filterStatus === "all" || prescription.status === filterStatus;

    // Date filter
    let matchesDate = true;
    if (filterDate !== "all") {
      const dateRange = getDateRangeFilter();
      if (dateRange) {
        const prescriptionDate = new Date(prescription.date);
        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);
        endDate.setHours(23, 59, 59, 999);
        matchesDate =
          prescriptionDate >= startDate && prescriptionDate <= endDate;
      }
    }

    return matchesSearch && matchesPatient && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      completed: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: CheckCircle,
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: X,
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMedicationStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-blue-100 text-blue-800", icon: Activity },
      completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
      discontinued: {
        color: "bg-orange-100 text-orange-800",
        icon: AlertTriangle,
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
      >
        <IconComponent size={10} />
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSchedule = (schedule) => {
    return schedule
      .map((time) => time.charAt(0).toUpperCase() + time.slice(1))
      .join(", ");
  };

  const handleViewPrescriptionDetails = (prescriptionId) => {
    router.push(`/prescriptions/${prescriptionId}`);
  };

  const handleViewPatientDetails = (patientId) => {
    router.push(`/patients/${patientId}`);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterPatient("all");
    setFilterStatus("all");
    setFilterDate("all");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterPatient !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterDate !== "all") count++;
    return count;
  };

  const getMedicationCount = (prescription) => {
    return prescription.medications?.length || 0;
  };

  const getActiveMedicationCount = (prescription) => {
    return (
      prescription.medications?.filter((med) => med.status === "active")
        .length || 0
    );
  };

  // if (authLoading || loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 p-6">
  //       <div className="max-w-7xl mx-auto">
  //         <div className="flex items-center justify-center py-12">
  //           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //           <span className="ml-2 text-gray-600">Loading prescriptions...</span>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAllPrescriptions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const uniquePatients = getUniquePatients();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                All Prescriptions
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and view all patient prescriptions
              </p>
            </div>
            <div className="text-sm text-gray-600">
              Total: {filteredPrescriptions.length} prescriptions
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by prescription title, medication name, or patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter size={20} />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <select
                    value={filterPatient}
                    onChange={(e) => setFilterPatient(e.target.value)}
                    className="outline-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Patients</option>
                    {uniquePatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="outline-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="outline-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>

              {getActiveFiltersCount() > 0 && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  >
                    <X size={16} />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No prescriptions found
              </h3>
              <p className="text-gray-600">
                {searchTerm ||
                filterPatient !== "all" ||
                filterStatus !== "all" ||
                filterDate !== "all"
                  ? "No prescriptions match your current filters."
                  : "No prescriptions have been created yet."}
              </p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <div
                key={prescription._id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                    {/* Prescription Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {prescription.title || "Untitled Prescription"}
                            </h3>
                            {getStatusBadge(prescription.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <User size={16} />
                            <span className="font-medium">
                              {prescription.patientId?.fullname ||
                                prescription.patientId?.name ||
                                "Unknown Patient"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>
                              Prescribed: {formatDate(prescription.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Medications List */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Medications ({getMedicationCount(prescription)} total,{" "}
                          {getActiveMedicationCount(prescription)} active)
                        </p>
                        <div className="space-y-2">
                          {prescription.medications?.map(
                            (medication, index) => (
                              <div
                                key={index}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Pill className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-gray-900">
                                      {medication.name}
                                    </span>
                                    {getMedicationStatusBadge(
                                      medication.status
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {medication.dosage}mg
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm ml-6">
                                  <div>
                                    <span className="text-gray-500">
                                      Duration:{" "}
                                    </span>
                                    <span className="text-gray-900">
                                      {medication.duration} days
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Schedule:{" "}
                                    </span>
                                    <span className="text-gray-900">
                                      {formatSchedule(medication.schedule)}
                                    </span>
                                  </div>
                                </div>
                                {medication.notes && (
                                  <p className="text-sm text-gray-600 mt-2 ml-6">
                                    <span className="font-medium">Note: </span>
                                    {medication.notes}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex xl:flex-col gap-2">
                      <button
                        onClick={() =>
                          handleViewPrescriptionDetails(prescription._id)
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          handleViewPatientDetails(
                            prescription.patientId?._id ||
                              prescription.patientId
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        <User size={16} />
                        Patient Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPrescriptionsPage;
