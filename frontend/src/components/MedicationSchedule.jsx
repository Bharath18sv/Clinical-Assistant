import React from "react";
import { Bell } from "lucide-react";

const MedicationSchedule = ({
  prescription,
  getScheduledTime,
  upcomingSchedule,
}) => {
  return (
    <div>
      {prescription.status === "active" ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Today's Schedule
            </h2>
            <p className="text-gray-600">Your medication schedule for today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["morning", "afternoon", "evening", "night"].map((timeOfDay) => {
              const scheduledMeds = prescription.medications.filter(
                (med) =>
                  med.schedule.includes(timeOfDay) && med.status === "active"
              );
              const timeIcon = {
                morning: "🌅",
                afternoon: "☀️",
                evening: "🌆",
                night: "🌙",
              };

              return (
                <div
                  key={timeOfDay}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{timeIcon[timeOfDay]}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {timeOfDay}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getScheduledTime(timeOfDay).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {scheduledMeds.length > 0 ? (
                      scheduledMeds.map((med, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {med.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              {med.dosage}mg
                            </span>
                          </div>
                          {med.notes && (
                            <p className="text-xs text-gray-600">{med.notes}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No medications scheduled
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upcoming Reminders */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Upcoming Reminders
            </h3>
            <div className="space-y-3">
              {upcomingSchedule
                .filter((item) => item.isUpcoming)
                .slice(0, 5)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.medication}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.dosage}mg • {item.timeOfDay}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {item.scheduledTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            No active prescriptions
          </h3>
          <p className="text-gray-600 text-center">
            Please consult your healthcare provider for new prescriptions.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicationSchedule;
