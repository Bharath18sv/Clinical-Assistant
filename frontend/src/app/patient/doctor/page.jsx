"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { getMyDoctors } from "@/utils/api";

export default function PatientDoctorsPage() {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const patientId = user?.data?.user?._id;

  useEffect(() => {
    if (!patientId || authLoading) return;
    const fetchDoctors = async () => {
      try {
        const myDocs = await getMyDoctors();
        setDoctors(myDocs);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [patientId, authLoading]);

  const handleBookAppointment = (doctorId, e) => {
    e.stopPropagation();
    router.push(`/patient/appointment/${doctorId}`);
  };

  const handleDoctorClick = (doctorId) => {
    router.push(`/patient/doctor/${doctorId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading your doctors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">My Doctors</h1>
          <p className="text-gray-600">
            Healthcare providers you’ve consulted with
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Total Doctors: {doctors.length}
          </p>
        </div>

        {/* No doctors */}
        {doctors.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow p-10">
            <p className="text-gray-600 mb-4">
              You haven’t booked any appointments yet.
            </p>
            <button
              onClick={() => router.push("/patient/find-doctors")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Find Doctors
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                onClick={() => handleDoctorClick(doctor._id)}
                className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
              >
                {/* Doctor Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Dr. {doctor.fullname}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {doctor.specialization?.join(", ") || "General Physician"}
                  </p>
                </div>

                {/* Contact */}
                {doctor.email && (
                  <p className="text-sm text-gray-600">📧 {doctor.email}</p>
                )}
                {doctor.phone && (
                  <p className="text-sm text-gray-600">📞 {doctor.phone}</p>
                )}

                {/* About */}
                {doctor.about && (
                  <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                    {doctor.about}
                  </p>
                )}

                {/* Qualifications */}
                {doctor.qualifications?.length > 0 && (
                  <p className="mt-3 text-sm text-gray-700">
                    🎓 {doctor.qualifications.join(", ")}
                  </p>
                )}

                {/* Joined */}
                {doctor.createdAt && (
                  <p className="mt-2 text-xs text-gray-500">
                    Joined:{" "}
                    {new Date(doctor.createdAt).toLocaleDateString("en-IN")}
                  </p>
                )}

                {/* Action */}
                <button
                  onClick={(e) => handleBookAppointment(doctor._id, e)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
