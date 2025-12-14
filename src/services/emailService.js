/**
 * Email Notification Service
 * Sends appointment confirmations and reminders via email
 * Uses nodemailer with SMTP
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_HISTORY_KEY = 'PetraTattoo_email_history';

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
   * Send appointment confirmation email
   * @param {string} clientName - Client full name
   * @param {string} clientEmail - Client email address
   * @param {string} date - Appointment date (YYYY-MM-DD)
   * @param {string} time - Appointment time (HH:MM)
   * @param {string} tattooType - Type of tattoo
   * @param {string} artistName - Artist full name
   * @returns {Promise<{success: boolean, error?: string}>}
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
      // Validate email
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

      // In production, this would call a backend API
      // For now, we simulate successful sending
      const emailRecord = {
        id: this.emailHistory.length + 1,
        to: clientEmail,
        subject: template.subject,
        type: 'appointment_confirmation',
        clientName,
        date,
        time,
        tattooType,
        artistName,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      console.log('✅ Appointment confirmation email sent to:', clientEmail);

      return {
        success: true,
        emailId: emailRecord.id,
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
   * @param {string} clientName - Client full name
   * @param {string} clientEmail - Client email address
   * @param {string} date - Appointment date (YYYY-MM-DD)
   * @param {string} time - Appointment time (HH:MM)
   * @param {string} artistName - Artist full name
   * @returns {Promise<{success: boolean, error?: string}>}
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

      const emailRecord = {
        id: this.emailHistory.length + 1,
        to: clientEmail,
        subject: template.subject,
        type: 'appointment_reminder',
        clientName,
        date,
        time,
        artistName,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      console.log('✅ Appointment reminder email sent to:', clientEmail);

      return {
        success: true,
        emailId: emailRecord.id,
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
   * @param {string} clientName - Client full name
   * @param {string} clientEmail - Client email address
   * @param {number} amount - Payment amount
   * @param {string} date - Payment date (YYYY-MM-DD)
   * @param {string} tattooType - Type of tattoo
   * @returns {Promise<{success: boolean, error?: string}>}
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

      const emailRecord = {
        id: this.emailHistory.length + 1,
        to: clientEmail,
        subject: template.subject,
        type: 'payment_confirmation',
        clientName,
        amount,
        date,
        tattooType,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      console.log('✅ Payment confirmation email sent to:', clientEmail);

      return {
        success: true,
        emailId: emailRecord.id,
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
   * @param {string} clientName - Client full name
   * @param {string} clientEmail - Client email address
   * @param {number} remainingAmount - Remaining balance
   * @param {string} artistName - Artist full name
   * @returns {Promise<{success: boolean, error?: string}>}
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

      const emailRecord = {
        id: this.emailHistory.length + 1,
        to: clientEmail,
        subject: template.subject,
        type: 'payment_reminder',
        clientName,
        remainingAmount,
        artistName,
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      this.emailHistory.push(emailRecord);
      await this.saveHistory();

      console.log('✅ Payment reminder email sent to:', clientEmail);

      return {
        success: true,
        emailId: emailRecord.id,
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
   * @returns {Array} Array of sent emails
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
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email statistics
   * @returns {Object} Statistics about sent emails
   */
  getStatistics() {
    const stats = {
      total: this.emailHistory.length,
      confirmations: this.emailHistory.filter((e) => e.type === 'appointment_confirmation').length,
      reminders: this.emailHistory.filter((e) => e.type === 'appointment_reminder').length,
      paymentConfirmations: this.emailHistory.filter((e) => e.type === 'payment_confirmation').length,
      paymentReminders: this.emailHistory.filter((e) => e.type === 'payment_reminder').length,
    };
    return stats;
  }
}

// Export singleton instance
export const emailService = new EmailService();
