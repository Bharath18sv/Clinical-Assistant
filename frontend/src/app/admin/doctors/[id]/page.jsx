"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Briefcase, User, FileText } from "lucide-react";

export default function DoctorDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchDoctorDetails();
    }
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/admin/doctors/${id}`);
      if (response.data.success) {
        setDoctor(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      setError("Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Doctor not found"}</p>
          <button
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Doctor Details
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {doctor.profilePic ? (
                <img
                  src={doctor.profilePic}
                  alt={doctor.fullname || "Doctor"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100">
                  <span className="text-4xl font-bold text-white">
                    {doctor.fullname?.charAt(0) || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  Dr. {doctor.fullname || "Unknown Doctor"}
                </h2>
                <span className={`status-badge mt-2 md:mt-0 ${
                  doctor.status === "approved" ? "status-confirmed" :
                  doctor.status === "pending" ? "status-pending" :
                  "status-cancelled"
                }`}>
                  {doctor.status || "Active"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="break-all">{doctor.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  {doctor.phone}
                </div>
                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <Award className="h-4 w-4 mr-2 text-blue-600" />
                  {doctor.specialization?.join(", ") || "General"}
                </div>
                <div className="flex items-center justify-center md:justify-start text-gray-600">
                  <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                  {doctor.experience} years experience
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About */}
          <div className="card lg:col-span-2">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {doctor.about || "No description available"}
            </p>
          </div>

          {/* Qualifications */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Award className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Qualifications</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {doctor.qualifications?.length > 0 ? (
                doctor.qualifications.map((qual, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {qual}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No qualifications listed</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="card">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Address</h3>
            </div>
            <div className="text-gray-600 text-sm space-y-1">
              {doctor.address ? (
                <>
                  {doctor.address.street && <p>{doctor.address.street}</p>}
                  <p>
                    {[doctor.address.city, doctor.address.state, doctor.address.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {doctor.address.country && <p>{doctor.address.country}</p>}
                </>
              ) : (
                <p className="text-gray-500">No address provided</p>
              )}
            </div>
          </div>

          {/* Approval Info */}
          {doctor.approvedBy && (
            <div className="card lg:col-span-2">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Approval Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Approved by</p>
                  <p className="text-gray-900 font-medium">{doctor.approvedBy.fullname}</p>
                </div>
                {doctor.approvedAt && (
                  <div>
                    <p className="text-gray-500 mb-1">Approved on</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(doctor.approvedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}