import nodemailer from "nodemailer";

let cachedTransporter = null;

export function getEmailTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for others
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendEmail({ to, subject, html }) {
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "false")
    return { skipped: true };

  const from = process.env.EMAIL_FROM || "no-reply@smart-care";
  const transporter = getEmailTransporter();
  const info = await transporter.sendMail({ from, to, subject, html });
  return { messageId: info.messageId };
}
