"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award } from "lucide-react";

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Doctor Info Card */}
        <div className="card mb-8">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {doctor.profilePic ? (
                <img
                  src={doctor.profilePic}
                  alt={doctor.fullname || "Doctor"}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {doctor.fullname?.charAt(0) || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {doctor.fullname || "Unknown Doctor"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {doctor.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {doctor.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <Award className="h-4 w-4 mr-2" />
                  {doctor.specialization?.join(", ") || "General"}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {doctor.experience} years experience
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mt-4">
                <span className={`status-badge ${
                  doctor.status === "approved" ? "status-confirmed" :
                  doctor.status === "pending" ? "status-pending" :
                  "status-cancelled"
                }`}>
                  {doctor.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* About */}
          <div className="card">
            <h3 className="card-title mb-4">About</h3>
            <p className="text-gray-600">
              {doctor.about || "No description available"}
            </p>
          </div>

          {/* Qualifications */}
          <div className="card">
            <h3 className="card-title mb-4">Qualifications</h3>
            <div className="space-y-2">
              {doctor.qualifications?.map((qual, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                >
                  {qual}
                </span>
              )) || <p className="text-gray-500">No qualifications listed</p>}
            </div>
          </div>

          {/* Address */}
          <div className="card">
            <h3 className="card-title mb-4">Address</h3>
            <div className="flex items-start text-gray-600">
              <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
              <div>
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
                  <p>No address provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Approval Info */}
          {doctor.approvedBy && (
            <div className="card">
              <h3 className="card-title mb-4">Approval Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Approved by: {doctor.approvedBy.fullname}</p>
                {doctor.approvedAt && (
                  <p>Approved on: {new Date(doctor.approvedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}