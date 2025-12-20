/**
 * Email Notification Service
 * Sends appointment confirmations and reminders via email
 * Uses EmailJS API for sending emails from React Native
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://www.emailjs.com/ and create a free account
 * 2. Create an email service (connect your email provider like Gmail, Outlook, etc.)
 * 3. Create an email template with these variables:
 *    - {{to_email}} - recipient email
 *    - {{to_name}} - recipient name  
 *    - {{subject}} - email subject
 *    - {{message}} - email body content
 * 4. Get your Service ID, Template ID, and Public Key
 * 5. Update the CONFIG object below with your credentials
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_HISTORY_KEY = 'PetraTattoo_email_history';

// ⚠️ IMPORTANT: Replace these with your EmailJS credentials
// Get them from: https://www.emailjs.com/
const CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',      // e.g., 'service_abc123'
  templateId: 'YOUR_TEMPLATE_ID',    // e.g., 'template_xyz789'  
  publicKey: 'YOUR_PUBLIC_KEY',      // e.g., 'AbCdEfGhIjKlMnOp'
  enabled: false,  // Set to true after configuring EmailJS
};

// Email templates
const emailTemplates = {
  appointmentConfirmation: (clientName, date, time, tattooType, artistName) => ({
    subject: 'Tattoo Appointment Confirmation - Petra Tattoo Shop',
    body: `
Dear ${clientName},

Your tattoo appointment has been confirmed!

📅 Date: ${date}
🕐 Time: ${time}
🎨 Tattoo Type: ${tattooType}
👤 Artist: ${artistName}

We're excited to create your tattoo! Please arrive 5-10 minutes early.

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
Petra Tattoo Shop Team
    `.trim(),
  }),

  appointmentReminder: (clientName, date, time, artistName) => ({
    subject: 'Reminder: Your Tattoo Appointment Tomorrow - Petra Tattoo Shop',
    body: `
Hello ${clientName},

This is a friendly reminder about your upcoming tattoo appointment!

📅 Date: ${date}
🕐 Time: ${time}
👤 Artist: ${artistName}

Please remember to:
- Arrive 5-10 minutes early
- Avoid alcohol and caffeine before appointment
- Wear comfortable, loose-fitting clothing
- Bring a valid ID

If you have any questions, feel free to contact us.

See you soon!
Petra Tattoo Shop Team
    `.trim(),
  }),

  paymentConfirmation: (clientName, amount, date, tattooType) => ({
    subject: 'Payment Confirmation - Petra Tattoo Shop',
    body: `
Dear ${clientName},

Thank you for your payment!

💰 Amount: $${amount.toFixed(2)}
📅 Date: ${date}
🎨 Tattoo: ${tattooType}

Your tattoo is now marked as completed. Thank you for choosing Petra Tattoo Shop!

We hope to see you again soon.

Best regards,
Petra Tattoo Shop Team
    `.trim(),
  }),

  paymentReminder: (clientName, amount, artistName) => ({
    subject: 'Payment Reminder - Petra Tattoo Shop',
    body: `
Hello ${clientName},

We wanted to remind you about your remaining balance for your recent tattoo session.

💰 Remaining Amount: $${amount.toFixed(2)}
👤 Artist: ${artistName}

Please let us know when you'd like to settle the balance. You can reach us by phone or email.

Thank you for your business!

Best regards,
Petra Tattoo Shop Team
    `.trim(),
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
   * Send email using EmailJS API
   * @param {string} toEmail - Recipient email
   * @param {string} toName - Recipient name
   * @param {string} subject - Email subject
   * @param {string} message - Email body
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendEmailViaAPI(toEmail, toName, subject, message) {
    if (!CONFIG.enabled) {
      console.log('📧 EmailJS not configured. Email would be sent to:', toEmail);
      console.log('📧 Subject:', subject);
      console.log('📧 To enable real emails:');
      console.log('   1. Go to https://www.emailjs.com/');
      console.log('   2. Create account and get credentials');
      console.log('   3. Update CONFIG in emailService.js');
      console.log('   4. Set CONFIG.enabled = true');
      
      // Return success for demo purposes but note it's simulated
      return {
        success: true,
        simulated: true,
        message: 'Email simulated (EmailJS not configured)',
      };
    }

    try {
      // EmailJS API call
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: CONFIG.serviceId,
          template_id: CONFIG.templateId,
          user_id: CONFIG.publicKey,
          template_params: {
            to_email: toEmail,
            to_name: toName,
            subject: subject,
            message: message,
          },
        }),
      });

      if (response.ok) {
        console.log('✅ Email sent successfully to:', toEmail);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('EmailJS error:', errorText);
        return {
          success: false,
          error: `Failed to send email: ${errorText}`,
        };
      }
    } catch (error) {
      console.error('Error sending email via EmailJS:', error);
      return {
        success: false,
        error: error.message || 'Network error sending email',
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

      // Send email via API
      const sendResult = await this.sendEmailViaAPI(
        clientEmail,
        clientName,
        template.subject,
        template.body
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
        simulated: sendResult.simulated || false,
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      return {
        success: sendResult.success,
        emailId: emailRecord.id,
        simulated: sendResult.simulated,
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
        template.body
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
        simulated: sendResult.simulated || false,
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      return {
        success: sendResult.success,
        emailId: emailRecord.id,
        simulated: sendResult.simulated,
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
        template.body
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
        simulated: sendResult.simulated || false,
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      return {
        success: sendResult.success,
        emailId: emailRecord.id,
        simulated: sendResult.simulated,
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
        template.body
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
        simulated: sendResult.simulated || false,
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      return {
        success: sendResult.success,
        emailId: emailRecord.id,
        simulated: sendResult.simulated,
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
   * Check if EmailJS is configured
   */
  isConfigured() {
    return CONFIG.enabled;
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
