import crypto from "crypto";

export const medicationReminderTemplate = ({
  patientName,
  prescriptionTitle,
  medications,
  dateISO,
  timeOfDay,
  appUrl,
  doctorName,
  doctorSpecialization,
  doctorPhone,
}) => {
  const prettyDate = new Date(dateISO).toLocaleDateString();

  // Generate medication list with log buttons
  const medicationList = medications
    .map((med) => {
      // Generate secure tokens for each status
      // Use a consistent date format for token generation
      const dateForToken = new Date(dateISO).toISOString().split("T")[0]; // YYYY-MM-DD format
      const baseString = `${med.prescriptionId}${med.medicationName}${timeOfDay}${dateForToken}`;

      const takenToken = crypto
        .createHash("sha256")
        .update(`${baseString}taken${process.env.JWT_SECRET}`)
        .digest("hex");

      const missedToken = crypto
        .createHash("sha256")
        .update(`${baseString}missed${process.env.JWT_SECRET}`)
        .digest("hex");

      const skippedToken = crypto
        .createHash("sha256")
        .update(`${baseString}skipped${process.env.JWT_SECRET}`)
        .digest("hex");

      // Use the same date format for the URL
      const dateForUrl = dateForToken;

      return `
    <div style="margin: 15px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h3 style="margin: 0 0 10px; color: #333;">${med.medicationName}</h3>
      <p style="margin: 5px 0;"><strong>Dosage:</strong> ${med.dosage}</p>
      ${
        med.notes
          ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${med.notes}</p>`
          : ""
      }
      
      <!-- Log buttons -->
      <div style="margin-top: 15px;">
        <strong>Have you taken this medication?</strong><br/>
        <a href="${
          process.env.API_URL || "http://localhost:5001"
        }/api/medicationLogs/email-update?prescriptionId=${
        med.prescriptionId
      }&medicationName=${encodeURIComponent(
        med.medicationName
      )}&timeOfDay=${timeOfDay}&date=${dateForUrl}&status=taken&token=${takenToken}" 
           style="display: inline-block; margin: 5px; padding: 8px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Yes, I took it</a>
        <a href="${
          process.env.API_URL || "http://localhost:5001"
        }/api/medicationLogs/email-update?prescriptionId=${
        med.prescriptionId
      }&medicationName=${encodeURIComponent(
        med.medicationName
      )}&timeOfDay=${timeOfDay}&date=${dateForUrl}&status=missed&token=${missedToken}" 
           style="display: inline-block; margin: 5px; padding: 8px 15px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">No, I missed it</a>
        <a href="${
          process.env.API_URL || "http://localhost:5001"
        }/api/medicationLogs/email-update?prescriptionId=${
        med.prescriptionId
      }&medicationName=${encodeURIComponent(
        med.medicationName
      )}&timeOfDay=${timeOfDay}&date=${dateForUrl}&status=skipped&token=${skippedToken}" 
           style="display: inline-block; margin: 5px; padding: 8px 15px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">I skipped it</a>
      </div>
    </div>
  `;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111; max-width: 600px; margin: 0 auto;">
      <h2 style="margin:0 0 12px; color: #2196F3;">Medication Reminder</h2>
      <p>Hello ${patientName || "Patient"},</p>
      <p>This is a reminder to take your medications from prescription: <strong>${prescriptionTitle}</strong></p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px; color: #333;">Prescription Details</h3>
        <p style="margin: 5px 0;"><strong>Date</strong>: ${prettyDate}</p>
        <p style="margin: 5px 0;"><strong>Time Period</strong>: ${timeOfDay}</p>
        ${
          doctorName
            ? `<p style="margin: 5px 0;"><strong>Prescribed by</strong>: Dr. ${doctorName}${
                doctorSpecialization ? ` (${doctorSpecialization})` : ""
              }</p>`
            : ""
        }
        ${
          doctorPhone
            ? `<p style="margin: 5px 0;"><strong>Doctor's Contact</strong>: ${doctorPhone}</p>`
            : ""
        }
      </div>
      
      <h3 style="margin: 20px 0 10px; color: #333;">Your Medications for ${timeOfDay}</h3>
      ${medicationList}
      
      <div style="margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-radius: 8px;">
        <p><strong>Need to update your medication log?</strong></p>
        <p>You can also update your medication status later in your dashboard:</p>
        <a href="${appUrl}" 
           style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Open Your Dashboard</a>
      </div>
      
      <p style="margin-top:16px; color:#666; font-size:12px;">If you have already taken these medications, you can ignore this email.</p>
    </div>
  `;
};

export const adrAlertTemplate = ({
  patientName,
  medicationName,
  reportedEffects,
  severity,
  guidance,
  appUrl,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111;">
      <h2 style="margin:0 0 12px;">Possible Adverse Drug Reaction</h2>
      <p>Dear ${patientName || "Patient"},</p>
      <p>We detected a potential adverse reaction related to <strong>${medicationName}</strong>.</p>
      ${
        reportedEffects
          ? `<p><strong>Reported effects:</strong> ${reportedEffects}</p>`
          : ""
      }
      ${severity ? `<p><strong>Severity:</strong> ${severity}</p>` : ""}
      ${guidance ? `<p>${guidance}</p>` : ""}
      ${
        appUrl
          ? `<p><a href="${appUrl}" target="_blank">Open your dashboard</a> for next steps and to contact your care team.</p>`
          : ""
      }
      <p style="margin-top:16px; color:#666; font-size:12px;">If your symptoms are severe, seek emergency care immediately.</p>
    </div>
  `;
};

export const verificationCodeTemplate = ({ name, code, appUrl }) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111;">
      <h2 style="margin:0 0 12px;">Verify your email</h2>
      <p>Hello ${name || "there"},</p>
      <p>Use the following code to verify your email address:</p>
      <div style="font-size:28px; font-weight:700; letter-spacing:4px; background:#f5f5f5; padding:12px 16px; display:inline-block;">
        ${code}
      </div>
      <p style="margin-top:12px;">This code will expire in 10 minutes.</p>
      ${
        appUrl
          ? `<p>You can also verify in the app: <a href="${appUrl}" target="_blank">Open app</a></p>`
          : ""
      }
      <p style="margin-top:16px; color:#666; font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
};
