"use client";

import { useEffect, useState } from "react";
import {
  fetchDoctorActiveAppointments,
  startAppointment,
  completeAppointment,
} from "@/utils/api";

export default function DoctorActiveAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDoctorActiveAppointments();
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
      <h1 className="text-2xl font-semibold">Active Appointments</h1>
      {appointments.length === 0 ? (
        <p>No active appointments.</p>
      ) : (
        appointments.map((a) => (
          <div
            key={a._id}
            className="border rounded p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">
                {a.patientId?.fullname || "Patient"}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(a.scheduledAt).toLocaleString()}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={async () => {
                  const updated = await completeAppointment(a._id);
                  setAppointments((prev) =>
                    prev.filter((x) => x._id !== updated._id)
                  );
                }}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                End
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
