import { sendEmail } from "../utils/email.js";
import { sendSMS } from "../utils/sms.js";
import { sendWhatsApp } from "../utils/whatsapp.js";

export class NotificationService {
  /**
   * Send ADR alert via email
   */
  static async sendEmailAlert(notificationData) {
    const { doctor, patient, adrResults } = notificationData;

    const subject = `🚨 ADR Alert: High Risk Detected for ${patient.fullname}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ ADR Alert</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #dc2626; margin-top: 0;">High Risk ADR Detected</h2>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #374151;">Patient Information</h3>
            <p><strong>Name:</strong> ${patient.fullname}</p>
            <p><strong>Email:</strong> ${patient.email}</p>
            <p><strong>Phone:</strong> ${patient.phone}</p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #374151;">Risk Level: ${adrResults.riskLevel.toUpperCase()}</h3>
            <p><strong>Detection Time:</strong> ${new Date(
              adrResults.timestamp
            ).toLocaleString()}</p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #374151;">Detected Issues</h3>
            
            ${
              adrResults.checks.drugInteractions.length > 0
                ? `
              <h4 style="color: #dc2626;">Drug Interactions:</h4>
              <ul>
                ${adrResults.checks.drugInteractions
                  .map(
                    (interaction) => `
                  <li><strong>${interaction.medication1}</strong> + <strong>${interaction.medication2}</strong>: 
                      ${interaction.description} (${interaction.severity})</li>
                `
                  )
                  .join("")}
              </ul>
            `
                : ""
            }
            
            ${
              adrResults.checks.allergyContraindications.length > 0
                ? `
              <h4 style="color: #dc2626;">Allergy Contraindications:</h4>
              <ul>
                ${adrResults.checks.allergyContraindications
                  .map(
                    (contraindication) => `
                  <li><strong>${contraindication.medication}</strong>: 
                      ${contraindication.description} (${contraindication.severity})</li>
                `
                  )
                  .join("")}
              </ul>
            `
                : ""
            }
            
            ${
              adrResults.checks.diseaseContraindications.length > 0
                ? `
              <h4 style="color: #dc2626;">Disease Contraindications:</h4>
              <ul>
                ${adrResults.checks.diseaseContraindications
                  .map(
                    (contraindication) => `
                  <li><strong>${contraindication.medication}</strong>: 
                      ${contraindication.description} (${contraindication.severity})</li>
                `
                  )
                  .join("")}
              </ul>
            `
                : ""
            }
          </div>
          
          ${
            adrResults.recommendations.length > 0
              ? `
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #92400e;">Recommendations</h3>
              <ul>
                ${adrResults.recommendations
                  .map(
                    (rec) => `
                  <li><strong>${rec.priority.toUpperCase()}:</strong> ${
                      rec.action
                    }</li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/doctor/dashboard" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated ADR alert from Smart Care Assistant</p>
          <p>Please review this alert immediately and take appropriate action.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: doctor.email,
        subject,
        html,
      });

      console.log(`ADR email alert sent to doctor: ${doctor.email}`);
      return { success: true, channel: "email" };
    } catch (error) {
      console.error("Failed to send ADR email alert:", error);
      return { success: false, channel: "email", error: error.message };
    }
  }

  /**
   * Send ADR alert via SMS
   */
  static async sendSMSAlert(notificationData) {
    const { doctor, patient, adrResults } = notificationData;

    const message = `🚨 ADR ALERT: High risk detected for patient ${
      patient.fullname
    }. 
Risk Level: ${adrResults.riskLevel.toUpperCase()}. 
Please check your dashboard immediately. 
Smart Care Assistant`;

    try {
      await sendSMS({
        to: doctor.phone,
        message,
      });

      console.log(`ADR SMS alert sent to doctor: ${doctor.phone}`);
      return { success: true, channel: "sms" };
    } catch (error) {
      console.error("Failed to send ADR SMS alert:", error);
      return { success: false, channel: "sms", error: error.message };
    }
  }

  /**
   * Send ADR alert via WhatsApp
   */
  static async sendWhatsAppAlert(notificationData) {
    const { doctor, patient, adrResults } = notificationData;

    const message = `🚨 *ADR ALERT* 🚨

*Patient:* ${patient.fullname}
*Risk Level:* ${adrResults.riskLevel.toUpperCase()}
*Time:* ${new Date(adrResults.timestamp).toLocaleString()}

*Issues Detected:*
${
  adrResults.checks.drugInteractions.length > 0
    ? `• Drug Interactions: ${adrResults.checks.drugInteractions.length}`
    : ""
}
${
  adrResults.checks.allergyContraindications.length > 0
    ? `• Allergy Issues: ${adrResults.checks.allergyContraindications.length}`
    : ""
}
${
  adrResults.checks.diseaseContraindications.length > 0
    ? `• Disease Contraindications: ${adrResults.checks.diseaseContraindications.length}`
    : ""
}

Please check your dashboard immediately for detailed information.

_Smart Care Assistant_`;

    try {
      await sendWhatsApp({
        to: doctor.phone,
        message,
      });

      console.log(`ADR WhatsApp alert sent to doctor: ${doctor.phone}`);
      return { success: true, channel: "whatsapp" };
    } catch (error) {
      console.error("Failed to send ADR WhatsApp alert:", error);
      return { success: false, channel: "whatsapp", error: error.message };
    }
  }

  /**
   * Send general notification (fallback)
   */
  static async sendGeneralNotification(notificationData) {
    const results = await Promise.allSettled([
      this.sendEmailAlert(notificationData),
      this.sendSMSAlert(notificationData),
      this.sendWhatsAppAlert(notificationData),
    ]);

    return results.map((result, index) => ({
      channel: ["email", "sms", "whatsapp"][index],
      success: result.status === "fulfilled" && result.value.success,
      error: result.status === "rejected" ? result.reason : result.value.error,
    }));
  }
}
