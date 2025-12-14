/**
 * Email Notification Service for Petra Tattoo Shop
 * Sends appointment and payment notifications via email
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { emailService } from './emailService';

const NOTIFICATION_QUEUE_KEY = 'PetraTattoo_notification_queue';
const NOTIFICATION_HISTORY_KEY = 'PetraTattoo_notification_history';

class NotificationService {
  constructor() {
    this.isInitialized = true;
    this.notificationQueue = [];
    this.loadQueue();
  }

  async loadQueue() {
    try {
      const queue = await AsyncStorage.getItem(NOTIFICATION_QUEUE_KEY);
      this.notificationQueue = queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error loading notification queue:', error);
    }
  }

  async saveQueue() {
    try {
      await AsyncStorage.setItem(NOTIFICATION_QUEUE_KEY, JSON.stringify(this.notificationQueue));
    } catch (error) {
      console.error('Error saving notification queue:', error);
    }
  }

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(clientName, clientEmail, date, time, tattooType, artistName) {
    return await emailService.sendAppointmentConfirmation(
      clientName,
      clientEmail,
      date,
      time,
      tattooType,
      artistName
    );
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(clientName, clientEmail, date, time, artistName) {
    return await emailService.sendAppointmentReminder(clientName, clientEmail, date, time, artistName);
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(clientName, clientEmail, amount, date, tattooType) {
    return await emailService.sendPaymentConfirmation(clientName, clientEmail, amount, date, tattooType);
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(clientName, clientEmail, remainingAmount, artistName) {
    return await emailService.sendPaymentReminder(clientName, clientEmail, remainingAmount, artistName);
  }

  /**
   * Get notification history
   */
  getHistory() {
    return emailService.getEmailHistory();
  }

  /**
   * Get notification statistics
   */
  getStatistics() {
    return emailService.getStatistics();
  }

  /**
   * Clear notification history
   */
  async clearHistory() {
    return await emailService.clearHistory();
  }
}

// Export singleton instance
export const smsService = new NotificationService();
export const notificationService = new NotificationService();
