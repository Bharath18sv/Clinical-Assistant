"use client";

import { useState, useEffect } from "react";
import API from "@/utils/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";
import {
  FileText,
  Download,
  Users,
  UserCheck,
  Calendar,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [selectedReport, setSelectedReport] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/dashboard/stats");
      if (response.data?.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleExportReport = async (reportType) => {
    setExporting(true);
    try {
      let data = [];
      let filename = "";

      switch (reportType) {
        case "doctors":
          const doctorsRes = await API.get("/admin/doctors");
          data = doctorsRes.data?.data?.map((doc) => ({
            Name: doc.fullname,
            Email: doc.email,
            Specialization: doc.specialization,
            Status: doc.status,
            Experience: doc.experience,
            "Created At": new Date(doc.createdAt).toLocaleDateString(),
          })) || [];
          filename = "doctors_report";
          break;

        case "patients":
          const patientsRes = await API.get("/admin/patients?limit=1000");
          data = patientsRes.data?.data?.patients?.map((pat) => ({
            Name: pat.fullname,
            Email: pat.email,
            Age: pat.age,
            Gender: pat.gender,
            Phone: pat.phone,
            "Created At": new Date(pat.createdAt).toLocaleDateString(),
          })) || [];
          filename = "patients_report";
          break;

        case "appointments":
          const apptRes = await API.get("/admin/appointments?limit=1000");
          data = apptRes.data?.data?.docs?.map((apt) => ({
            "Patient Name": apt.patientId?.fullname || "N/A",
            "Doctor Name": apt.doctorId?.fullname || "N/A",
            Status: apt.status,
            Reason: apt.reason || "N/A",
            "Scheduled At": new Date(apt.scheduledAt).toLocaleString(),
          })) || [];
          filename = "appointments_report";
          break;

        case "system-overview":
          data = [
            {
              Metric: "Total Doctors",
              Value: stats?.totalDoctors || 0,
            },
            {
              Metric: "Approved Doctors",
              Value: stats?.approvedDoctors || 0,
            },
            {
              Metric: "Pending Doctors",
              Value: stats?.pendingDoctors || 0,
            },
            {
              Metric: "Total Patients",
              Value: stats?.totalPatients || 0,
            },
            {
              Metric: "Total Admins",
              Value: stats?.totalAdmins || 0,
            },
          ];
          filename = "system_overview";
          break;

        default:
          throw new Error("Invalid report type");
      }

      if (data.length === 0) {
        handleApiError(null, "No data available for export");
        return;
      }

      exportToCSV(data, filename);
      handleApiSuccess(`${filename.replace(/_/g, " ")} exported successfully!`);
    } catch (error) {
      handleApiError(error, "Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const reportTypes = [
    {
      id: "system-overview",
      name: "System Overview Report",
      description: "Export comprehensive system statistics and metrics",
      icon: BarChart3,
      color: "blue",
    },
    {
      id: "doctors",
      name: "Doctors Report",
      description: "Export complete list of all doctors with details",
      icon: UserCheck,
      color: "green",
    },
    {
      id: "patients",
      name: "Patients Report",
      description: "Export complete list of all patients with details",
      icon: Users,
      color: "purple",
    },
    {
      id: "appointments",
      name: "Appointments Report",
      description: "Export all appointments with status and details",
      icon: Calendar,
      color: "orange",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">
            Generate and export comprehensive reports for administrative purposes
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Doctors</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalDoctors || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-green-600 font-medium">
                {stats?.approvedDoctors || 0} approved
              </span>
              <span className="text-gray-500"> • </span>
              <span className="text-orange-600 font-medium">
                {stats?.pendingDoctors || 0} pending
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalPatients || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Registered patients in the system
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalAdmins || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Active administrators
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-3xl font-bold text-green-600">Good</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              All systems operational
            </div>
          </div>
        </div>

        {/* Export Reports Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Available Reports
            </h2>
            <p className="text-gray-600">
              Select a report type to export data in CSV format
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${
                    selectedReport === report.id
                      ? `border-${report.color}-500 bg-${report.color}-50`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-${report.color}-100 rounded-lg`}>
                      <Icon size={24} className={`text-${report.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {report.name}
                      </h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      {selectedReport === report.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportReport(report.id);
                          }}
                          disabled={exporting}
                          className={`mt-4 flex items-center gap-2 px-4 py-2 bg-${report.color}-600 text-white rounded-lg hover:bg-${report.color}-700 transition-colors disabled:opacity-50`}
                        >
                          <Download size={18} />
                          {exporting ? "Exporting..." : "Export as CSV"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Doctors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Doctors
            </h3>
            {stats?.recentDoctors && stats.recentDoctors.length > 0 ? (
              <div className="space-y-3">
                {stats.recentDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{doctor.fullname}</p>
                      <p className="text-sm text-gray-600">{doctor.email}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doctor.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : doctor.status === "pending"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {doctor.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent doctors</p>
            )}
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Patients
            </h3>
            {stats?.recentPatients && stats.recentPatients.length > 0 ? (
              <div className="space-y-3">
                {stats.recentPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{patient.fullname}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent patients</p>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FileText size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                How to Generate Reports
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Select the type of report you want to generate</li>
                <li>Click the "Export as CSV" button</li>
                <li>The report will be downloaded to your device automatically</li>
                <li>Open the CSV file in Excel, Google Sheets, or any spreadsheet application</li>
              </ol>
              <p className="mt-3 text-sm text-blue-700">
                <strong>Note:</strong> Large reports may take a few moments to generate.
                All data is current as of the time of export.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
