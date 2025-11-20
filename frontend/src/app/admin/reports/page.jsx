"use client";

import React, { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AdminReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState("");

  const reportTypes = [
    {
      id: "adr-alerts",
      name: "ADR Alerts Report",
      description:
        "Export all Adverse Drug Reaction alerts across the platform",
    },
    {
      id: "medication-logs",
      name: "Patient Medication Logs",
      description: "Export comprehensive medication logs for all patients",
    },
    {
      id: "doctor-performance",
      name: "Doctor Performance Report",
      description:
        "Export doctor performance metrics including patient count and activity",
    },
  ];

  const handleExport = async (format) => {
    setLoading(true);
    try {
      // In a real implementation, this would call the backend API to generate and download the report
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message
      alert(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>
        <p className="text-gray-600">
          Generate and export comprehensive reports for administrative purposes
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Available Reports
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Select a report type and export format to generate your report
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className={`border rounded-lg p-4 ${
                  selectedReport === report.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={report.id}
                      name="report-type"
                      type="radio"
                      checked={selectedReport === report.id}
                      onChange={() => setSelectedReport(report.id)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor={report.id}
                      className="font-medium text-gray-700 cursor-pointer"
                    >
                      {report.name}
                    </label>
                    <p className="text-gray-500">{report.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {selectedReport && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Export Options
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleExport("pdf")}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Exporting...</span>
                      </>
                    ) : (
                      "Export as PDF"
                    )}
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Exporting...</span>
                      </>
                    ) : (
                      "Export as CSV"
                    )}
                  </button>
                </div>
              </div>
            )}

            {!selectedReport && (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No report selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a report type from above to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Report Generation Guide
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="prose max-w-none">
            <h4 className="text-md font-medium text-gray-900">
              How to generate reports:
            </h4>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
              <li>
                Select the type of report you want to generate from the options
                above
              </li>
              <li>Choose your preferred export format (PDF or CSV)</li>
              <li>
                Click the export button to generate and download your report
              </li>
              <li>
                Reports will be generated in the background and downloaded
                automatically
              </li>
            </ol>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Large reports may take a few moments to
                generate. Please be patient and do not close the browser window
                during export.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
