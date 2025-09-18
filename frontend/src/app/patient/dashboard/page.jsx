"use client";

import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { Heart, Calendar, Pill, Activity } from "lucide-react";
import HealthCard from "@/components/HealthCard";
import AppointmentCard from "@/components/AppointmentCard";
import MedicationCard from "@/components/MedicationCard";
import API, { fetchMyAppointments } from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";

export default function PatientDashboard() {
  const { user, authLoading } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!authLoading && user) {
      laodAppointments();
    }
  }, [authLoading, user]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Mock data - in a real app, this would come from API calls
  const healthStats = [
    {
      icon: Heart,
      title: "Heart Rate",
      value: "72 BPM",
      color: "red",
      subtitle: "Normal range",
    },
    {
      icon: Activity,
      title: "Blood Pressure",
      value: "120/80",
      color: "blue",
      subtitle: "Optimal",
    },
    {
      icon: Calendar,
      title: "Next Appointment",
      value: "Dec 15",
      color: "green",
      subtitle: "Dr. Smith",
    },
    {
      icon: Pill,
      title: "Active Medications",
      value: "3",
      color: "purple",
      subtitle: "All on track",
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      doctorName: "Dr. Sarah Smith",
      type: "General Checkup",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      doctorName: "Dr. John Wilson",
      type: "Follow-up",
      date: "Dec 20, 2024",
      time: "2:30 PM",
      status: "Upcoming",
    },
  ];

  const currentMedications = [
    {
      id: 1,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      startDate: "Nov 1, 2024",
    },
    {
      id: 2,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "Oct 15, 2024",
    },
    {
      id: 3,
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Once daily",
      startDate: "Nov 10, 2024",
    },
  ];

  const laodAppointments = async () => {
    const appts = await fetchMyAppointments();
    console.log("appts : ", appts);
    setAppointments(appts);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your health overview.
        </p>
      </div>

      {/* Health Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthStats.map((stat, index) => (
          <HealthCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Your Appointments</h2>
          </div>
          <div className="space-y-3">
            {appointments
              ? appointments.map((a) => (
                  <AppointmentCard
                    key={a._id}
                    appointment={{
                      id: a._id,
                      userDetails: a?.doctorId,
                      reason: a.reason || "Consultation",
                      time: a.scheduledAt,
                      status: a.status,
                    }}
                  />
                ))
              : "Loading..."}
          </div>
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Appointments
          </button>
        </div>

        {/* Current Medications */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Current Medications</h2>
          </div>
          <div className="space-y-3">
            {currentMedications.map((medication) => (
              <MedicationCard key={medication.id} medication={medication} />
            ))}
          </div>
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            Manage Medications
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <div className="flex items-center">
              <div className="icon-container icon-blue mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <Link href={`/patient/doctor/all`}>
                  <h3 className="font-medium text-gray-900">
                    Book Appointment
                  </h3>
                  <p className="text-sm text-gray-500">Schedule a new visit</p>
                </Link>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <div className="flex items-center">
              <div className="icon-container icon-green mr-3">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Log Symptoms</h3>
                <p className="text-sm text-gray-500">
                  Record how you're feeling
                </p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <div className="flex items-center">
              <div className="icon-container icon-purple mr-3">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Medication Reminder
                </h3>
                <p className="text-sm text-gray-500">Set up alerts</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
