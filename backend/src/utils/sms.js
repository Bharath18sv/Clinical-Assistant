// SMS Service using Twilio (example implementation)
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async ({ to, message }) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log("SMS sent successfully:", result.sid);
    return result;
  } catch (error) {
    console.error("SMS sending failed:", error);
    throw error;
  }
};

// Alternative SMS service using other providers
export const sendSMSAlternative = async ({ to, message }) => {
  // Implement with your preferred SMS provider
  // Examples: AWS SNS, TextLocal, MessageBird, etc.
  console.log(`SMS to ${to}: ${message}`);
  return { success: true };
};
