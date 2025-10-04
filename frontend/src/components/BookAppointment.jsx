import React from "react";
import { CalendarPlus, Clock } from "lucide-react";

function BookAppointment({
  appointmentForm,
  setAppointmentForm,
  handleAppointmentSubmit,
}) {
  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <CalendarPlus className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Book New Appointment
          </h3>
        </div>
        <form onSubmit={handleAppointmentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={appointmentForm.date}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  date: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={appointmentForm.time}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  time: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={appointmentForm.type}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  type: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="routine-check">Routine Check</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              placeholder="Additional notes..."
              rows="3"
              value={appointmentForm.notes}
              onChange={(e) =>
                setAppointmentForm({
                  ...appointmentForm,
                  notes: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Clock className="w-4 h-4" />
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookAppointment;
