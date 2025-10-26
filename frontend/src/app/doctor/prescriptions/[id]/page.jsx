"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPrescriptionById, getPatientById, deletePrescription } from "@/utils/api";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  User,
  Calendar,
  Clock,
  Pill,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [patient, setPatient] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const router = useRouter();

  // Load prescription by id (replaces mock data)
  const params = useParams();
  const prescriptionId = params?.id;

  useEffect(() => {
    let mounted = true;

    const loadPrescription = async () => {
      if (!prescriptionId) {
        setPrescriptions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getPrescriptionById(prescriptionId);
        setLoadError(null);

        // res may be an ApiResponse-like object { statusCode, data, message, success }
        const pres = res?.data || res;

        if (!pres) {
          if (mounted) setPrescriptions([]);
          return;
        }

        // Map backend prescription to the UI shape expected by this component
        const med = pres.medications?.[0] || {};
        const mapped = {
          id: pres._id || pres.id || prescriptionId,
          medicationName: med.name || pres.title || "Untitled",
          dosage: med.dosage ? `${med.dosage}mg` : med.dosage || "",
          frequency: med.schedule ? med.schedule.join(", ") : "As prescribed",
          duration: med.duration ? `${med.duration} days` : med.duration || "",
          instructions: med.notes || pres.notes || "",
          prescribedDate: pres.createdAt
            ? new Date(pres.createdAt).toLocaleDateString()
            : pres.date
              ? new Date(pres.date).toLocaleDateString()
              : "",
          status: pres.status || med.status || "active",
          refills: pres.refills || 0,
          refillsUsed: pres.refillsUsed || 0,
          condition: pres.title || "",
        };

        if (mounted) {
          setPrescriptions([mapped]);
          const p = pres.patientId || {};
          if (!p || typeof p === 'string' || (!p.fullname && !p.name)) {
            try {
              const pid = typeof p === 'string' ? p : p?._id;
              if (pid) {
                const patientData = await getPatientById(pid);
                const patientInfo = {
                  id: patientData?._id || pid,
                  name: patientData?.fullname || patientData?.name || 'Unknown Patient',
                  age: patientData?.age || '-',
                  gender: patientData?.gender || '-',
                  phone: patientData?.phone || '-',
                  lastVisit: mapped.prescribedDate || '-',
                  allergies: Array.isArray(patientData?.allergies) ? patientData.allergies : [],
                };
                setPatient(patientInfo);
              } else {
                setPatient(null);
              }
            } catch (e) {
              console.error('Failed to load patient info:', e);
              setPatient(null);
            }
          } else {
            const patientInfo = {
              id: p._id || p,
              name: p.fullname || p.name || 'Unknown Patient',
              age: p.age || '-',
              gender: p.gender || '-',
              phone: p.phone || '-',
              lastVisit: mapped.prescribedDate || '-',
              allergies: Array.isArray(p.allergies) ? p.allergies : [],
            };
            setPatient(patientInfo);
          }
        }
      } catch (error) {
        console.error("Error loading prescription:", error);
        if (mounted) {
          setPrescriptions([]);
          setLoadError('Failed to load prescription.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPrescription();

    return () => {
      mounted = false;
    };
  }, [prescriptionId]);

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.medicationName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.condition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || prescription.status === filterStatus;

    return matchesSearch && matchesFilter;
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
      expired: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle,
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

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      setActionError(null);
      setActionLoading(true);

      // Call backend API
      await deletePrescription(id);

      // Remove from state after successful deletion
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      setShowDeleteModal(null);

      // Navigate to all prescriptions page
      router.push("/doctor/prescriptions/all");
    } catch (error) {
      // Handle server errors
      const message =
        error.response?.data?.message || error.message || "Delete failed";
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPrescription = () => {
    if (!patient?.id) return;
    router.push(`/doctor/prescriptions/new?patientId=${patient.id}`);
  };

  const handleEditPrescription = (id) => {
    router.push(`/doctor/prescriptions/${id}/edit`);
  };

  const handleViewDetails = (id) => {
    router.push(`/doctor/prescriptions/${id}`);
  };

  const handleViewPatientDetails = () => {
    if (!patient?.id) return;
    router.push(`/doctor/patient/${patient.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">
              Loading prescriptions...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Patient Prescriptions
                </h1>
                <p className="text-sm text-gray-600">
                  Manage prescriptions for {patient?.name || 'Patient'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleViewPatientDetails}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User size={16} /> Patient Details
              </button>
              <button
                onClick={handleAddPrescription}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} /> New Prescription
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {loadError && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4">
            {loadError}
          </div>
        )}
        {actionError && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4">
            {actionError}
          </div>
        )}
        {/* Patient Info Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {patient?.name || 'Patient'}
                </h2>
                <p className="text-gray-600">
                  {patient?.age} years old, {patient?.gender}
                </p>
                <p className="text-sm text-gray-500">{patient?.phone}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-600">
                  Last visit: {patient?.lastVisit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-gray-600">
                  Allergies: {patient?.allergies?.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search medications or conditions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 min-w-[220px]">
              {/* Icon is next to select, not on top of it */}
              <Filter
                size={18}
                className="text-gray-400 ml-2"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                style={{ minWidth: '150px' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No prescriptions found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "No prescriptions match your current filters."
                  : "This patient has no prescriptions yet."}
              </p>
              <button
                onClick={handleAddPrescription}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} /> Add First Prescription
              </button>
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Prescription Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {prescription.medicationName}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {prescription.condition}
                          </p>
                          {getStatusBadge(prescription.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 font-medium">Dosage</p>
                          <p className="text-gray-900">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Frequency</p>
                          <p className="text-gray-900">
                            {prescription.frequency}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Duration</p>
                          <p className="text-gray-900">
                            {prescription.duration}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">
                            Prescribed
                          </p>
                          <p className="text-gray-900">
                            {prescription.prescribedDate}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Instructions: </span>
                          {prescription.instructions}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Refills: {prescription.refillsUsed}/
                          {prescription.refills} used
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => handleViewDetails(prescription.id)}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        <Eye size={16} /> View Details
                      </button>
                      <button
                        onClick={() => handleEditPrescription(prescription.id)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(prescription.id)}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Prescription
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this prescription? This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-60"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Prescription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptionsPage;
