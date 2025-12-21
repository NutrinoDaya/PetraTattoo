/**
 * Email Notification Service
 * Sends appointment confirmations and reminders via email
 * Uses Brevo API for sending emails from React Native
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your API Key from Brevo (Sendinblue)
 * 2. Update the BREVO_CONFIG object below
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMAIL_CONFIG } from '../config/emailConfig';

const EMAIL_HISTORY_KEY = 'PetraTattoo_email_history';

// Brevo API Configuration
const BREVO_CONFIG = {
  apiKey: EMAIL_CONFIG.BREVO_API_KEY,
  senderEmail: EMAIL_CONFIG.BREVO_SENDER_EMAIL,
  senderName: EMAIL_CONFIG.BREVO_SENDER_NAME
};

// Email templates using Brevo Dynamic Content pattern
const emailTemplates = {
  appointmentConfirmation: (clientName, date, time, tattooType, artistName) => ({
    subject: 'Tattoo Appointment Confirmation - Petra Tattoo Shop',
    htmlContent: `
      <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #D4AF37;">Petra Tattoo Shop</h2>
          <p>Dear {{params.clientName}},</p>
          <p>Your tattoo appointment has been confirmed!</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p>📅 <strong>Date:</strong> {{params.date}}</p>
            <p>🕐 <strong>Time:</strong> {{params.time}}</p>
            <p>🎨 <strong>Tattoo Type:</strong> {{params.tattooType}}</p>
            <p>👤 <strong>Artist:</strong> {{params.artistName}}</p>
          </div>
          <p>We're excited to create your tattoo! Please arrive 5-10 minutes early.</p>
          <p>Best regards,<br>Petra Tattoo Shop Team</p>
        </body>
      </html>
    `,
    params: { clientName, date, time, tattooType, artistName }
  }),

  appointmentReminder: (clientName, date, time, artistName) => ({
    subject: 'Reminder: Your Tattoo Appointment Tomorrow - Petra Tattoo Shop',
    htmlContent: `
      <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #D4AF37;">Petra Tattoo Shop</h2>
          <p>Hello {{params.clientName}},</p>
          <p>This is a friendly reminder about your upcoming tattoo appointment!</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p>📅 <strong>Date:</strong> {{params.date}}</p>
            <p>🕐 <strong>Time:</strong> {{params.time}}</p>
            <p>👤 <strong>Artist:</strong> {{params.artistName}}</p>
          </div>
          <p>See you soon!<br>Petra Tattoo Shop Team</p>
        </body>
      </html>
    `,
    params: { clientName, date, time, artistName }
  }),

  paymentConfirmation: (clientName, amount, date, tattooType) => ({
    subject: 'Payment Confirmation - Petra Tattoo Shop',
    htmlContent: `
      <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #D4AF37;">Petra Tattoo Shop</h2>
          <p>Dear {{params.clientName}},</p>
          <p>Thank you for your payment!</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p>💰 <strong>Amount:</strong> \${{params.amount}}</p>
            <p>📅 <strong>Date:</strong> {{params.date}}</p>
            <p>🎨 <strong>Tattoo:</strong> {{params.tattooType}}</p>
          </div>
          <p>Thank you for choosing Petra Tattoo Shop!</p>
        </body>
      </html>
    `,
    params: { clientName, amount: amount.toFixed(2), date, tattooType }
  }),

  paymentReminder: (clientName, amount, artistName) => ({
    subject: 'Payment Reminder - Petra Tattoo Shop',
    htmlContent: `
      <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #D4AF37;">Petra Tattoo Shop</h2>
          <p>Hello {{params.clientName}},</p>
          <p>We wanted to remind you about your remaining balance.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            <p>💰 <strong>Remaining Amount:</strong> \${{params.amount}}</p>
            <p>👤 <strong>Artist:</strong> {{params.artistName}}</p>
          </div>
          <p>Best regards,<br>Petra Tattoo Shop Team</p>
        </body>
      </html>
    `,
    params: { clientName, amount: amount.toFixed(2), artistName }
  }),
};

class EmailService {
  constructor() {
    this.emailHistory = [];
    this.loadHistory();
  }

  async loadHistory() {
    try {
      const history = await AsyncStorage.getItem(EMAIL_HISTORY_KEY);
      this.emailHistory = history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading email history:', error);
    }
  }

  async saveHistory() {
    try {
      await AsyncStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(this.emailHistory));
    } catch (error) {
      console.error('Error saving email history:', error);
    }
  }

  /**
   * Send email using Brevo Transactional API with Dynamic Content
   * @param {string} toEmail - Recipient email
   * @param {string} toName - Recipient name
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML with {{params.xxx}} placeholders
   * @param {Object} params - Object containing values for placeholders
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendEmailViaAPI(toEmail, toName, subject, htmlContent, params) {
    try {
      console.log(`Attempting to send dynamic email to ${toEmail}...`);

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": BREVO_CONFIG.apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { 
            name: BREVO_CONFIG.senderName, 
            email: BREVO_CONFIG.senderEmail 
          },
          to: [{ 
            email: toEmail, 
            name: toName 
          }],
          subject: subject,
          htmlContent: htmlContent,
          params: params
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Brevo API Success:', result);
        return { success: true, messageId: result.messageId };
      } else {
        console.error('❌ Brevo API Error:', result);
        return {
          success: false,
          error: result.message || 'Failed to send email'
        };
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      return {
        success: false,
        error: 'Network error. Please check your internet connection.'
      };
    }
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(
    clientName,
    clientEmail,
    date,
    time,
    tattooType,
    artistName
  ) {
    try {
      if (!this.isValidEmail(clientEmail)) {
        return {
          success: false,
          error: 'Invalid email address format',
        };
      }

      const template = emailTemplates.appointmentConfirmation(
        clientName,
        date,
        time,
        tattooType,
        artistName
      );

      // Send email via API using dynamic content
      const sendResult = await this.sendEmailViaAPI(
        clientEmail,
        clientName,
        template.subject,
        template.htmlContent,
        template.params
      );

      // Record in history
      const emailRecord = {
        id: Date.now(),
        to: clientEmail,
        subject: template.subject,
        type: 'appointment_confirmation',
        clientName,
        date,
        time,
        tattooType,
        artistName,
        sentAt: new Date().toISOString(),
        status: sendResult.success ? 'sent' : 'failed',
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      return {
        success: sendResult.success,
        emailId: emailRecord.id,
        error: sendResult.error,
      };
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(clientName, clientEmail, date, time, artistName) {
    try {
      if (!this.isValidEmail(clientEmail)) {
        return {
          success: false,
          error: 'Invalid email address format',
        };
      }

      const template = emailTemplates.appointmentReminder(clientName, date, time, artistName);

      const sendResult = await this.sendEmailViaAPI(
        clientEmail,
        clientName,
        template.subject,
        template.htmlContent,
        template.params
      );

      const emailRecord = {
        id: Date.now(),
        to: clientEmail,
        subject: template.subject,
        type: 'appointment_reminder',
        clientName,
        date,
        time,
        artistName,
        sentAt: new Date().toISOString(),
        status: sendResult.success ? 'sent' : 'failed',
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      return {
        success: sendResult.success,
        emailId: emailRecord.id,
        error: sendResult.error,
      };
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(clientName, clientEmail, amount, date, tattooType) {
    try {
      if (!this.isValidEmail(clientEmail)) {
        return {
          success: false,
          error: 'Invalid email address format',
        };
      }

      const template = emailTemplates.paymentConfirmation(clientName, amount, date, tattooType);

      const sendResult = await this.sendEmailViaAPI(
        clientEmail,
        clientName,
        template.subject,
        template.htmlContent,
        template.params
      );

      const emailRecord = {
        id: Date.now(),
        to: clientEmail,
        subject: template.subject,
        type: 'payment_confirmation',
        clientName,
        amount,
        date,
        tattooType,
        sentAt: new Date().toISOString(),
        status: sendResult.success ? 'sent' : 'failed',
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      return {
        success: sendResult.success,
        emailId: emailRecord.id,
        error: sendResult.error,
      };
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminder(clientName, clientEmail, remainingAmount, artistName) {
    try {
      if (!this.isValidEmail(clientEmail)) {
        return {
          success: false,
          error: 'Invalid email address format',
        };
      }

      const template = emailTemplates.paymentReminder(clientName, remainingAmount, artistName);

      const sendResult = await this.sendEmailViaAPI(
        clientEmail,
        clientName,
        template.subject,
        template.htmlContent,
        template.params
      );

      const emailRecord = {
        id: Date.now(),
        to: clientEmail,
        subject: template.subject,
        type: 'payment_reminder',
        clientName,
        remainingAmount,
        artistName,
        sentAt: new Date().toISOString(),
        status: sendResult.success ? 'sent' : 'failed',
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      return {
        success: sendResult.success,
        emailId: emailRecord.id,
        error: sendResult.error,
      };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Get email history
   */
  getEmailHistory() {
    return this.emailHistory;
  }

  /**
   * Clear email history
   */
  async clearHistory() {
    try {
      this.emailHistory = [];
      await AsyncStorage.removeItem(EMAIL_HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing email history:', error);
      return false;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if Email Service is configured
   */
  isConfigured() {
    return true; // Always true as we assume server is running
  }

  /**
   * Get email statistics
   */
  getStatistics() {
    const stats = {
      total: this.emailHistory.length,
      confirmations: this.emailHistory.filter((e) => e.type === 'appointment_confirmation').length,
      reminders: this.emailHistory.filter((e) => e.type === 'appointment_reminder').length,
      paymentConfirmations: this.emailHistory.filter((e) => e.type === 'payment_confirmation').length,
      paymentReminders: this.emailHistory.filter((e) => e.type === 'payment_reminder').length,
      simulated: this.emailHistory.filter((e) => e.simulated).length,
      actuallySent: this.emailHistory.filter((e) => !e.simulated && e.status === 'sent').length,
    };
    return stats;
  }
}

// Export singleton instance
export const emailService = new EmailService();
