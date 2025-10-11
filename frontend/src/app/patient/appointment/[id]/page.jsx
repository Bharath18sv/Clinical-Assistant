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
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Appointment Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">
              {new Date(selected.scheduledAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              Doctor Specialization: {doctor.specialization.join(", ")}
            </span>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Reason</h3>
            <p className="text-sm text-gray-600">{selected.reason || "-"}</p>
          </div>

          {selected.status === "active" && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => handleEndAppointment(appointment._id)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                End Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
