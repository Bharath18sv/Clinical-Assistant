import React, { useState, useEffect } from "react";
import { X, Clock, Bell, Save, Trash2 } from "lucide-react";

const ReminderModal = ({ isOpen, onClose, prescription, onSave, savedReminders = [] }) => {
  const [reminders, setReminders] = useState([]);

  // Load saved reminders when modal opens
  useEffect(() => {
    if (isOpen) {
      setReminders(savedReminders.length > 0 ? savedReminders : []);
    }
  }, [isOpen, savedReminders]);

  const timeOptions = [
    { value: "morning", label: "Morning", time: "08:00" },
    { value: "afternoon", label: "Afternoon", time: "14:00" },
    { value: "evening", label: "Evening", time: "18:00" },
    { value: "night", label: "Night", time: "22:00" },
  ];

  const addReminder = () => {
    setReminders([
      ...reminders,
      {
        id: Date.now(),
        medicationName: "",
        timeOfDay: "morning",
        customTime: "",
        isEnabled: true,
        days: [],
      },
    ]);
  };

  const updateReminder = (id, field, value) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, [field]: value } : reminder
      )
    );
  };

  const removeReminder = (id) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id));
  };

  const toggleDay = (reminderId, day) => {
    setReminders(
      reminders.map((reminder) => {
        if (reminder.id === reminderId) {
          const days = reminder.days.includes(day)
            ? reminder.days.filter((d) => d !== day)
            : [...reminder.days, day];
          return { ...reminder, days };
        }
        return reminder;
      })
    );
  };

  const handleSave = () => {
    if (reminders.length === 0) {
      alert("Please add at least one reminder before saving.");
      return;
    }

    // Validate that all reminders have a medication selected
    const incompleteReminders = reminders.filter(
      (r) => !r.medicationName || !r.timeOfDay
    );
    
    if (incompleteReminders.length > 0) {
      alert("Please complete all reminder fields before saving.");
      return;
    }

    onSave(reminders);
    setReminders([]); // Clear reminders after saving
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {reminders.length > 0 ? "Edit" : "Set"} Medication Reminders
              </h3>
              <p className="text-sm text-gray-600">
                {reminders.length > 0 
                  ? `${reminders.length} reminder(s) configured` 
                  : "Never miss a dose with smart notifications"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No reminders set</p>
              <button
                onClick={addReminder}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Reminder
              </button>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Reminder {reminders.indexOf(reminder) + 1}
                  </h4>
                  <button
                    onClick={() => removeReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                    title="Delete reminder"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication
                    </label>
                    <select
                      value={reminder.medicationName}
                      onChange={(e) =>
                        updateReminder(reminder.id, "medicationName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select medication</option>
                      {prescription?.medications?.map((med) => (
                        <option key={med.name} value={med.name}>
                          {med.name} - {med.dosage}mg
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time of Day
                    </label>
                    <select
                      value={reminder.timeOfDay}
                      onChange={(e) =>
                        updateReminder(reminder.id, "timeOfDay", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} ({option.time})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days of Week
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(reminder.id, day)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          reminder.days.includes(day)
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reminder.isEnabled}
                      onChange={(e) =>
                        updateReminder(reminder.id, "isEnabled", e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable reminder</span>
                  </label>
                </div>
              </div>
            ))
          )}

          {reminders.length > 0 && (
            <button
              onClick={addReminder}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add Another Reminder
            </button>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Reminders
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;

