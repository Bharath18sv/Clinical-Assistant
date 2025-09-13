"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAppointmentById, completeAppointment } from "@/utils/api";

export default function PatientAppointmentDetail() {
  const params = useParams();
  const id = params?.id;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const data = await fetchAppointmentById(id);
        if (mounted) setAppointment(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!appointment) return <p className="p-4">Not found</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border">
      <h1 className="text-2xl font-semibold mb-2">Appointment</h1>
      <p className="text-gray-600 mb-4">
        {new Date(appointment.scheduledAt).toLocaleString()} ·{" "}
        {appointment.status}
      </p>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Doctor:</span>{" "}
          {appointment.doctorId?.fullname || "Doctor"}
        </p>
        <p>
          <span className="font-medium">Reason:</span>{" "}
          {appointment.reason || "-"}
        </p>
        {appointment.notes && (
          <p>
            <span className="font-medium">Notes:</span> {appointment.notes}
          </p>
        )}
      </div>
      {appointment.status === "active" && (
        <button
          onClick={async () => {
            try {
              const updated = await completeAppointment(appointment._id);
              setAppointment(updated);
            } catch (e) {
              console.error(e);
            }
          }}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
        >
          End Appointment
        </button>
      )}
    </div>
  );
}
