"use client";

import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import {
  Heart,
  Calendar,
  Pill,
  Activity,
  Thermometer,
  Droplets,
  Scale,
} from "lucide-react";
import HealthCard from "@/components/HealthCard";
import AppointmentCard from "@/components/AppointmentCard";
import MedicationList from "@/components/MedicationList";
import PendingMedicationLogs from "@/components/PendingMedicationLogs";
import {
  fetchMyAppointments,
  getPatientPrescriptions,
  getLatestVitals,
} from "@/utils/api";
import API from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";
import { downloadMyPatientReportPdf } from "@/utils/api";

export default function PatientDashboard() {
  const { user, authLoading } = useContext(AuthContext);
  console.log("user : ", user);
  const patientId = user?.data?.user?._id;
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStats, setHealthStats] = useState({
    sugar: "",
    bloodPressure: {
      systolic: "",
      diastolic: "",
    },
    heartRate: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
  });

  const fetchVitals = async () => {
    if (!patientId) {
      console.log("No patientId, skipping vitals fetch");
      return;
    }
    try {
      const vitals = await getLatestVitals(patientId);
      console.log("Fetched vitals:", vitals);
      setHealthStats(vitals.data || {});
    } catch (error) {
      console.error("Error fetching vitals:", error);
      setHealthStats({});
    }
  };

  const fetchPatientPrescriptions = async () => {
    if (!patientId) {
      console.log("No patientId, skipping prescriptions fetch");
      return;
    }
    try {
      const res = await getPatientPrescriptions(patientId);
      setPrescriptions(res.data || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setPrescriptions([]);
    }
  };

  const loadAppointments = async () => {
    try {
      const appts = await fetchMyAppointments();
      console.log("appts : ", appts);
      setAppointments(appts || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await API.delete(`/appointments/${appointmentId}`);
      // Refresh appointments list
      await loadAppointments();
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && user) {
        setLoading(true);
        try {
          await Promise.all([
            loadAppointments(),
            fetchPatientPrescriptions(),
            fetchVitals(),
          ]);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !user) {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user]);

  // Convert vitals object to health stats array for display
  const getHealthStatsArray = () => {
    const stats = [];

    // Blood Pressure
    if (
      healthStats?.bloodPressure?.systolic &&
      healthStats?.bloodPressure?.diastolic
    ) {
      stats.push({
        icon: Activity,
        title: "Blood Pressure",
        value: `${healthStats.bloodPressure.systolic}/${healthStats.bloodPressure.diastolic}`,
        color: "blue",
        subtitle: "mmHg",
      });
    }

    // Heart Rate
    if (healthStats?.heartRate) {
      stats.push({
        icon: Heart,
        title: "Heart Rate",
        value: `${healthStats.heartRate}`,
        color: "red",
        subtitle: "BPM",
      });
    }

    // Temperature
    if (healthStats?.temperature) {
      stats.push({
        icon: Thermometer,
        title: "Temperature",
        value: `${healthStats.temperature}°F`,
        color: "orange",
        subtitle: "Body temp",
      });
    }

    // Oxygen Saturation
    if (healthStats?.oxygenSaturation) {
      stats.push({
        icon: Droplets,
        title: "Oxygen Saturation",
        value: `${healthStats.oxygenSaturation}%`,
        color: "blue",
        subtitle: "SpO2",
      });
    }

    // Respiratory Rate
    if (healthStats?.respiratoryRate) {
      stats.push({
        icon: Activity,
        title: "Respiratory Rate",
        value: `${healthStats.respiratoryRate}`,
        color: "green",
        subtitle: "breaths/min",
      });
    }

    // Weight
    if (healthStats?.weight) {
      stats.push({
        icon: Scale,
        title: "Weight",
        value: `${healthStats.weight}`,
        color: "purple",
        subtitle: "kg",
      });
    }

    // Active Medications Count
    if (prescriptions?.length > 0) {
      stats.push({
        icon: Pill,
        title: "Active Medications",
        value: prescriptions.length.toString(),
        color: "purple",
        subtitle: "Prescriptions",
      });
    }

    // Next Appointment
    if (appointments?.length > 0) {
      const nextAppt = appointments.find(
        (a) => a.status !== "cancelled" && a.status !== "completed"
      );
      if (nextAppt) {
        stats.push({
          icon: Calendar,
          title: "Next Appointment",
          value: new Date(nextAppt.scheduledAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          color: "green",
          subtitle: nextAppt.doctorId?.fullname || "Doctor",
        });
      }
    }

    return stats;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const healthStatsArray = getHealthStatsArray();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.data?.user?.fullname || "Patient"}! Here's your
          health overview.
        </p>
      </div>

      {/* Health Stats Cards */}
      {healthStatsArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthStatsArray.map((stat, index) => (
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Health Data Yet
          </h3>
          <p className="text-gray-600">
            Your vital signs will appear here once recorded.
          </p>
        </div>
      )}

      {/* Pending Medication Logs */}
      <PendingMedicationLogs />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Your Appointments</h2>
          </div>
          <div className="space-y-3">
            {appointments && appointments.length > 0 ? (
              appointments.slice(0, 3).map((a) => (
                <AppointmentCard
                  key={a._id}
                  appointment={{
                    id: a._id,
                    userDetails: a?.doctorId,
                    reason: a.reason,
                    time: a.scheduledAt,
                    status: a.status,
                  }}
                  onCancel={handleCancelAppointment}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  No appointments scheduled
                </p>
              </div>
            )}
          </div>
          {appointments && appointments.length > 3 && (
            <Link href="/patient/appointment" className="block w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium text-center">
              View All Appointments
            </Link>
          )}
        </div>

        {/* Current Medications */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Current Medications</h2>
          </div>
          <div className="space-y-3">
            {prescriptions && prescriptions.length > 0 ? (
              prescriptions
                .slice(0, 3)
                .map((medication) => (
                  <MedicationList
                    key={medication._id}
                    prescription={medication}
                  />
                ))
            ) : (
              <div className="text-center py-8">
                <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No active medications</p>
              </div>
            )}
          </div>
          {prescriptions && prescriptions.length > 3 && (
            <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Manage Medications
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/patient/doctor/all">
            <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <div className="flex items-center">
                <div className="icon-container icon-blue mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Book Appointment
                  </h3>
                  <p className="text-sm text-gray-500">Schedule a new visit</p>
                </div>
              </div>
            </button>
          </Link>

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

          <button
            onClick={() => downloadMyPatientReportPdf()}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center">
              <div className="icon-container icon-blue mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Download My Report
                </h3>
                <p className="text-sm text-gray-500">PDF of your health data</p>
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
