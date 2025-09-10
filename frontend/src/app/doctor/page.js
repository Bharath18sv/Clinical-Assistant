"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bundle, setBundle] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`/doctors/`);
        setPatients(res?.data?.patients || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function openPatient(p) {
    setSelected(p);
    setBundle(null);
    try {
      const res = await apiFetch(`/doctors/patients/${p._id}/details`);
      setBundle(res?.data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function addVitals(pId, payload) {
    await apiFetch(`/doctors/patients/${pId}/vitals`, {
      method: "POST",
      body: payload,
    });
    const res = await apiFetch(`/doctors/patients/${pId}/details`);
    setBundle(res?.data);
  }

  async function addPrescription(pId, medications) {
    await apiFetch(`/doctors/patients/${pId}/prescriptions`, {
      method: "POST",
      body: { medications },
    });
    const res = await apiFetch(`/doctors/patients/${pId}/details`);
    setBundle(res?.data);
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error)
    return <div style={{ padding: 24, color: "#b00020" }}>{error}</div>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: 16,
        padding: 16,
      }}
    >
      <div>
        <h2>Patients</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {patients.map((p) => (
            <button
              key={p._id}
              onClick={() => openPatient(p)}
              style={{ textAlign: "left" }}
            >
              {p.fullname} — {p.age}
            </button>
          ))}
        </div>
      </div>
      <div>
        {!selected ? (
          <div>Select a patient</div>
        ) : !bundle ? (
          <div>Loading patient...</div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <h2>{selected.fullname}</h2>
              <div style={{ color: "#666" }}>
                {selected.gender}, {selected.age} • {selected.phone}
              </div>
            </div>
            <section>
              <h3>Quick Vitals</h3>
              <VitalsForm onSubmit={(v) => addVitals(selected._id, v)} />
              <ul>
                {(bundle.vitals || []).slice(0, 5).map((v) => (
                  <li key={v._id}>
                    BP {v?.bloodPressure?.systolic}/
                    {v?.bloodPressure?.diastolic} • Sugar {v?.sugar}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Prescriptions</h3>
              <PrescriptionForm
                onSubmit={(m) => addPrescription(selected._id, m)}
              />
              <ul>
                {(bundle.prescriptions || []).slice(0, 5).map((pr) => (
                  <li key={pr._id}>
                    {new Date(pr.date).toLocaleDateString()} —{" "}
                    {pr.medications.map((m) => m.name).join(", ")}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>ADR Alerts</h3>
              {(bundle.adrAlerts || []).length === 0 ? (
                <div>None</div>
              ) : (
                <ul>
                  {bundle.adrAlerts.map((a, idx) => (
                    <li key={idx} style={{ color: "#b00020" }}>
                      {a.message}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function VitalsForm({ onSubmit }) {
  const [sys, setSys] = useState(120);
  const [dia, setDia] = useState(80);
  const [sugar, setSugar] = useState(95);
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        bloodPressure: { systolic: Number(sys), diastolic: Number(dia) },
        sugar: Number(sugar),
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", gap: 8, alignItems: "center" }}
    >
      <input
        type="number"
        value={sys}
        onChange={(e) => setSys(e.target.value)}
        style={{ width: 80 }}
      />
      <span>/</span>
      <input
        type="number"
        value={dia}
        onChange={(e) => setDia(e.target.value)}
        style={{ width: 80 }}
      />
      <input
        type="number"
        value={sugar}
        onChange={(e) => setSugar(e.target.value)}
        style={{ width: 100 }}
      />
      <button disabled={loading}>{loading ? "Saving..." : "Add"}</button>
    </form>
  );
}

function PrescriptionForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("500mg");
  const [frequency, setFrequency] = useState("2 times/day");
  const [duration, setDuration] = useState("5 days");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit([
        {
          name,
          dosage,
          frequency,
          duration,
          notes,
          schedule: [{ timeOfDay: "morning" }],
        },
      ]);
      setName("");
      setNotes("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "grid",
        gap: 8,
        gridTemplateColumns: "1fr 100px 140px 120px 1fr auto",
      }}
    >
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        placeholder="Dosage"
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
      />
      <input
        placeholder="Frequency"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
      />
      <input
        placeholder="Duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <input
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button disabled={loading}>{loading ? "Saving..." : "Add"}</button>
    </form>
  );
}
