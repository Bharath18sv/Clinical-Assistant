"use client";

import { useState } from "react";
import {
  Pill,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Calendar,
} from "lucide-react";
import MedicationCard from "@/components/MedicationCard";

export default function PatientPrescriptions() {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      startDate: "Nov 1, 2024",
      doctorName: "Dr. Sarah Smith",
      status: "Active",
      nextDose: "Today at 8:00 AM",
      lastTaken: "Yesterday at 8:00 PM",
      totalDoses: 30,
      takenDoses: 28,
      missedDoses: 2,
    },
    {
      id: 2,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "Oct 15, 2024",
      doctorName: "Dr. John Wilson",
      status: "Active",
      nextDose: "Today at 7:00 AM",
      lastTaken: "Yesterday at 7:00 AM",
      totalDoses: 45,
      takenDoses: 44,
      missedDoses: 1,
    },
    {
      id: 3,
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Once daily",
      startDate: "Nov 10, 2024",
      doctorName: "Dr. Emily Davis",
      status: "Active",
      nextDose: "Today at 9:00 AM",
      lastTaken: "Yesterday at 9:00 AM",
      totalDoses: 20,
      takenDoses: 20,
      missedDoses: 0,
    },
  ]);

  const handleMarkTaken = (medicationId) => {
    setMedications(
      medications.map((med) =>
        med.id === medicationId
          ? { ...med, takenDoses: med.takenDoses + 1, lastTaken: "Just now" }
          : med
      )
    );
    alert("Medication marked as taken!");
  };

  const handleMarkMissed = (medicationId) => {
    setMedications(
      medications.map((med) =>
        med.id === medicationId
          ? { ...med, missedDoses: med.missedDoses + 1 }
          : med
      )
    );
    alert("Medication marked as missed!");
  };

  const getAdherenceRate = (medication) => {
    return Math.round((medication.takenDoses / medication.totalDoses) * 100);
  };

  const getAdherenceColor = (rate) => {
    if (rate >= 90) return "text-green-600 bg-green-100";
    if (rate >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-600 mt-2">
          Manage your medications and track adherence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medications List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Medications
            </h2>
            <div className="space-y-3">
              {medications.map((medication) => (
                <div
                  key={medication.id}
                  onClick={() => setSelectedMedication(medication)}
                  className="cursor-pointer hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-4">
                        <Pill className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {medication.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        <p className="text-xs text-gray-400">
                          Started: {medication.startDate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAdherenceColor(
                          getAdherenceRate(medication)
                        )}`}
                      >
                        {getAdherenceRate(medication)}% adherence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medication Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Medication Details
            </h2>

            {selectedMedication ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Pill className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedMedication.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedMedication.dosage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedMedication.frequency}
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    Started: {selectedMedication.startDate}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Adherence Statistics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Doses:</span>
                      <span className="font-medium">
                        {selectedMedication.totalDoses}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taken:</span>
                      <span className="font-medium text-green-600">
                        {selectedMedication.takenDoses}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Missed:</span>
                      <span className="font-medium text-red-600">
                        {selectedMedication.missedDoses}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adherence Rate:</span>
                      <span
                        className={`font-medium ${getAdherenceColor(
                          getAdherenceRate(selectedMedication)
                        )}`}
                      >
                        {getAdherenceRate(selectedMedication)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Next Dose</h3>
                  <p className="text-sm text-gray-600">
                    {selectedMedication.nextDose}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last taken: {selectedMedication.lastTaken}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleMarkTaken(selectedMedication.id)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Taken
                    </button>
                    <button
                      onClick={() => handleMarkMissed(selectedMedication.id)}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark as Missed
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a medication to view details
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Medication Reminders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Medication Reminders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medications.map((medication) => (
            <div
              key={medication.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center mb-2">
                <Bell className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-gray-900">{medication.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {medication.nextDose}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleMarkTaken(medication.id)}
                  className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Taken
                </button>
                <button
                  onClick={() => handleMarkMissed(medication.id)}
                  className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Missed
                </button>
              </div>
            </div>
          ))}
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
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Set Reminders</h3>
                <p className="text-sm text-gray-500">
                  Configure medication alerts
                </p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Refill Request</h3>
                <p className="text-sm text-gray-500">
                  Request prescription refills
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
