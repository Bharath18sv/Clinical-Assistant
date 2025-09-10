"use client";
import Image from "next/image";
import {
  User,
  Doctor,
  Patient,
  Admin,
  isDoctor,
  isPatient,
  isAdmin,
} from "@/utils/types";

// Status badge component
const StatusBadge = ({ status, isActive }) => {
  if (status) {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  }

  if (isActive !== undefined) {
    return (
      <span
        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? "ACTIVE" : "INACTIVE"}
      </span>
    );
  }

  return null;
};

// Doctor-specific sections
const DoctorInfo = ({ doctor }) => (
  <>
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        🩺 Professional Information
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Specializations
          </p>
          <div className="flex flex-wrap gap-2">
            {doctor.specialization.map((spec, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Qualifications
          </p>
          <div className="flex flex-wrap gap-2">
            {doctor.qualifications.map((qual, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md"
              >
                {qual}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <span className="text-sm font-medium text-gray-700">
            Experience:{" "}
          </span>
          <span className="text-sm text-gray-600">
            {doctor.experience} years
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">
            Total Patients:{" "}
          </span>
          <span className="text-sm text-gray-600">
            {doctor.patients.length}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">
            Availability:{" "}
          </span>
          <span
            className={`text-sm ${
              doctor.isAvailable ? "text-green-600" : "text-red-600"
            }`}
          >
            {doctor.isAvailable ? "Available" : "Not Available"}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Phone: </span>
          <span className="text-sm text-gray-600">{doctor.phone || "N/A"}</span>
        </div>
      </div>
    </div>

    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        📋 About
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">{doctor.about}</p>
    </div>

    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        ✅ Approval Status
      </h3>
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-700">Status: </span>
          <StatusBadge status={doctor.status} />
        </div>
        {doctor.isApproved && doctor.approvedAt && (
          <div>
            <span className="text-sm font-medium text-gray-700">
              Approved At:{" "}
            </span>
            <span className="text-sm text-gray-600">
              {new Date(doctor.approvedAt).toLocaleDateString()}
            </span>
          </div>
        )}
        {doctor.rejectionReason && (
          <div>
            <span className="text-sm font-medium text-gray-700">
              Rejection Reason:{" "}
            </span>
            <span className="text-sm text-red-600">
              {doctor.rejectionReason}
            </span>
          </div>
        )}
      </div>
    </div>
  </>
);

// Patient-specific sections
const PatientInfo = ({ patient }) => (
  <>
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        👤 Personal Details
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <span className="text-sm font-medium text-gray-700">Age: </span>
          <span className="text-sm text-gray-600">{patient.age} years</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Gender: </span>
          <span className="text-sm text-gray-600">{patient.gender}</span>
        </div>
        <div className="md:col-span-2">
          <span className="text-sm font-medium text-gray-700">Phone: </span>
          <span className="text-sm text-gray-600">{patient.phone}</span>
        </div>
      </div>
    </div>

    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        🏠 Address
      </h3>
      <div className="text-sm text-gray-600">
        {patient.address.street && <div>{patient.address.street}</div>}
        <div>
          {[patient.address.city, patient.address.state, patient.address.zip]
            .filter(Boolean)
            .join(", ")}
        </div>
        {patient.address.country && <div>{patient.address.country}</div>}
      </div>
    </div>

    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        🏥 Medical Information
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Chronic Conditions
          </p>
          {patient.chronicConditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.chronicConditions.map((condition, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md"
                >
                  {condition}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500">None reported</span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Allergies</p>
          {patient.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md"
                >
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500">None reported</span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Current Symptoms
          </p>
          {patient.symptoms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md"
                >
                  {symptom}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500">None reported</span>
          )}
        </div>
      </div>
    </div>
  </>
);

// Admin-specific sections
const AdminInfo = ({ admin }) => (
  <>
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        🛡️ Admin Details
      </h3>
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-700">Role: </span>
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              admin.role === "super_admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {admin.role.replace("_", " ").toUpperCase()}
          </span>
        </div>
        {admin.lastLogin && (
          <div>
            <span className="text-sm font-medium text-gray-700">
              Last Login:{" "}
            </span>
            <span className="text-sm text-gray-600">
              {new Date(admin.lastLogin).toLocaleString()}
            </span>
          </div>
        )}
        <div>
          <span className="text-sm font-medium text-gray-700">
            Account Status:{" "}
          </span>
          <StatusBadge isActive={admin.isActive} />
        </div>
      </div>
    </div>

    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        🔐 Permissions
      </h3>
      <div className="grid gap-2 md:grid-cols-2">
        {Object.entries(admin.permissions).map(
          ([permission, hasPermission]) => (
            <div
              key={permission}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <span className="text-sm text-gray-700 capitalize">
                {permission.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span
                className={`text-sm font-medium ${
                  hasPermission ? "text-green-600" : "text-red-600"
                }`}
              >
                {hasPermission ? "✅ Yes" : "❌ No"}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  </>
);

// Main ProfilePage component
export default function ProfilePage({ user }) {
  const getRoleDisplay = () => {
    if (isAdmin(user)) {
      return user.role.replace("_", " ").toUpperCase();
    }
    return user.role.toUpperCase();
  };

  const getRoleBadgeColor = () => {
    if (isDoctor(user)) return "bg-blue-100 text-blue-700";
    if (isPatient(user)) return "bg-green-100 text-green-700";
    if (isAdmin(user))
      return user.role === "super_admin"
        ? "bg-purple-100 text-purple-700"
        : "bg-indigo-100 text-indigo-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 relative rounded-full overflow-hidden shadow-md flex-shrink-0">
            <Image
              src={user.profilePic || "/default-avatar.png"}
              alt={user.fullname}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-800">
                {user.fullname}
              </h1>
              <span
                className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${getRoleBadgeColor()}`}
              >
                {getRoleDisplay()}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              {isDoctor(user) && <StatusBadge status={user.status} />}
              {isAdmin(user) && <StatusBadge isActive={user.isActive} />}
              {isDoctor(user) && (
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    user.isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500 flex-shrink-0">
            <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
            <div>Updated: {new Date(user.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Role-specific Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isDoctor(user) && <DoctorInfo doctor={user} />}
        {isPatient(user) && <PatientInfo patient={user} />}
        {isAdmin(user) && <AdminInfo admin={user} />}
      </div>
    </div>
  );
}
