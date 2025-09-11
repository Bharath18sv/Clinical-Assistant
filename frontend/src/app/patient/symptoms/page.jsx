"use client";

import { useState } from "react";
import { Activity, Plus, Calendar, Clock, AlertCircle } from "lucide-react";

export default function PatientSymptoms() {
  const [symptoms, setSymptoms] = useState([
    {
      id: 1,
      name: "Headache",
      severity: "Moderate",
      duration: "2 hours",
      date: "Dec 12, 2024",
      time: "10:30 AM",
      notes: "Started after breakfast, feels like pressure in temples",
      status: "Active",
    },
    {
      id: 2,
      name: "Fatigue",
      severity: "Mild",
      duration: "1 day",
      date: "Dec 11, 2024",
      time: "8:00 PM",
      notes: "Feeling tired throughout the day, difficulty concentrating",
      status: "Resolved",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymptom, setNewSymptom] = useState({
    name: "",
    severity: "Mild",
    duration: "",
    notes: "",
  });

  const severityColors = {
    Mild: "bg-green-100 text-green-800",
    Moderate: "bg-yellow-100 text-yellow-800",
    Severe: "bg-red-100 text-red-800",
  };

  const handleAddSymptom = (e) => {
    e.preventDefault();
    const symptom = {
      id: symptoms.length + 1,
      ...newSymptom,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Active",
    };
    setSymptoms([symptom, ...symptoms]);
    setNewSymptom({ name: "", severity: "Mild", duration: "", notes: "" });
    setShowAddForm(false);
    alert("Symptom logged successfully!");
  };

  const handleMarkResolved = (symptomId) => {
    setSymptoms(
      symptoms.map((symptom) =>
        symptom.id === symptomId ? { ...symptom, status: "Resolved" } : symptom
      )
    );
    alert("Symptom marked as resolved!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Symptom Tracker</h1>
          <p className="text-gray-600 mt-2">Log and track your symptoms</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Symptom
        </button>
      </div>

      {/* Add Symptom Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Log New Symptom
          </h2>
          <form onSubmit={handleAddSymptom} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptom Name
                </label>
                <input
                  type="text"
                  value={newSymptom.name}
                  onChange={(e) =>
                    setNewSymptom({ ...newSymptom, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Headache, Fever, Nausea"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={newSymptom.severity}
                  onChange={(e) =>
                    setNewSymptom({ ...newSymptom, severity: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={newSymptom.duration}
                onChange={(e) =>
                  setNewSymptom({ ...newSymptom, duration: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2 hours, 1 day, 30 minutes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={newSymptom.notes}
                onChange={(e) =>
                  setNewSymptom({ ...newSymptom, notes: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe the symptom in detail..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log Symptom
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Symptoms List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Symptoms
        </h2>
        <div className="space-y-4">
          {symptoms.map((symptom) => (
            <div
              key={symptom.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="p-2 bg-orange-100 rounded-lg mr-4">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-medium text-gray-900 mr-3">
                        {symptom.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          severityColors[symptom.severity]
                        }`}
                      >
                        {symptom.severity}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="mr-4">{symptom.duration}</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {symptom.date} at {symptom.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {symptom.notes}
                    </p>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          symptom.status === "Active"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {symptom.status === "Active" ? (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          "Resolved"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {symptom.status === "Active" && (
                  <button
                    onClick={() => handleMarkResolved(symptom.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
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
          <button
            onClick={() => setShowAddForm(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Log New Symptom</h3>
                <p className="text-sm text-gray-500">
                  Record how you're feeling
                </p>
              </div>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View Trends</h3>
                <p className="text-sm text-gray-500">
                  Analyze symptom patterns
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
