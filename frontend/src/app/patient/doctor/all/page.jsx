//view all doctors list and details
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { User, Calendar } from "lucide-react";
import { fetchAllDoctors, fetchMyAppointments } from "@/utils/api"; // adjust api paths

export default function PatientAllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSpecialization, setFilterSpecialization] = useState("all");

  const router = useRouter();

  const getAppointments = async () => {
    const appts = await fetchMyAppointments();
    console.log("appts : ", appts);
    setAppointments(appts);
  };

  // useEffect(() => {
  //   let mounted = true;
  //   (async () => {
  //     try {
  //       const [doctorRes, apptRes] = await Promise.all([
  //         fetchAllDoctors(),
  //         fetchMyAppointments(),
  //       ]);
  //       console.log("All doctors : ", doctorRes.data.docs)
  //       if (!mounted) return;
  //       setDoctors(doctorRes.data.docs);
  //       setAppointments(apptRes);
  //     } catch (e) {
  //       console.error(e);
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   })();
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  // Filter doctors by specialization

  useEffect(() => {
    setLoading(true);
    const fetchDoctors = async () => {
      try {
        const allDoctors = await fetchAllDoctors();
        setDoctors(allDoctors); //res.docs has the doctors data
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
    if (filterSpecialization === "all") return doctors;
    return doctors.filter((doc) =>
      doc.specialization.includes(filterSpecialization)
    );
  }, [doctors, filterSpecialization]);

  // Specializations for filter dropdown
  const specializations = useMemo(() => {
    const allSpecs = doctors.flatMap((d) => d.specialization || []);
    const uniqueSpecs = Array.from(new Set(allSpecs));
    return ["all", ...uniqueSpecs];
  }, [doctors]);

  // Check if patient has appointment with doctor
  const hasAppointment = (doctorId) =>
    appointments.some((appt) => appt.doctorId?._id === doctorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Doctors</h1>
          <p className="text-gray-600 mt-2">
            Browse doctors and book your appointments
          </p>
        </div>

        {/* Filter dropdown */}
        <select
          value={filterSpecialization}
          onChange={(e) => setFilterSpecialization(e.target.value)}
          className="input text-sm"
        >
          {specializations.map((sp, index) => (
            <option key={`${sp}-${index}`} value={sp}>
              {sp === "all" ? "All Specializations" : sp}
            </option>
          ))}
        </select>
      </div>

      {/* Doctors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading doctors...</p>
        ) : filteredDoctors.length === 0 ? (
          <p className="text-gray-500">No doctors found.</p>
        ) : (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="card hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedDoctor(doctor)}
            >
              {/* Profile Image */}
              <div className="flex items-center gap-4">
                {doctor.profilePic ? (
                  <img
                    src={doctor.profilePic}
                    alt={doctor.fullname}
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={28} className="text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {doctor.fullname}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {doctor.specialization.join(", ") || "General"}
                  </p>
                  <span
                    className={`status-badge mt-1 ${
                      doctor.isAvailable
                        ? "status-confirmed"
                        : "status-cancelled"
                    }`}
                  >
                    {doctor.isAvailable ? "Available" : "Not Available"}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                {hasAppointment(doctor._id) ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/patient/doctor/${doctor._id}/appointment`);
                    }}
                    className="btn-primary w-full bg-green-600 hover:bg-green-700"
                  >
                    View Appointment
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/patient/doctor/${doctor._id}/appointment`);
                    }}
                    disabled={!doctor.isAvailable}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Book Appointment
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Doctor details modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setSelectedDoctor(null)}
            >
              ✕
            </button>
            <div className="flex items-center gap-4">
              {selectedDoctor.profilePic ? (
                <img
                  src={selectedDoctor.profilePic}
                  alt={selectedDoctor.fullname}
                  className="w-20 h-20 rounded-full object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={36} className="text-gray-500" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedDoctor.fullname}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedDoctor.specialization || "General"}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    selectedDoctor.isAvailable
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedDoctor.isAvailable ? "Available" : "Not Available"}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedDoctor.email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedDoctor.phone}
              </p>
              <p>
                <span className="font-semibold">Qualifications:</span>{" "}
                {selectedDoctor.qualifications.join(", ")}
                {/* convert qualifications array into strings */}
              </p>
            </div>
            <div className="mt-6">
              {hasAppointment(selectedDoctor._id) ? (
                <button
                  onClick={() => router.push(`/patient/appointments`)}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                >
                  View Appointment
                </button>
              ) : (
                <button
                  onClick={() =>
                    router.push(
                      `/patient/doctor/${selectedDoctor._id}/appointment`
                    )
                  }
                  disabled={!selectedDoctor.isAvailable}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
