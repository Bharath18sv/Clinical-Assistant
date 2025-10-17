export const medicationReminderTemplate = ({
  patientName,
  medicationName,
  dosage,
  dateISO,
  timeOfDay,
  appUrl,
}) => {
  const prettyDate = new Date(dateISO).toLocaleDateString();
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111;">
      <h2 style="margin:0 0 12px;">Medication Reminder</h2>
      <p>Hello ${patientName || "Patient"},</p>
      <p>This is a reminder to take your medication:</p>
      <ul>
        <li><strong>Medication</strong>: ${medicationName}</li>
        <li><strong>Dosage</strong>: ${dosage}</li>
        <li><strong>Date</strong>: ${prettyDate}</li>
        <li><strong>Time</strong>: ${timeOfDay}</li>
      </ul>
      ${
        appUrl
          ? `<p><a href="${appUrl}" target="_blank">Open your dashboard</a> to update your log.</p>`
          : ""
      }
      <p style="margin-top:16px; color:#666; font-size:12px;">If you have already taken this medication, you can ignore this email.</p>
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
