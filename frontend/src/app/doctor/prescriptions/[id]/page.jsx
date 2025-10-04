//doctor views the prescriptions given to a patient
//doctor can delete or add a prescription
//doctor can edit a prescription
//doctor can view the details of a prescription
//a button to navigate to add a new prescription for the patient
//a button to navigate to edit a prescription for the patient
//a button to delete a prescription for the patient
//a button to view the details of a prescription for the patient
//a button to view the details of a patient which redirects to the patient details page

"use client";
import React, { useState, useEffect } from "react";
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

  // Mock patient data - replace with actual API call
  const patient = {
    id: "patient_123",
    name: "John Smith",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    lastVisit: "2024-01-15",
    allergies: ["Penicillin", "Sulfa drugs"],
  };

  // Mock prescriptions data - replace with actual API call
  useEffect(() => {
    const mockPrescriptions = [
      {
        id: "rx_001",
        medicationName: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with food in the morning",
        prescribedDate: "2024-01-15",
        status: "active",
        refills: 2,
        refillsUsed: 0,
        condition: "Hypertension",
      },
      {
        id: "rx_002",
        medicationName: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "90 days",
        instructions: "Take with meals",
        prescribedDate: "2024-01-10",
        status: "active",
        refills: 5,
        refillsUsed: 1,
        condition: "Diabetes Type 2",
      },
      {
        id: "rx_003",
        medicationName: "Amoxicillin",
        dosage: "250mg",
        frequency: "Three times daily",
        duration: "7 days",
        instructions: "Complete full course",
        prescribedDate: "2024-01-05",
        status: "completed",
        refills: 0,
        refillsUsed: 0,
        condition: "Bacterial infection",
      },
    ];

    setTimeout(() => {
      setPrescriptions(mockPrescriptions);
      setLoading(false);
    }, 1000);
  }, []);

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

  const handleDelete = (prescriptionId) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
    setShowDeleteModal(null);
  };

  const handleAddPrescription = () => {
    // Navigate to add prescription page
    console.log("Navigate to add prescription for patient:", patient.id);
  };

  const handleEditPrescription = (prescriptionId) => {
    // Navigate to edit prescription page
    console.log("Navigate to edit prescription:", prescriptionId);
  };

  const handleViewDetails = (prescriptionId) => {
    // Navigate to prescription details page
    console.log("Navigate to prescription details:", prescriptionId);
  };

  const handleViewPatientDetails = () => {
    // Navigate to patient details page
    console.log("Navigate to patient details:", patient.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading prescriptions...</span>
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
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Patient Prescriptions
                </h1>
                <p className="text-sm text-gray-600">
                  Manage prescriptions for {patient.name}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleViewPatientDetails}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User size={16} />
                Patient Details
              </button>
              <button
                onClick={handleAddPrescription}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                New Prescription
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Patient Info Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {patient.name}
                </h2>
                <p className="text-gray-600">
                  {patient.age} years old, {patient.gender}
                </p>
                <p className="text-sm text-gray-500">{patient.phone}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-600">
                  Last visit: {patient.lastVisit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-gray-600">
                  Allergies: {patient.allergies.join(", ")}
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
            <div className="relative">
              <Filter
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                <Plus size={16} />
                Add First Prescription
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
                        <Eye size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleEditPrescription(prescription.id)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(prescription.id)}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        <Trash2 size={16} />
                        Delete
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
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Prescription
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