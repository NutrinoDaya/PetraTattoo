/**
 * AWS SNS SMS Notification Service for Petra Tattoo Shop
 * Production-ready SMS service with AWS SNS integration for appointment notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { format } from 'date-fns';
import AWS from 'aws-sdk';
import 'react-native-get-random-values';
import { AWS_CONFIG, validateAWSConfig, isProductionReady } from '../config/awsConfig';
import { dbService } from './localTattooService';

const SMS_QUEUE_KEY = 'PetraTatoo_sms_queue';
const SMS_HISTORY_KEY = 'PetraTatoo_sms_history';
const REMINDER_CHECK_KEY = 'PetraTatoo_last_reminder_check';
const SMS_USAGE_KEY = 'PetraTatoo_sms_usage';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.reminderCheckInterval = null;
    this.sns = null;
    this.dailySMSCount = 0;
    this.monthlySMSCount = 0;
    this.initializeAWS();
  }

  /**
   * Initialize AWS SNS configuration
   */
  initializeAWS() {
    try {
      // Configure AWS
      AWS.config.update({
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
        region: AWS_CONFIG.region,
      });

      // Create SNS service instance
      this.sns = new AWS.SNS();

      // Validate configuration
      const isValid = validateAWSConfig();
      const isProd = isProductionReady();

      if (!isProd) {
        console.warn('🔧 AWS SNS Service - Using dummy credentials for development');
        console.warn('📝 Replace with real credentials in awsConfig.js for production');
      } else {
        console.log('✅ AWS SNS Service - Production ready');
      }

      console.log(`📡 AWS SNS initialized - Region: ${AWS_CONFIG.region}`);
    } catch (error) {
      console.error('❌ Failed to initialize AWS SNS:', error);
      Alert.alert('SMS Service Error', 'Failed to initialize SMS service. Please check configuration.');
    }
  }

  /**
   * Load SMS usage statistics
   */
  async loadSMSUsage() {
    try {
      const usage = await AsyncStorage.getItem(SMS_USAGE_KEY);
      if (usage) {
        const { dailyCount, monthlyCount, lastResetDate } = JSON.parse(usage);
        const today = new Date().toDateString();
        const thisMonth = new Date().getMonth();
        
        // Reset daily count if new day
        if (lastResetDate !== today) {
          this.dailySMSCount = 0;
        } else {
          this.dailySMSCount = dailyCount || 0;
        }

        // Reset monthly count if new month
        const lastMonth = new Date(lastResetDate).getMonth();
        if (lastMonth !== thisMonth) {
          this.monthlySMSCount = 0;
        } else {
          this.monthlySMSCount = monthlyCount || 0;
        }
      }
    } catch (error) {
      console.error('Error loading SMS usage:', error);
    }
  }

  /**
   * Save SMS usage statistics
   */
  async saveSMSUsage() {
    try {
      const usage = {
        dailyCount: this.dailySMSCount,
        monthlyCount: this.monthlySMSCount,
        lastResetDate: new Date().toDateString(),
      };
      await AsyncStorage.setItem(SMS_USAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Error saving SMS usage:', error);
    }
  }

  /**
   * Check if SMS limits are reached
   */
  canSendSMS() {
    const { maxDailySMS, maxMonthlySMS } = AWS_CONFIG.smsConfig;
    
    if (this.dailySMSCount >= maxDailySMS) {
      console.warn(`⚠️  Daily SMS limit reached: ${this.dailySMSCount}/${maxDailySMS}`);
      return false;
    }
    
    if (this.monthlySMSCount >= maxMonthlySMS) {
      console.warn(`⚠️  Monthly SMS limit reached: ${this.monthlySMSCount}/${maxMonthlySMS}`);
      return false;
    }
    
    return true;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing AWS SNS SMS Service...');
      
      // Load SMS usage statistics
      await this.loadSMSUsage();
      
      // Start reminder checking service
      await this.startReminderService();
      
      this.isInitialized = true;
      console.log('✅ AWS SNS SMS Service initialized successfully');
      
      // Log current usage stats
      console.log(`📊 SMS Usage - Daily: ${this.dailySMSCount}/${AWS_CONFIG.smsConfig.maxDailySMS}, Monthly: ${this.monthlySMSCount}/${AWS_CONFIG.smsConfig.maxMonthlySMS}`);
    } catch (error) {
      console.error('❌ Failed to initialize SMS service:', error);
      throw error;
    }
  }

  /**
   * Send appointment confirmation SMS
   * Called when a new appointment is scheduled
   */
  async sendAppointmentConfirmation(appointmentData) {
    try {
      const { customer_name, customer_phone, appointment_date, appointment_time, artist_name, tattoo_type, price, deposit } = appointmentData;
      
      if (!customer_phone) {
        console.warn('No phone number provided for appointment confirmation');
        return false;
      }

      const remainingAmount = parseFloat(price || 0) - parseFloat(deposit || 0);
      
      const message = `🎨 Appointment Confirmed - Petra Tattoo Shop

Hi ${customer_name}!

Your appointment has been scheduled:
📅 Date: ${this.formatDate(appointment_date)}
🕐 Time: ${appointment_time}
👨‍🎨 Artist: ${artist_name}
🎨 Service: ${tattoo_type}
💰 Total: $${price}
💳 Deposit: $${deposit || '0.00'}
💵 Remaining: $${remainingAmount.toFixed(2)}

We look forward to seeing you! Please arrive 10 minutes early.

Reply STOP to opt out.`;

      return await this.sendSMS(customer_phone, message, 'appointment_confirmation');
      
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      return false;
    }
  }

  /**
   * Send appointment reminder SMS
   * Called ~24 hours before appointment
   */
  async sendAppointmentReminder(appointmentData) {
    try {
      const { customer_name, customer_phone, appointment_date, appointment_time, artist_name } = appointmentData;
      
      if (!customer_phone) {
        console.warn('No phone number provided for appointment reminder');
        return false;
      }

      const message = `⏰ Reminder - Petra Tattoo Shop

Hi ${customer_name}!

Your appointment is tomorrow:
📅 Date: ${this.formatDate(appointment_date)}
🕐 Time: ${appointment_time}
👨‍🎨 Artist: ${artist_name}

Please arrive 10 minutes early. If you need to reschedule, call us ASAP.

Reply STOP to opt out.`;

      return await this.sendSMS(customer_phone, message, 'appointment_reminder');
      
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      return false;
    }
  }

  /**
   * Core SMS sending method using AWS SNS
   * Production-ready SMS sending with AWS SNS integration
   */
  async sendSMS(phoneNumber, message, type = 'general') {
    try {
      // Check if service is initialized
      if (!this.sns) {
        throw new Error('AWS SNS not initialized');
      }

      // Check SMS limits
      if (!this.canSendSMS()) {
        throw new Error('SMS limit reached');
      }

      // Validate phone number
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error(`Invalid phone number: ${phoneNumber}`);
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const smsData = {
        id: Date.now() + Math.random(),
        phoneNumber: formattedPhone,
        message,
        type,
        timestamp: new Date().toISOString(),
        status: 'pending',
        retryCount: 0
      };

      // Add to SMS queue for tracking
      await this.addToSMSQueue(smsData);

      // Check if using production credentials
      const isProd = isProductionReady();
      
      if (isProd) {
        // PRODUCTION: Send via AWS SNS
        console.log('📡 Sending SMS via AWS SNS...');
        
        const params = {
          PhoneNumber: formattedPhone,
          Message: message,
          MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: AWS_CONFIG.smsConfig.senderID
            },
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: AWS_CONFIG.smsConfig.messageType
            }
          }
        };

        const result = await this.sns.publish(params).promise();
        
        console.log('✅ SMS sent successfully via AWS SNS');
        console.log('📱 MessageId:', result.MessageId);
        
        smsData.status = 'sent';
        smsData.messageId = result.MessageId;
        smsData.sentAt = new Date().toISOString();
        
      } else {
        // DEVELOPMENT: Simulate SMS sending
        console.log('🧪 SMS SIMULATION (Development Mode):');
        console.log(`📱 To: ${formattedPhone}`);
        console.log(`📝 Type: ${type}`);
        console.log(`💬 Message: ${message}`);
        console.log('⚠️  Using dummy AWS credentials - Replace for production');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        smsData.status = 'sent';
        smsData.messageId = 'sim_' + Date.now();
        smsData.sentAt = new Date().toISOString();
      }

      // Update usage counters
      this.dailySMSCount++;
      this.monthlySMSCount++;
      await this.saveSMSUsage();

      // Add to SMS history
      await this.addToSMSHistory(smsData);
      
      // Log usage stats
      const cost = this.monthlySMSCount * AWS_CONFIG.smsConfig.costPerSMS;
      console.log(`📊 SMS Usage: Daily ${this.dailySMSCount}/${AWS_CONFIG.smsConfig.maxDailySMS}, Monthly ${this.monthlySMSCount}/${AWS_CONFIG.smsConfig.maxMonthlySMS} (~$${cost.toFixed(3)})`);
      
      return true;

    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      
      // Add to retry queue
      await this.handleSMSFailure(phoneNumber, message, type, error.message);
      return false;
    }
  }

  /**
   * Start the reminder checking service
   */
  async startReminderService() {
    try {
      // Check for reminders every hour
      this.reminderCheckInterval = setInterval(async () => {
        await this.checkAndSendReminders();
      }, 60 * 60 * 1000); // 1 hour

      // Initial check
      await this.checkAndSendReminders();
      
      console.log('Appointment reminder service started');
    } catch (error) {
      console.error('Failed to start reminder service:', error);
    }
  }

  /**
   * Check for appointments that need reminders and send them
   */
  async checkAndSendReminders() {
    try {
      const appointments = await dbService.getAppointments();
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const reminderWindow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      console.log('Checking for appointments needing reminders...');

      for (const appointment of appointments) {
        // Skip completed appointments
        if (appointment.status === 'completed') continue;

        const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
        
        // Check if appointment is in the 24-25 hour window
        if (appointmentDateTime >= tomorrow && appointmentDateTime <= reminderWindow) {
          
          // Check if we already sent a reminder for this appointment
          const alreadySent = await this.hasReminderBeenSent(appointment.id);
          if (!alreadySent) {
            console.log(`Sending reminder for appointment ${appointment.id}`);
            
            const reminderSent = await this.sendAppointmentReminder(appointment);
            if (reminderSent) {
              await this.markReminderSent(appointment.id);
            }
          }
        }
      }

      // Update last check time
      await AsyncStorage.setItem(REMINDER_CHECK_KEY, now.toISOString());
      
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  // Utility functions
  isValidPhoneNumber(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return `+${cleaned}`;
    }
    if (!cleaned.startsWith('+')) {
      return `+1${cleaned}`;
    }
    return cleaned;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async addToSMSQueue(smsData) {
    try {
      const queue = await this.getSMSQueue();
      queue.push(smsData);
      await AsyncStorage.setItem(SMS_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to SMS queue:', error);
    }
  }

  async getSMSQueue() {
    try {
      const queueData = await AsyncStorage.getItem(SMS_QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error getting SMS queue:', error);
      return [];
    }
  }

  async addToSMSHistory(smsData) {
    try {
      const history = await this.getSMSHistory();
      history.push(smsData);
      
      // Keep only last 1000 messages to prevent storage bloat
      if (history.length > 1000) {
        history.splice(0, history.length - 1000);
      }
      
      await AsyncStorage.setItem(SMS_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding to SMS history:', error);
    }
  }

  async getSMSHistory() {
    try {
      const historyData = await AsyncStorage.getItem(SMS_HISTORY_KEY);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error getting SMS history:', error);
      return [];
    }
  }

  async hasReminderBeenSent(appointmentId) {
    try {
      const history = await this.getSMSHistory();
      return history.some(sms => 
        sms.type === 'appointment_reminder' && 
        sms.appointmentId === appointmentId
      );
    } catch (error) {
      console.error('Error checking reminder history:', error);
      return false;
    }
  }

  async markReminderSent(appointmentId) {
    try {
      const reminderData = {
        appointmentId,
        sentAt: new Date().toISOString(),
        type: 'reminder_marker'
      };
      
      await this.addToSMSHistory(reminderData);
    } catch (error) {
      console.error('Error marking reminder sent:', error);
    }
  }

  async handleSMSFailure(phoneNumber, message, type, error) {
    try {
      const failureData = {
        phoneNumber,
        message,
        type,
        error,
        timestamp: new Date().toISOString(),
        status: 'failed'
      };
      
      await this.addToSMSHistory(failureData);
      console.log('SMS failure recorded for retry processing');
    } catch (error) {
      console.error('Error handling SMS failure:', error);
    }
  }

  cleanup() {
    if (this.reminderCheckInterval) {
      clearInterval(this.reminderCheckInterval);
    }
  }
}

export const smsService = new NotificationService();
export default smsService;