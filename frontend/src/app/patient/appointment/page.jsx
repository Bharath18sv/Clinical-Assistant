"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail } from "lucide-react";
import AppointmentCard from "@/components/AppointmentCard";

export default function PatientAppointments() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Mock data - in a real app, this would come from API calls
  const appointments = [
    {
      id: 1,
      doctorName: "Dr. Sarah Smith",
      type: "General Checkup",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      status: "Confirmed",
      doctorDetails: {
        specialization: "Internal Medicine",
        phone: "+1 (555) 123-4567",
        email: "sarah.smith@hospital.com",
        location: "Room 205, Building A",
      },
      notes: "Annual physical examination and blood work review",
    },
    {
      id: 2,
      doctorName: "Dr. John Wilson",
      type: "Follow-up",
      date: "Dec 20, 2024",
      time: "2:30 PM",
      status: "Upcoming",
      doctorDetails: {
        specialization: "Cardiology",
        phone: "+1 (555) 234-5678",
        email: "john.wilson@hospital.com",
        location: "Room 312, Building B",
      },
      notes: "Follow-up on blood pressure medication effectiveness",
    },
    {
      id: 3,
      doctorName: "Dr. Emily Davis",
      type: "Consultation",
      date: "Dec 10, 2024",
      time: "3:00 PM",
      status: "Completed",
      doctorDetails: {
        specialization: "Dermatology",
        phone: "+1 (555) 345-6789",
        email: "emily.davis@hospital.com",
        location: "Room 108, Building C",
      },
      notes: "Skin condition assessment and treatment plan",
    },
  ];

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleEndAppointment = (appointmentId) => {
    // In a real app, this would make an API call to end the appointment
    console.log("Ending appointment:", appointmentId);
    alert("Appointment ended successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-2">
          View and manage your medical appointments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              All Appointments
            </h2>
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => handleAppointmentClick(appointment)}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg"
                >
                  <AppointmentCard appointment={appointment} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Appointment Details
            </h2>

            {selectedAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedAppointment.date} at {selectedAppointment.time}
                  </span>
                </div>

                <div className="flex items-center">
                  <User className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedAppointment.doctorName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedAppointment.doctorDetails.specialization}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedAppointment.doctorDetails.location}
                  </span>
                </div>

                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedAppointment.doctorDetails.phone}
                  </span>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedAppointment.doctorDetails.email}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.notes}
                  </p>
                </div>

                {selectedAppointment.status === "Confirmed" && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() =>
                        handleEndAppointment(selectedAppointment.id)
                      }
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      End Appointment
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select an appointment to view details
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Book New Appointment
                </h3>
                <p className="text-sm text-gray-500">
                  Schedule a visit with your doctor
                </p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Reschedule Appointment
                </h3>
                <p className="text-sm text-gray-500">
                  Change your appointment time
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
