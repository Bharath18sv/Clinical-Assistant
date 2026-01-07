import nodemailer from "nodemailer";

let cachedTransporter = null;

export function getEmailTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("📧 Email Transporter Configuration:");
  console.log(`   SMTP_HOST: ${host}`);
  console.log(`   SMTP_PORT: ${port}`);
  console.log(`   SMTP_USER: ${user ? user : "❌ NOT SET"}`);
  console.log(`   SMTP_PASS: ${pass ? "✅ SET (hidden)" : "❌ NOT SET"}`);

  if (!user || !pass) {
    const errorMsg = "SMTP configuration is missing. Please set SMTP_USER and SMTP_PASS (use Gmail App Password, not regular password).";
    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: { user, pass },
    ...(port === 587 && {
      requireTLS: true, // Force TLS for port 587
    }),
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates in development
    },
  });

  console.log("✅ Email transporter created successfully");
  return cachedTransporter;
}

export async function sendEmail({ to, subject, html }) {
  console.log("📧 Attempting to send email....");
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);

  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "false") {
    console.log("⚠️ Email notifications disabled in .env");
    return { skipped: true, reason: "Notifications disabled" };
  }

  if (!to) {
    console.warn("⚠️ Email not sent — no recipient (to:) provided!");
    return { skipped: true, reason: "No recipient email" };
  }

  try {
    const from = process.env.SMTP_FROM || "Smart Care Assistant <no-reply@smartcare.com>";
    console.log(`   From: ${from}`);
    
    const transporter = getEmailTransporter();
    console.log("   Sending email via transporter...");
    
    const info = await transporter.sendMail({ from, to, subject, html });
    
    console.log("✅ Email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    return { messageId: info.messageId, success: true };
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error(`   Error Code: ${error.code}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Full Error:`, error);
    
    if (error.code === "EAUTH") {
      console.error("   💡 Hint: Make sure you're using a Gmail App Password, not your regular password.");
      console.error("   💡 Generate one at: https://myaccount.google.com/apppasswords");
    } else if (error.code === "ECONNECTION") {
      console.error("   💡 Hint: Check your internet connection and firewall settings.");
    } else if (error.code === "ETIMEDOUT") {
      console.error("   💡 Hint: SMTP server connection timed out. Check host and port.");
    }
    
    // Don't throw - just log and return error to prevent server crash
    return { error: error.message, errorCode: error.code, success: false, skipped: true };
  }
}
