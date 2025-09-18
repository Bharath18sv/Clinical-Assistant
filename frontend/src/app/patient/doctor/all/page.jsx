"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Clock,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { fetchAllDoctors, fetchMyAppointments } from "@/utils/api";

export default function PatientAllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSpecialization, setFilterSpecialization] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();

  const getAppointments = async () => {
    try {
      const appts = await fetchMyAppointments();
      setAppointments(appts);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchDoctors = async () => {
      try {
        const allDoctors = await fetchAllDoctors();
        setDoctors(allDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
    getAppointments();
  }, []);

  const filteredDoctors = useMemo(() => {
    let filtered = doctors;

    // Filter by specialization
    if (filterSpecialization !== "all") {
      filtered = filtered.filter((doc) =>
        doc.specialization.includes(filterSpecialization)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.specialization.some((spec) =>
            spec.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return filtered;
  }, [doctors, filterSpecialization, searchQuery]);

  const specializations = useMemo(() => {
    const allSpecs = doctors.flatMap((d) => d.specialization || []);
    return ["all", ...new Set(allSpecs)];
  }, [doctors]);

  const hasAppointment = (doctorId) =>
    appointments.some((appt) => appt.doctorId?._id === doctorId);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Find Your Doctor
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Browse {doctors.length} qualified doctors and book appointments
                instantly
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 lg:min-w-[400px]">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search doctors or specializations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Filter</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Specialization
              </label>
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {specializations.map((sp, index) => (
                  <option key={`${sp}-${index}`} value={sp}>
                    {sp === "all" ? "All Specializations" : sp}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Results Count */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredDoctors.length === doctors.length
                ? `Showing all ${doctors.length} doctors`
                : `Showing ${filteredDoctors.length} of ${doctors.length} doctors`}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterSpecialization !== "all"
                ? "Try adjusting your search or filters"
                : "No doctors are currently available"}
            </p>
            {(searchQuery || filterSpecialization !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterSpecialization("all");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => setSelectedDoctor(doctor)}
              >
                <div className="p-6">
                  {/* Doctor Profile */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      {doctor.profilePic ? (
                        <img
                          src={doctor.profilePic}
                          alt={doctor.fullname}
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
                          <User size={32} className="text-blue-600" />
                        </div>
                      )}
                      {/* Availability Indicator */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                          doctor.isAvailable ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {doctor.isAvailable ? (
                          <CheckCircle size={14} className="text-white" />
                        ) : (
                          <AlertCircle size={14} className="text-white" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        Dr. {doctor.fullname}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm mb-1">
                        {doctor.specialization.join(" • ") ||
                          "General Practice"}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock size={12} className="text-gray-400" />
                        <span
                          className={`font-medium ${
                            doctor.isAvailable
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {doctor.isAvailable
                            ? "Available Now"
                            : "Currently Busy"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star size={14} className="text-yellow-500" />
                      <span>
                        {doctor.qualifications?.join(", ") ||
                          "Qualified Professional"}
                      </span>
                    </div>
                    {doctor.experience && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                    )}
                  </div>

                  {/* About Preview */}
                  {doctor.about && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {doctor.about}
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  {hasAppointment(doctor._id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/patient/doctor/${doctor._id}/appointment`
                        );
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md"
                    >
                      View Appointment
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/patient/doctor/${doctor._id}/appointment`
                        );
                      }}
                      disabled={!doctor.isAvailable}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600 transition-all duration-200 shadow-md"
                    >
                      Book Appointment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Doctor Details
              </h2>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setSelectedDoctor(null)}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Doctor Profile Section */}
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  {selectedDoctor.profilePic ? (
                    <img
                      src={selectedDoctor.profilePic}
                      alt={selectedDoctor.fullname}
                      className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-gray-200">
                      <User size={48} className="text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedDoctor.isAvailable
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {selectedDoctor.isAvailable ? "Available" : "Busy"}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    Dr. {selectedDoctor.fullname}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedDoctor.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  {selectedDoctor.experience && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar size={16} />
                      <span>
                        {selectedDoctor.experience} years of experience
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">
                      {selectedDoctor.email}
                    </p>
                  </div>
                </div>

                {selectedDoctor.phone && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">
                        {selectedDoctor.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Address Information */}
              {selectedDoctor.address && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Address
                      </p>
                      <p className="text-sm text-gray-600">
                        {[
                          selectedDoctor.address.street,
                          selectedDoctor.address.city,
                          selectedDoctor.address.state,
                          selectedDoctor.address.zip,
                          selectedDoctor.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Qualifications */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Qualifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.qualifications?.map((qual, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-200"
                    >
                      {qual}
                    </span>
                  )) || (
                    <p className="text-gray-600">No qualifications listed</p>
                  )}
                </div>
              </div>

              {/* About Section */}
              {selectedDoctor.about && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    About
                  </h4>
                  <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {selectedDoctor.about}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-3">
                {hasAppointment(selectedDoctor._id) ? (
                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      router.push(`/patient/appointments`);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md"
                  >
                    View My Appointment
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      router.push(
                        `/patient/doctor/${selectedDoctor._id}/appointment`
                      );
                    }}
                    disabled={!selectedDoctor.isAvailable}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                  >
                    Book Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
