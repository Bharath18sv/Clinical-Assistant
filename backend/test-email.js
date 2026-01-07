import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

console.log("=".repeat(60));
console.log("📧 EMAIL SERVICE TEST SCRIPT");
console.log("=".repeat(60));

// Step 1: Check environment variables
console.log("\n1️⃣ Checking Environment Variables:");
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || "smtp.gmail.com (default)"}`);
console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || "465 (default)"}`);
console.log(`   SMTP_USER: ${process.env.SMTP_USER || "❌ NOT SET"}`);
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? "✅ SET (length: " + process.env.SMTP_PASS.length + ")" : "❌ NOT SET"}`);
console.log(`   EMAIL_NOTIFICATIONS_ENABLED: ${process.env.EMAIL_NOTIFICATIONS_ENABLED || "not set (will send)"}`);

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("\n❌ ERROR: SMTP_USER or SMTP_PASS not set in .env file");
  console.error("   Please add these to your .env file:");
  console.error("   SMTP_USER=your-email@gmail.com");
  console.error("   SMTP_PASS=your-16-char-app-password");
  process.exit(1);
}

// Step 2: Create transporter
console.log("\n2️⃣ Creating Email Transporter:");
const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = parseInt(process.env.SMTP_PORT || "465", 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for 587
  auth: { user, pass },
  ...(port === 587 && {
    requireTLS: true, // Force TLS for port 587
  }),
  tls: {
    rejectUnauthorized: false,
  },
});

console.log("   ✅ Transporter created");

// Step 3: Verify transporter
console.log("\n3️⃣ Verifying Transporter Connection:");
transporter.verify(function (error, success) {
  if (error) {
    console.error("   ❌ Verification failed:");
    console.error(`      Error Code: ${error.code}`);
    console.error(`      Error Message: ${error.message}`);
    console.error(`      Full Error:`, error);
    
    if (error.code === "EAUTH") {
      console.error("\n   💡 TROUBLESHOOTING:");
      console.error("      1. Make sure you're using a Gmail App Password");
      console.error("      2. Generate one at: https://myaccount.google.com/apppasswords");
      console.error("      3. Enable 2-Step Verification first if not already enabled");
      console.error("      4. Copy the 16-character password (no spaces) to .env");
    }
    process.exit(1);
  } else {
    console.log("   ✅ Server is ready to send emails");
    
    // Step 4: Send test email
    console.log("\n4️⃣ Sending Test Email:");
    const mailOptions = {
      from: process.env.SMTP_FROM || `Smart Care Test <${user}>`,
      to: user, // Send to yourself
      subject: "Test Email from Smart Care Assistant",
      html: `
        <h1>Email Service Test</h1>
        <p>This is a test email from your Smart Care Assistant application.</p>
        <p>If you received this, your email configuration is working correctly! ✅</p>
        <hr>
        <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("   ❌ Failed to send test email:");
        console.error(`      Error Code: ${error.code}`);
        console.error(`      Error Message: ${error.message}`);
        console.error(`      Full Error:`, error);
        process.exit(1);
      } else {
        console.log("   ✅ Test email sent successfully!");
        console.log(`      Message ID: ${info.messageId}`);
        console.log(`      Response: ${info.response}`);
        console.log(`\n✅ SUCCESS! Check your inbox at: ${user}`);
        console.log("=".repeat(60));
      }
    });
  }
});
