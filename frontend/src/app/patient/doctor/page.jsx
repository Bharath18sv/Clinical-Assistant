"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { getMyDoctors, fetchMyAppointments } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import MyDoctors from "@/components/patient/MyDoctors";
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
    const fetchData = async () => {
      if (authLoading) return;
      
      setLoading(true);
      try {
        const [myDocs, appts] = await Promise.all([
          getMyDoctors(),
          fetchMyAppointments()
        ]);
        setDoctors(myDocs || []);
        setAppointments(appts || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setDoctors([]);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [authLoading]);





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

  // const LoadingSkeleton = () => (
  //   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  //     {[...Array(6)].map((_, i) => (
  //       <div
  //         key={i}
  //         className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
  //       >
  //         <div className="flex items-center gap-4 mb-4">
  //           <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
  //           <div className="flex-1 space-y-2">
  //             <div className="h-5 bg-gray-200 rounded w-3/4"></div>
  //             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  //           </div>
  //         </div>
  //         <div className="space-y-2 mb-4">
  //           <div className="h-3 bg-gray-200 rounded"></div>
  //           <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  //         </div>
  //         <div className="h-10 bg-gray-200 rounded-lg"></div>
  //       </div>
  //     ))}
  //   </div>
  // );

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
          <LoadingSpinner />
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
      <MyDoctors
        filteredDoctors={filteredDoctors}
        onDoctorClick={handleDoctorClick}
        actions={true}
      />
    </div>
  );
}
