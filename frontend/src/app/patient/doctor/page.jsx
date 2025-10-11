"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { getMyDoctors, fetchMyAppointments } from "@/utils/api";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Search,
  Filter,
  UserPlus,
  Stethoscope,
  Award,
  MessageCircle,
  ChevronRight,
  Heart,
  Activity,
  Users,
} from "lucide-react";

export default function PatientDoctorsPage() {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  const patientId = user?.data?.user?._id;

  useEffect(() => {
    if (!patientId || authLoading) return;
    const fetchDoctors = async () => {
      try {
        const myDocs = await getMyDoctors();
        setDoctors(myDocs || []);
      } catch (err) {
        setDoctors([]);
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
    getAppointments();
  }, [patientId, authLoading]);

  const getAppointments = async () => {
    try {
      const appts = await fetchMyAppointments();
      setAppointments(appts || []);
    } catch (error) {
      setAppointments([]);
      console.error("Error fetching appointments:", error);
    }
  };

  const hasAppointment = (doctorId) =>
    appointments.some((appt) => appt.doctorId?._id === doctorId);

  const handleBookAppointment = (doctorId, isAvailable, e) => {
    e.stopPropagation();
    if (isAvailable) {
      router.push(`/patient/appointment/${doctorId}`);
    }
  };

  const handleViewAppointment = (doctorId, e) => {
    e.stopPropagation();
    router.push(`/patient/appointments`);
  };

  const handleDoctorClick = (doctorId) => {
    router.push(`/patient/doctor/${doctorId}`);
  };

  // Filter doctors based on search and specialization
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesSpecialization =
      specializationFilter === "all" ||
      doctor.specialization?.includes(specializationFilter);
    return matchesSearch && matchesSpecialization;
  });

  // Get unique specializations
  const specializations = [
    "all",
    ...Array.from(
      new Set(doctors.flatMap((doctor) => doctor.specialization || []))
    ),
  ];

  const LoadingSkeleton = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center bg-white rounded-3xl shadow-sm border border-gray-100 p-16">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Stethoscope className="h-12 w-12 text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        No doctors found
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {searchQuery || specializationFilter !== "all"
          ? "Try adjusting your search or filters to find your doctors."
          : "You haven't consulted with any doctors yet. Start by finding and booking an appointment with a doctor."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => router.push("/patient/find-doctors")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md"
        >
          <UserPlus className="h-5 w-5" />
          Find Doctors
        </button>
        {(searchQuery || specializationFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSpecializationFilter("all");
            }}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                My Healthcare Team
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Your trusted medical professionals
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {doctors.length}{" "}
                    {doctors.length === 1 ? "Doctor" : "Doctors"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                  <Heart className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Trusted Care
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            {doctors.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 lg:min-w-[400px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  />
                </div>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                >
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec === "all" ? "All Specializations" : spec}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* Results count */}
          {doctors.length > 0 && (
            <div className="mt-6 text-sm text-gray-600">
              {filteredDoctors.length === doctors.length
                ? `Showing all ${doctors.length} doctors`
                : `Showing ${filteredDoctors.length} of ${doctors.length} doctors`}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredDoctors.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                onClick={() => handleDoctorClick(doctor._id)}
                className="bg-white shadow-sm hover:shadow-xl rounded-2xl border border-gray-100 overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105"
              >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {doctor.profilePic ? (
                        <img
                          src={doctor.profilePic}
                          alt={doctor.fullname}
                          className="h-16 w-16 rounded-full object-cover border-3 border-white shadow-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white">
                          <User className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-100 transition-colors">
                        Dr. {doctor.fullname}
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(doctor.specialization || [])
                          .slice(0, 2)
                          .map((spec, index) => (
                            <span
                              key={index}
                              className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm"
                            >
                              {spec}
                            </span>
                          ))}
                        {doctor.specialization?.length > 2 && (
                          <span className="text-xs text-blue-200">
                            +{doctor.specialization.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* About */}
                  {doctor.about && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {doctor.about}
                    </p>
                  )}
                  {/* Qualifications */}
                  {doctor.qualifications?.length > 0 && (
                    <div className="flex items-start gap-2 mb-4">
                      <Award className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 font-medium">
                        {doctor.qualifications.join(", ")}
                      </p>
                    </div>
                  )}
                  {/* Experience */}
                  {typeof doctor.experience === "number" &&
                    doctor.experience > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {doctor.experience} years experience
                        </span>
                      </div>
                    )}
                  {/* Contact Info */}
                  <div className="space-y-2 mb-6">
                    {doctor.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                    {doctor.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">
                          {[doctor.address.city, doctor.address.state]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Member since */}
                  {doctor.createdAt && (
                    <div className="text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      Consulting since{" "}
                      {new Date(doctor.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDoctorClick(doctor._id);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    View Profile
                  </button>
                  {hasAppointment(doctor._id) ? (
                    <button
                      onClick={(e) => handleViewAppointment(doctor._id, e)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md"
                    >
                      View Appointment
                    </button>
                  ) : (
                    <button
                      onClick={(e) =>
                        handleBookAppointment(doctor._id, doctor.isAvailable, e)
                      }
                      disabled={!doctor.isAvailable}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                    >
                      Book Appointment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Quick Actions */}
        {doctors.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/patient/find-doctors")}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Find New Doctor</p>
                  <p className="text-sm text-gray-600">
                    Discover more specialists
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </button>
              <button
                onClick={() => router.push("/patient/appointment")}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">My Appointments</p>
                  <p className="text-sm text-gray-600">View scheduled visits</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </button>
              <button
                onClick={() => router.push("/patient/health-records")}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Health Records</p>
                  <p className="text-sm text-gray-600">
                    Access medical history
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
