// WhatsApp Service using WhatsApp Business API (example implementation)
import axios from "axios";

const WHATSAPP_API_URL =
  process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v17.0";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const sendWhatsApp = async ({ to, message }) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("WhatsApp sending failed:", error);
    throw error;
  }
};

// Alternative WhatsApp service using other providers
export const sendWhatsAppAlternative = async ({ to, message }) => {
  // Implement with your preferred WhatsApp provider
  // Examples: Twilio WhatsApp API, 360Dialog, etc.
  console.log(`WhatsApp to ${to}: ${message}`);
  return { success: true };
};
