import React from "react";
import {
  User,
  Award,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Reusable Doctor Card Component
const DoctorCard = ({
  doctor,
  onViewProfile,
  onBookAppointment,
  onViewAppointment,
  hasAppointment,
  actions,
}) => {
//   const handleBookAppointment = (doctorId, isAvailable, e) => {
//     e.stopPropagation();
//     if (isAvailable) {
//       router.push(`/patient/appointment/${doctorId}`);
//     }
//   };

//   const handleViewAppointment = (doctorId, e) => {
//     e.stopPropagation();
//     router.push(`/patient/appointment`);
//   };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Doctor Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {doctor.profilePic ? (
              <img
                src={doctor.profilePic}
                alt={doctor.fullname}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
              />
            ) : (
              <img
                src="/default-doctor.png"
                alt="Default Doctor"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
              />
            )}
            {doctor.isAvailable && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Dr. {doctor.fullname}
            </h3>

            {/* Specializations */}
            {doctor.specialization?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {doctor.specialization.slice(0, 2).map((spec, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium"
                  >
                    {spec}
                  </span>
                ))}
                {doctor.specialization.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{doctor.specialization.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Experience */}
            {doctor.experience > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-3.5 w-3.5" />
                <span>{doctor.experience} years exp.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Details */}
      <div className="p-6 space-y-4">
        {/* About */}
        {doctor.about && (
          <p className="text-sm text-gray-600 line-clamp-2">{doctor.about}</p>
        )}

        {/* Qualifications */}
        {doctor.qualifications?.length > 0 && (
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 line-clamp-1">
              {doctor.qualifications.join(", ")}
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          {doctor.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{doctor.email}</span>
            </div>
          )}

          {doctor.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{doctor.phone}</span>
            </div>
          )}

          {doctor.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">
                {[doctor.address.city, doctor.address.state]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions
      <div className="p-6 pt-0 flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(doctor._id);
          }}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
        >
          View Profile
          <ChevronRight className="h-4 w-4" />
        </button>

        {hasAppointment(doctor._id) ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewAppointment(doctor._id);
            }}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            View Appointment
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookAppointment(doctor._id, doctor.isAvailable);
            }}
            disabled={!doctor.isAvailable}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Book Appointment
          </button>
        )}
      </div> */}
    </div>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Doctors Found
      </h3>
      <p className="text-gray-600 text-sm">
        Try adjusting your search filters or check back later
      </p>
    </div>
  );
};

// Main Component
function MyDoctors({
  filteredDoctors,
  onDoctorClick,
  handleBookAppointment,
  handleViewAppointment,
  hasAppointment,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {filteredDoctors.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} onClick={() => onDoctorClick && onDoctorClick(doctor._id)} className="cursor-pointer">
              <DoctorCard
                doctor={doctor}
                onViewProfile={onDoctorClick}
                onBookAppointment={handleBookAppointment}
                onViewAppointment={handleViewAppointment}
                hasAppointment={hasAppointment}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDoctors;
