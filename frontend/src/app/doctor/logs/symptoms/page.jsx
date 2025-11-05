"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Calendar,
  ChevronRight,
  AlertCircle,
  Mail,
  Phone,
  Filter,
  X,
} from "lucide-react";
import { getPatientListForDoctor } from "@/utils/api/symptoms.api";
import { useRouter } from "next/navigation";

const DoctorPatientsListPage = () => {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPatientListForDoctor();
      console.log("Patients response:", response);

      if (response?.data) {
        const patientsList = Array.isArray(response.data) ? response.data : [];
        setPatients(patientsList);
        setFilteredPatients(patientsList);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError(error.response?.data?.message || "Failed to load patients list");
      setLoading(false);
    }
  };

  // Apply search and filters
  useEffect(() => {
    let result = [...patients];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (patient) =>
          patient.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.includes(searchTerm)
      );
    }

    // Gender filter
    if (genderFilter) {
      result = result.filter(
        (patient) =>
          patient.gender?.toLowerCase() === genderFilter.toLowerCase()
      );
    }

    // Sorting
    result.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "name":
          compareA = a.fullname?.toLowerCase() || "";
          compareB = b.fullname?.toLowerCase() || "";
          break;
        case "email":
          compareA = a.email?.toLowerCase() || "";
          compareB = b.email?.toLowerCase() || "";
          break;
        case "age":
          compareA = a.age || 0;
          compareB = b.age || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    setFilteredPatients(result);
  }, [searchTerm, genderFilter, sortBy, sortOrder, patients]);

  const handlePatientClick = (patientId) => {
    router.push(`/doctor/logs/symptoms/${patientId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setGenderFilter("");
  };

  const activeFiltersCount = [genderFilter].filter(Boolean).length;

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Patients
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPatients}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600 mt-2">
            View and manage your patient symptom logs
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter size={20} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="age">Age</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.length}
                </p>
              </div>
              <User className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Filtered Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredPatients.length}
                </p>
              </div>
              <Filter className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Search</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchTerm || genderFilter ? "Yes" : "No"}
                </p>
              </div>
              <Search className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <User className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No patients found</p>
              <p className="text-gray-400 text-sm mt-2">
                {patients.length === 0
                  ? "You don't have any patients yet"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient, index) => (
                <div
                  key={patient._id}
                  onClick={() => handlePatientClick(patient._id)}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div
                        className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getAvatarColor(
                          index
                        )}`}
                      >
                        {patient.profilePic ? (
                          <img
                            src={patient.profilePic}
                            alt={patient.fullname}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(patient.fullname)
                        )}
                      </div>

                      {/* Patient Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {patient.fullname}
                        </h3>

                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          {patient.email && (
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              <span>{patient.email}</span>
                            </div>
                          )}

                          {patient.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{patient.phone}</span>
                            </div>
                          )}

                          {patient.age && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{patient.age} years old</span>
                            </div>
                          )}

                          {patient.gender && (
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span className="capitalize">
                                {patient.gender}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Additional Info */}
                        {(patient.allergies?.length > 0 ||
                          patient.chronicConditions?.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {patient.allergies?.length > 0 && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                {patient.allergies.length} Allergies
                              </span>
                            )}
                            {patient.chronicConditions?.length > 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                {patient.chronicConditions.length} Conditions
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          View Symptom Logs
                        </p>
                        <p className="text-xs text-gray-500">Click to view</p>
                      </div>
                      <ChevronRight
                        className="text-gray-400 group-hover:text-blue-600 transition-colors"
                        size={24}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredPatients.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredPatients.length} of {patients.length} total
            patients
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientsListPage;
