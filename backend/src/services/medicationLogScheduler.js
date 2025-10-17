import { Prescription } from "../models/prescription.models.js";
import { MedicationLog } from "../models/medicationLogs.models.js";
import { Patient } from "../models/patient.models.js";
import { sendEmail } from "../utils/email.js";
import { medicationReminderTemplate } from "../utils/emailTemplates.js";

const TIME_WINDOWS = {
  morning: { startHour: 6, endHour: 10 },
  afternoon: { startHour: 12, endHour: 15 },
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
  return null; // Outside scheduled windows, do nothing
};

export const createMedicationLogsForCurrentPeriod = async () => {
  const currentTimeOfDay = getCurrentTimeOfDay();
  if (!currentTimeOfDay) {
    console.log(
      "Current time does not fall into any medication schedule time window. No logs created."
    );
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all active prescriptions with active medications scheduled for current timeOfDay
  const prescriptions = await Prescription.find({
    status: "active",
    "medications.status": "active",
    "medications.schedule": currentTimeOfDay,
    date: { $lte: today }, // optional: prescription start date should be today or earlier
  });

  for (const prescription of prescriptions) {
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
        date: today,
        timeOfDay: currentTimeOfDay,
        status: "pending",
        takenAt: null,
        notes: null,
        sideEffects: null,
      });

      await log.save();
      console.log(
        `Medication log created for patient ${prescription.patientId} medication ${medication.name} for time ${currentTimeOfDay}`
      );

      // Send email reminder (guarded by env flag)
      try {
        if (process.env.EMAIL_NOTIFICATIONS_ENABLED !== "false") {
          const patient = await Patient.findById(prescription.patientId);
          if (patient && patient.email) {
            const html = medicationReminderTemplate({
              patientName: patient.fullname,
              medicationName: medication.name,
              dosage: medication.dosage,
              dateISO: today.toISOString(),
              timeOfDay: currentTimeOfDay,
              appUrl: process.env.APP_URL,
            });
            await sendEmail({
              to: "svbharath2005@gmail.com", //change this to patient.email
              subject: `Medication reminder: ${medication.name} (${currentTimeOfDay})`,
              html,
            });
          }
        }
      } catch (emailErr) {
        console.error("Failed to send medication reminder email:", emailErr);
      }
    }
  }
};

// export const createMedicationLogsForCurrentPeriod = async () => {
//   const currentTimeOfDay = getCurrentTimeOfDay();

//   const now = new Date();
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const currentMinute = now.getMinutes();
//   const currentHour = now.getHours();

//   // Find all active prescriptions (no need for schedule filter)
//   const prescriptions = await Prescription.find({
//     status: "active",
//     "medications.status": "active",
//     date: { $lte: today },
//   });

//   for (const prescription of prescriptions) {
//     for (const medication of prescription.medications) {
//       if (medication.status !== "active") continue;

//       // Check if log already exists for this exact minute
//       // const existingLog = await MedicationLog.findOne({
//       //   prescriptionId: prescription._id,
//       //   medicationName: medication.name,
//       //   date: today,
//       //   logHour: currentHour,
//       //   logMinute: currentMinute,
//       // });

//       // if (existingLog) continue;

//       const log = new MedicationLog({
//         prescriptionId: prescription._id,
//         patientId: prescription.patientId,
//         doctorId: prescription.doctorId,
//         medicationName: medication.name,
//         dosage: medication.dosage,
//         date: today,
//         timeOfDay: currentTimeOfDay,
//         status: "pending",
//         takenAt: null,
//         notes: null,
//         sideEffects: null,
//       });

//       await log.save();
//       console.log(
//         `✅ Medication log created for ${medication.name} at ${currentHour}:${currentMinute}`
//       );

//       // Optional: send email every minute (usually you'd disable this)
//       try {
//         if (process.env.EMAIL_NOTIFICATIONS_ENABLED !== "false") {
//           const patient = await Patient.findById(prescription.patientId);
//           if (patient && patient.email) {
//             console.log("Patient email in services", patient.email);
//             const html = medicationReminderTemplate({
//               patientName: patient.fullname,
//               medicationName: medication.name,
//               dosage: medication.dosage,
//               dateISO: today.toISOString(),
//               timeOfDay: `${currentHour}:${currentMinute}`,
//               appUrl: process.env.APP_URL,
//             });
//             await sendEmail({
//               to: patient.email,
//               subject: `Medication reminder: ${medication.name} (${currentHour}:${currentMinute})`,
//               html,
//             });
//             console.log("Email sent to the patient");
//           }
//         }
//       } catch (emailErr) {
//         console.error("❌ Failed to send medication reminder:", emailErr);
//       }
//     }
//   }
// };
