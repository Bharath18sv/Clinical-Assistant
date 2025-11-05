import { Prescription } from "../models/prescription.models.js";
import { MedicationLog } from "../models/medicationLogs.models.js";
import { Patient } from "../models/patient.models.js";
import { Doctor } from "../models/doctor.models.js";
import { sendEmail } from "../utils/email.js";
import { medicationReminderTemplate } from "../utils/emailTemplates.js";

// Time windows are now defined in prescription controller

export const createMedicationLogsForCurrentPeriod = async (
  specificPrescription = null
) => {
  // Get current time of day (morning, afternoon, evening, night)
  const TIME_WINDOWS = {
    morning: { startHour: 6, endHour: 10 },
    afternoon: { startHour: 12, endHour: 16 },
    evening: { startHour: 17, endHour: 20 },
    night: { startHour: 21, endHour: 23 },
  };

  const getCurrentTimeOfDay = () => {
    const now = new Date();
    const hour = now.getHours();

    for (const [timeOfDay, { startHour, endHour }] of Object.entries(
      TIME_WINDOWS
    )) {
      if (hour >= startHour && hour <= endHour) {
        return timeOfDay;
      }
    }
    return null;
  };

  const currentTimeOfDay = getCurrentTimeOfDay();
  if (!currentTimeOfDay) {
    console.log(
      "Current time does not fall into any medication schedule time window. No logs created."
    );
    return;
  }

  // Create today's date with time set to 00:00:00 in local timezone for consistent storage
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let prescriptions = [];

  // If a specific prescription is provided, use it; otherwise find all active prescriptions
  if (specificPrescription) {
    // Check if the specific prescription is active and has medications for the current time
    if (
      specificPrescription.status === "active" &&
      specificPrescription.medications.some(
        (med) =>
          med.status === "active" && med.schedule.includes(currentTimeOfDay)
      )
    ) {
      prescriptions = [specificPrescription];
    }
  } else {
    // Find all active prescriptions with active medications scheduled for current timeOfDay
    prescriptions = await Prescription.find({
      status: "active",
      "medications.status": "active",
      "medications.schedule": currentTimeOfDay,
      date: { $lte: today }, // optional: prescription start date should be today or earlier
    }).populate("doctorId", "fullname specialization phone");
  }

  // Group medications by prescription
  const prescriptionMedicationsMap = new Map();

  for (const prescription of prescriptions) {
    // Validate that prescription has required fields
    if (!prescription.doctorId) {
      console.warn(
        `⚠️ Skipping prescription ${prescription._id} - missing doctorId`
      );
      continue;
    }

    if (!prescription.patientId) {
      console.warn(
        `⚠️ Skipping prescription ${prescription._id} - missing patientId`
      );
      continue;
    }

    // Get doctor details (either from populated data or by fetching from DB)
    let doctor = null;
    if (prescription.doctorId) {
      // If doctor is already populated, use it; otherwise fetch from DB
      if (prescription.doctorId.fullname) {
        doctor = prescription.doctorId;
      } else {
        try {
          doctor = await Doctor.findById(prescription.doctorId);
        } catch (err) {
          console.error(
            `Failed to fetch doctor ${prescription.doctorId}:`,
            err
          );
          continue;
        }

        if (!doctor) {
          console.warn(
            `⚠️ Doctor not found for prescription ${prescription._id}`
          );
          continue;
        }
      }
    }

    for (const medication of prescription.medications) {
      if (
        medication.status !== "active" ||
        !medication.schedule.includes(currentTimeOfDay)
      ) {
        continue;
      }

      // Check if medication log already exists for this prescription/medication/time/date
      const existingLog = await MedicationLog.findOne({
        prescriptionId: prescription._id,
        medicationName: medication.name,
        date: today,
        timeOfDay: currentTimeOfDay,
      });

      if (existingLog) {
        continue; // Do not create duplicate log
      }

      const log = new MedicationLog({
        prescriptionId: prescription._id,
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        medicationName: medication.name,
        dosage: medication.dosage,
        date: today, // Store date with time set to 00:00:00
        timeOfDay: currentTimeOfDay,
        status: "pending",
        takenAt: null,
        notes: null,
        sideEffects: null,
      });

      try {
        await log.save();
        console.log(
          `Medication log created for patient ${prescription.patientId} medication ${medication.name} for time ${currentTimeOfDay}`
        );
      } catch (saveErr) {
        console.error(
          `Failed to save medication log for prescription ${prescription._id}:`,
          saveErr
        );
        continue;
      }

      // Group medications by prescription for email
      if (!prescriptionMedicationsMap.has(prescription._id.toString())) {
        prescriptionMedicationsMap.set(prescription._id.toString(), {
          prescription: prescription,
          doctor: doctor,
          medications: [],
        });
      }

      prescriptionMedicationsMap
        .get(prescription._id.toString())
        .medications.push({
          medicationName: medication.name,
          dosage: medication.dosage,
          notes: medication.notes,
          prescriptionId: prescription._id,
        });
    }
  }

  // Send one email per prescription with all medications for the current time period
  for (const [prescriptionId, data] of prescriptionMedicationsMap.entries()) {
    const { prescription, doctor, medications } = data;

    // Send email reminder (guarded by env flag)
    try {
      if (
        process.env.EMAIL_NOTIFICATIONS_ENABLED !== "false" &&
        medications.length > 0
      ) {
        const patient = await Patient.findById(prescription.patientId);
        if (patient && patient.email) {
          // Use consistent date format (YYYY-MM-DD) for the email template
          const dateForEmail = today.toISOString().split("T")[0];

          const html = medicationReminderTemplate({
            patientName: patient.fullname,
            prescriptionTitle: prescription.title,
            medications: medications,
            dateISO: dateForEmail, // Use consistent format
            timeOfDay: currentTimeOfDay,
            appUrl:
              process.env.FRONTEND_URL ||
              process.env.APP_URL ||
              "http://localhost:3000",
            doctorName: doctor ? doctor.fullname : null,
            doctorSpecialization:
              doctor && doctor.specialization ? doctor.specialization[0] : null,
            doctorPhone: doctor ? doctor.phone : null,
          });

          // Create a subject that includes the prescription title and number of medications
          const subject = `Medication Reminder: ${prescription.title} (${
            medications.length
          } medication${
            medications.length > 1 ? "s" : ""
          }) - ${currentTimeOfDay}`;

          await sendEmail({
            to: patient.email,
            subject: subject,
            html,
          });
          console.log(
            `📧 Email reminder sent to ${patient.email} for prescription ${prescription.title} with ${medications.length} medication(s)`
          );
        } else {
          console.log(
            `⚠️ No email found for patient ${prescription.patientId}`
          );
        }
      } else {
        console.log("📧 Email notifications are disabled");
      }
    } catch (emailErr) {
      console.error("Failed to send medication reminder email:", emailErr);
    }
  }
};
