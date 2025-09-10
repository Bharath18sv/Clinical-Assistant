"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function PatientHome() {
  const [symptoms, setSymptoms] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [status, setStatus] = useState("taken");
  const [prescriptionId, setPrescriptionId] = useState("");
  const [logs, setLogs] = useState({ symptomLogs: [], medicationLogs: [] });
  const [error, setError] = useState("");

  async function loadLogs() {
    try {
      const res = await apiFetch(`/patients/logs`);
      setLogs(res?.data || { symptomLogs: [], medicationLogs: [] });
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function submitSymptoms(e) {
    e.preventDefault();
    try {
      const arr = symptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await apiFetch(`/patients/logs/symptoms`, {
        method: "POST",
        body: { symptoms: arr },
      });
      setSymptoms("");
      await loadLogs();
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitMedication(e) {
    e.preventDefault();
    try {
      await apiFetch(`/patients/logs/medications`, {
        method: "POST",
        body: { prescriptionId, medicationName, timeOfDay, status },
      });
      setMedicationName("");
      setPrescriptionId("");
      await loadLogs();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, padding: 16 }}>
      <h2>My Daily Logs</h2>
      {error ? <div style={{ color: "#b00020" }}>{error}</div> : null}

      <section>
        <h3>Symptoms</h3>
        <form onSubmit={submitSymptoms} style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="comma-separated (e.g., headache, nausea)"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            style={{ flex: 1 }}
          />
          <button>Log Symptoms</button>
        </form>
        <ul>
          {(logs.symptomLogs || []).slice(0, 10).map((l) => (
            <li key={l._id}>
              {new Date(l.date).toLocaleString()} — {l.symptoms.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Medication</h3>
        <form
          onSubmit={submitMedication}
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "1fr 1fr 160px 140px auto",
          }}
        >
          <input
            placeholder="Prescription ID"
            value={prescriptionId}
            onChange={(e) => setPrescriptionId(e.target.value)}
            required
          />
          <input
            placeholder="Medication name"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            required
          />
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="taken">Taken</option>
            <option value="missed">Missed</option>
          </select>
          <button>Log Medication</button>
        </form>
        <ul>
          {(logs.medicationLogs || []).slice(0, 10).map((l) => (
            <li key={l._id}>
              {new Date(l.createdAt).toLocaleString()} — {l.medicationName} (
              {l.timeOfDay}) {l.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
