"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  AlertTriangle, 
  Pill, 
  Stethoscope, 
  Heart, 
  Thermometer, 
  Activity, 
  Plus,
  Save,
  Clock,
  FileText,
  CalendarPlus,
  ArrowLeft,
  Eye,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useContext(AuthContext);
  const patientId = params?.id;

  // Patient data state
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: '',
    respiratoryRate: ''
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock patient data
        setPatient({
          _id: patientId,
          fullname: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          phone: "+1 (555) 123-4567",
          age: 32,
          gender: "Female",
          chronicConditions: ["Diabetes Type 2", "Hypertension"],
          allergies: ["Penicillin", "Shellfish"],
          symptoms: ["Fatigue", "Frequent headaches", "Joint pain"],
          vitals: [
            { date: "2024-12-15", bloodPressure: "140/90", heartRate: 78, temperature: 98.6, weight: 150 },
            { date: "2024-12-10", bloodPressure: "135/85", heartRate: 82, temperature: 98.4, weight: 152 },
            { date: "2024-12-05", bloodPressure: "142/88", heartRate: 80, temperature: 99.1, weight: 151 }
          ],
          prescriptions: [
            { id: 1, medication: "Metformin", dosage: "500mg", frequency: "Twice daily", startDate: "2024-12-01", status: "Active" },
            { id: 2, medication: "Lisinopril", dosage: "10mg", frequency: "Once daily", startDate: "2024-11-15", status: "Active" }
          ],
          adrAlerts: [
            { id: 1, type: "Drug Interaction", severity: "High", message: "Metformin may interact with contrast dye - monitor kidney function", date: "2024-12-10" },
            { id: 2, type: "Allergy Alert", severity: "Critical", message: "Patient allergic to Penicillin - avoid beta-lactam antibiotics", date: "2024-11-20" }
          ],
          symptomsLog: [
            { date: "2024-12-16", symptoms: ["Mild headache", "Fatigue"], severity: "Moderate", notes: "Symptoms after skipping breakfast" },
            { date: "2024-12-14", symptoms: ["Joint pain in knees"], severity: "Mild", notes: "After morning exercise" },
            { date: "2024-12-12", symptoms: ["Severe headache", "Nausea"], severity: "High", notes: "Lasted 3 hours, took ibuprofen" }
          ],
          summary: "32-year-old female with well-controlled Type 2 Diabetes and Hypertension. Recent vitals show stable blood pressure on current medication regimen. Patient reports intermittent headaches and joint pain, possibly related to weather changes. Medication adherence is good. Recommend lifestyle modifications and regular monitoring."
        });
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const handleVitalsSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting vitals:", vitalsForm);
    // Add API call here
    alert("Vitals saved successfully!");
    setVitalsForm({
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenSaturation: '',
      respiratoryRate: ''
    });
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting prescription:", prescriptionForm);
    // Add API call here
    alert("Prescription added successfully!");
    setPrescriptionForm({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    console.log("Booking appointment:", appointmentForm);
    // Add API call here
    alert("Appointment booked successfully!");
    setAppointmentForm({
      date: '',
      time: '',
      type: 'consultation',
      notes: ''
    });
  };

  const handleViewAppointments = () => {
    router.push(`/doctor/patients/${patientId}/appointments`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Patient not found</h3>
          <p className="text-gray-500">The requested patient could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{patient.fullname}</h1>
                  <p className="text-sm text-gray-500">Patient ID: {patient._id}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleViewAppointments}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Appointments
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'vitals', name: 'Vitals', icon: Activity },
              { id: 'prescriptions', name: 'Prescriptions', icon: Pill },
              { id: 'appointments', name: 'Book Appointment', icon: CalendarPlus }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Patient Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Patient Summary</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{patient.summary}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    {patient.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    Age {patient.age} • {patient.gender}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                <div className="space-y-4">
                  {patient.chronicConditions?.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Chronic Conditions</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {patient.chronicConditions.map((condition, index) => (
                          <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {patient.allergies?.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <Shield className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Allergies</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ADR Alerts */}
            {patient.adrAlerts?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">ADR Alerts</h3>
                </div>
                <div className="space-y-3">
                  {patient.adrAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'Critical' ? 'bg-red-50 border-red-400' :
                      alert.severity === 'High' ? 'bg-orange-50 border-orange-400' :
                      'bg-yellow-50 border-yellow-400'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-medium ${
                          alert.severity === 'Critical' ? 'text-red-800' :
                          alert.severity === 'High' ? 'text-orange-800' :
                          'text-yellow-800'
                        }`}>
                          {alert.type} - {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">{alert.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Symptoms Log */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Symptoms Log</h3>
              </div>
              <div className="space-y-4">
                {patient.symptomsLog.map((log, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-2">
                        {log.symptoms.map((symptom, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {symptom}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{log.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Severity: <span className={`font-medium ${
                      log.severity === 'High' ? 'text-red-600' :
                      log.severity === 'Moderate' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>{log.severity}</span></p>
                    {log.notes && <p className="text-sm text-gray-700">{log.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-6">
            {/* Add Vitals Form */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Add New Vitals</h3>
              </div>
              <form onSubmit={handleVitalsSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={vitalsForm.bloodPressure}
                    onChange={(e) => setVitalsForm({...vitalsForm, bloodPressure: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={vitalsForm.heartRate}
                    onChange={(e) => setVitalsForm({...vitalsForm, heartRate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={vitalsForm.temperature}
                    onChange={(e) => setVitalsForm({...vitalsForm, temperature: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={vitalsForm.weight}
                    onChange={(e) => setVitalsForm({...vitalsForm, weight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (inches)</label>
                  <input
                    type="number"
                    placeholder="65"
                    value={vitalsForm.height}
                    onChange={(e) => setVitalsForm({...vitalsForm, height: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oxygen Saturation (%)</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={vitalsForm.oxygenSaturation}
                    onChange={(e) => setVitalsForm({...vitalsForm, oxygenSaturation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Vitals
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Vitals */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Vitals History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patient.vitals.map((vital, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.bloodPressure}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.heartRate} bpm</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.temperature}°F</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.weight} lbs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            {/* Add Prescription Form */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Add New Prescription</h3>
              </div>
              <form onSubmit={handlePrescriptionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                  <input
                    type="text"
                    placeholder="e.g., Metformin"
                    value={prescriptionForm.medication}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g., 500mg"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={prescriptionForm.frequency}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Four times daily">Four times daily</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 30 days"
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    placeholder="Special instructions for the patient..."
                    rows="3"
                    value={prescriptionForm.instructions}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Add Prescription
                  </button>
                </div>
              </form>
            </div>

            {/* Current Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Prescriptions</h3>
              <div className="space-y-4">
                {patient.prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{prescription.medication}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prescription.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                      <p><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                      <p><span className="font-medium">Start Date:</span> {prescription.startDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarPlus className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Book New Appointment</h3>
            </div>
            <form onSubmit={handleAppointmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>