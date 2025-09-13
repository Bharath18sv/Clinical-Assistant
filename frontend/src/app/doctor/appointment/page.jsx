"use client";

import { useEffect, useState } from "react";
import { fetchMyAppointments } from "@/utils/api";
import AppointmentCard from "@/components/AppointmentCard";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyAppointments();
        setAppointments(data.filter((a) => !!a.patientId));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All Appointments</h1>
      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <AppointmentCard
              key={a._id}
              appointment={{
                id: a._id,
                doctorName: a.patientId?.fullname || "Patient",
                type: a.reason || "Consultation",
                date: new Date(a.scheduledAt).toDateString(),
                time: new Date(a.scheduledAt).toLocaleTimeString(),
                status: a.status,
                doctorDetails: {
                  specialization: "",
                  phone: "",
                  email: "",
                  location: "",
                },
                notes: a.notes || "",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
