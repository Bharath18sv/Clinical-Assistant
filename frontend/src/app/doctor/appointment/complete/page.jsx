"use client";

import { useEffect, useState } from "react";
import { fetchDoctorCompletedAppointments } from "@/utils/api";

export default function DoctorCompletedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDoctorCompletedAppointments();
        setAppointments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading...</p>;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Completed Appointments</h1>
      {appointments.length === 0 ? (
        <p>No completed appointments.</p>
      ) : (
        appointments.map((a) => (
          <div key={a._id} className="border rounded p-4">
            <p className="font-medium">{a.patientId?.fullname || "Patient"}</p>
            <p className="text-sm text-gray-600">
              {new Date(a.scheduledAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
