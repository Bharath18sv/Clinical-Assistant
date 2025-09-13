"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  fetchAppointmentById,
  startAppointment,
  completeAppointment,
} from "@/utils/api";

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchAppointmentById(id);
        setAppointment(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!appointment) return <p className="p-4">Not found</p>;

  const canStart =
    appointment.status === "approved" || appointment.status === "pending";
  const canComplete = appointment.status === "active";

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border">
      <h1 className="text-2xl font-semibold mb-2">Appointment</h1>
      <p className="text-gray-600 mb-4">
        {new Date(appointment.scheduledAt).toLocaleString()} ·{" "}
        {appointment.status}
      </p>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Patient:</span>{" "}
          {appointment.patientId?.fullname || "Patient"}
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
      <div className="mt-6 space-x-2">
        {canStart && (
          <button
            onClick={async () => {
              const updated = await startAppointment(appointment._id);
              setAppointment(updated);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Start
          </button>
        )}
        {canComplete && (
          <button
            onClick={async () => {
              const updated = await completeAppointment(appointment._id);
              setAppointment(updated);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            End
          </button>
        )}
      </div>
    </div>
  );
}
