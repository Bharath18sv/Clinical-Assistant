//view doctor details, availability and book appointment option
"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { getDoctorById, fetchMyAppointments } from "@/utils/api";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Briefcase,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  MessageCircle,
  Video,
  Loader2,
  Shield,
  Heart,
  Activity,
} from "lucide-react";

export default function DoctorProfilePage() {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const doctorId = params?.id;

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAppointment, setHasAppointment] = useState(false);

  useEffect(() => {
    if (!doctorId || authLoading) return;
    fetchDoctorData();
    fetchAppointments();
  }, [doctorId, authLoading]);

  const fetchDoctorData = async () => {
    try {
      const data = await getDoctorById(doctorId);
      setDoctor(data);
    } catch (error) {
      console.error("Error fetching doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const appts = await fetchMyAppointments();
      setAppointments(appts);
      const hasAppt = appts.some((appt) => appt.doctorId?._id === doctorId);
      setHasAppointment(hasAppt);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleBookAppointment = () => {
    router.push(`/patient/doctor/${doctorId}/appointment`);
  };

  const handleViewAppointments = () => {
    router.push("/patient/appointment");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Doctor Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The doctor you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl bg-white/10">
                    {doctor.profilePic ? (
                      <img
                        src={doctor.profilePic}
                        alt={doctor.fullname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/default-doctor.png"
                        alt="Default Doctor"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {doctor.isAvailable && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Available
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      Dr. {doctor.fullname}
                    </h1>
                    <Shield className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {doctor.specialization?.map((spec, index) => (
                      <span
                        key={index}
                        className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
                    {doctor.experience && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                    )}
                    {doctor.patients?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>{doctor.patients.length} patients</span>
                      </div>
                    )}
                    {doctor.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Since{" "}
                          {new Date(doctor.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border text-center ${
                      doctor.status === "approved"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : doctor.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {doctor.status || "Pending"}
                  </span>
                  {doctor.isApproved && (
                    <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - About & Contact */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              {doctor.about && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      About Dr. {doctor.fullname}
                    </h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {doctor.about}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Phone className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-4">
                  {doctor.email && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-gray-800 font-medium">
                          {doctor.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {doctor.phone && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-gray-800 font-medium">
                          {doctor.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {doctor.address && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Address</p>
                        <p className="text-gray-800 font-medium">
                          {[
                            doctor.address.street,
                            doctor.address.city,
                            doctor.address.state,
                            doctor.address.zip,
                            doctor.address.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Professional Details */}
            <div className="space-y-6">
              {/* Qualifications */}
              {doctor.qualifications?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Qualifications
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {doctor.qualifications.map((qual, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <BookOpen className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-sm text-gray-800 font-medium">
                          {qual}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specializations */}
              {doctor.specialization?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Specializations
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {doctor.specialization.map((spec, index) => (
                      <div
                        key={index}
                        className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 text-indigo-700 font-medium text-sm"
                      >
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Status */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Availability
                  </h3>
                </div>
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    doctor.isAvailable
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  {doctor.isAvailable ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p
                      className={`font-semibold ${
                        doctor.isAvailable ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {doctor.isAvailable
                        ? "Available"
                        : "Currently Unavailable"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {doctor.isAvailable
                        ? "Accepting new appointments"
                        : "Not accepting appointments at the moment"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {hasAppointment ? (
                <button
                  onClick={handleViewAppointments}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  View My Appointments
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBookAppointment}
                    disabled={!doctor.isAvailable}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Appointment
                  </button>
                  {/* <button
                    className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                    disabled={!doctor.isAvailable}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Doctor
                  </button> */}
                </>
              )}
            </div>
            {!doctor.isAvailable && (
              <p className="text-sm text-red-600 mt-3 text-center">
                This doctor is currently not accepting new appointments
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}