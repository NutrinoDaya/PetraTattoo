/**
 * Twilio SMS Service for Petra Tattoo
 * Direct Twilio integration for React Native (no backend required)
 * 
 * Features:
 * - Send appointment confirmations
 * - Send appointment reminders
 * - Send payment confirmations
 * - Direct API calls to Twilio
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Try to import local config first, fallback to template
let TWILIO_CONFIG, validateTwilioConfig;
try {
  const localConfig = require('../config/twilioConfig.local.js');
  TWILIO_CONFIG = localConfig.TWILIO_CONFIG;
  validateTwilioConfig = localConfig.validateTwilioConfig;
} catch (e) {
  const defaultConfig = require('../config/twilioConfig.js');
  TWILIO_CONFIG = defaultConfig.TWILIO_CONFIG;
  validateTwilioConfig = defaultConfig.validateTwilioConfig;
}

const SMS_HISTORY_KEY = 'PetraTattoo_twilio_sms_history';
const SMS_USAGE_KEY = 'PetraTattoo_twilio_sms_usage';

class TwilioSMSService {
  constructor() {
    this.config = TWILIO_CONFIG;
    this.isConfigured = validateTwilioConfig();
    
    if (!this.isConfigured) {
      console.warn('⚠️  Twilio not configured. SMS features will be disabled.');
    } else {
      console.log('✅ Twilio SMS Service initialized');
    }
  }

  /**
   * Create Basic Auth header for Twilio API
   */
  getAuthHeader() {
    const credentials = `${this.config.accountSid}:${this.config.authToken}`;
    const base64Credentials = btoa(credentials);
    return `Basic ${base64Credentials}`;
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phone) {
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    // If already in E.164 format (starts with +), validate and return
    if (phone.startsWith('+')) {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length >= 10 && cleaned.length <= 15) {
        return '+' + cleaned;
      }
      throw new Error('Invalid international phone number format');
    }
    
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If 10 digits, assume US number
    if (cleaned.length === 10) {
      return '+1' + cleaned;
    }
    
    // If 11 digits starting with 1, it's US with country code
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return '+' + cleaned;
    }
    
    // For other lengths, require + prefix for international
    throw new Error('Please include country code with + prefix (e.g., +971 for UAE)');
  }

  /**
   * Send SMS via Twilio API
   */
  async sendSMS(to, body) {
    if (!this.isConfigured) {
      console.warn('Twilio not configured, cannot send SMS');
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const formattedPhone = this.formatPhoneNumber(to);
      
      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('To', formattedPhone);
      formData.append('Body', body);
      
      // Use MessagingServiceSid if available, otherwise use From number
      if (this.config.messagingServiceSid) {
        formData.append('MessagingServiceSid', this.config.messagingServiceSid);
      } else if (this.config.fromNumber) {
        formData.append('From', this.config.fromNumber);
      }

      const url = `${this.config.apiUrl}/Accounts/${this.config.accountSid}/Messages.json`;

      console.log(`📤 Sending SMS to ${formattedPhone}...`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ SMS sent successfully!', data.sid);
        
        // Save to history
        await this.saveSMSHistory({
          to: formattedPhone,
          body,
          sid: data.sid,
          status: data.status,
          timestamp: new Date().toISOString(),
        });

        // Update usage stats
        await this.updateUsageStats();

        return { success: true, sid: data.sid, data };
      } else {
        console.error('❌ Failed to send SMS:', data);
        
        // Parse Twilio error messages
        let errorMessage = data.message || 'Failed to send SMS';
        
        if (data.code === 21408) {
          errorMessage = 'SMS not enabled for this country. Only US numbers (+1) are supported.';
        } else if (data.code === 21211) {
          errorMessage = 'Invalid phone number format.';
        } else if (data.code === 21614) {
          errorMessage = 'Invalid phone number - number does not exist.';
        }
        
        return { success: false, error: errorMessage, code: data.code };
      }
    } catch (error) {
      console.error('❌ Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send appointment confirmation SMS
   */
  async sendAppointmentConfirmation(customerName, phone, date, time, service) {
    const message = `Hi ${customerName}! 👋

Your tattoo appointment at Petra Tattoo is confirmed:

📅 ${date}
⏰ ${time}
✨ Service: ${service}

📍 46550 Gratiot Ave, Chesterfield, MI 48051

Questions? Call us at (586) 913-7711

See you soon!
- Petra Tattoo Team`;

    return await this.sendSMS(phone, message);
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation(customerName, phone, amount, paymentType) {
    const message = `Hi ${customerName}! 💳

Payment received - Thank you!

${paymentType}: $${amount.toFixed(2)}

Your receipt has been recorded.

Questions? Call us at (586) 913-7711

- Petra Tattoo Team`;

    return await this.sendSMS(phone, message);
  }

  /**
   * Send appointment cancellation SMS
   */
  async sendCancellationNotification(customerName, phone, date, time) {
    const message = `Hi ${customerName},

Your tattoo appointment has been cancelled:

📅 ${date}
⏰ ${time}

Want to reschedule? Call us at (586) 913-7711 or book through our app!

📍 Petra Tattoo
46550 Gratiot Ave, Chesterfield, MI 48051

- Petra Tattoo Team`;

    return await this.sendSMS(phone, message);
  }

  /**
   * Save SMS to history
   */
  async saveSMSHistory(smsData) {
    try {
      const historyJSON = await AsyncStorage.getItem(SMS_HISTORY_KEY);
      const history = historyJSON ? JSON.parse(historyJSON) : [];
      
      history.unshift(smsData);
      
      // Keep only last 100 SMS in history
      if (history.length > 100) {
        history.splice(100);
      }
      
      await AsyncStorage.setItem(SMS_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving SMS history:', error);
    }
  }

  /**
   * Get SMS history
   */
  async getSMSHistory() {
    try {
      const historyJSON = await AsyncStorage.getItem(SMS_HISTORY_KEY);
      return historyJSON ? JSON.parse(historyJSON) : [];
    } catch (error) {
      console.error('Error getting SMS history:', error);
      return [];
    }
  }

  /**
   * Update usage statistics
   */
  async updateUsageStats() {
    try {
      const usageJSON = await AsyncStorage.getItem(SMS_USAGE_KEY);
      const usage = usageJSON ? JSON.parse(usageJSON) : {
        daily: 0,
        monthly: 0,
        total: 0,
        lastResetDate: new Date().toDateString(),
      };

      const today = new Date().toDateString();
      
      // Reset daily count if new day
      if (usage.lastResetDate !== today) {
        usage.daily = 0;
        usage.lastResetDate = today;
      }

      usage.daily += 1;
      usage.monthly += 1;
      usage.total += 1;

      await AsyncStorage.setItem(SMS_USAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Error updating usage stats:', error);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    try {
      const usageJSON = await AsyncStorage.getItem(SMS_USAGE_KEY);
      return usageJSON ? JSON.parse(usageJSON) : {
        daily: 0,
        monthly: 0,
        total: 0,
        lastResetDate: new Date().toDateString(),
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return { daily: 0, monthly: 0, total: 0 };
    }
  }

  /**
   * Test SMS functionality
   */
  async sendTestSMS(phone) {
    const message = '🎨 Test message from Petra Tattoo! If you received this, SMS is working perfectly!';
    return await this.sendSMS(phone, message);
  }
}

// Export singleton instance
export const twilioService = new TwilioSMSService();
export default twilioService;
