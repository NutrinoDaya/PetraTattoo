/**
 * Background Reminder Service for Petra Tattoo
 * Uses react-native-background-fetch to run reminders even when app is closed
 * 
 * SETUP REQUIRED:
 * 1. Install: npm install react-native-background-fetch
 * 2. Link (if not auto-linked): npx react-native link react-native-background-fetch
 * 3. For Android: Add to AndroidManifest.xml (see comments below)
 */

import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { twilioService } from './twilioService';
import { dbService } from './localTattooService';

const LAST_CHECK_KEY = 'PetraTattoo_bg_last_check';

class BackgroundReminderService {
  constructor() {
    this.isConfigured = false;
  }

  /**
   * Initialize background fetch
   * Call this once when app starts
   */
  async initialize() {
    if (this.isConfigured) {
      console.log('⏰ Background reminders already configured');
      return;
    }

    try {
      // Configure background fetch
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: 60, // Check every 60 minutes (minimum allowed)
          stopOnTerminate: false,    // Continue after app is killed
          startOnBoot: true,         // Start on device reboot
          enableHeadless: true,      // Run even when app is terminated
          requiresBatteryNotLow: false,
          requiresCharging: false,
          requiresDeviceIdle: false,
          requiresStorageNotLow: false,
        },
        async (taskId) => {
          console.log('[BackgroundFetch] Task started:', taskId);
          
          // This runs in the background!
          await this.checkAndSendReminders();
          
          // Must call finish() to signal completion
          BackgroundFetch.finish(taskId);
        },
        (taskId) => {
          // Task timeout (after 30 seconds)
          console.log('[BackgroundFetch] Task timeout:', taskId);
          BackgroundFetch.finish(taskId);
        }
      );

      console.log('✅ Background reminders configured, status:', status);
      this.isConfigured = true;

      // Optional: Schedule immediate test
      // await this.scheduleTest();
      
    } catch (error) {
      console.error('❌ Failed to configure background reminders:', error);
    }
  }

  /**
   * Check for appointments and send reminders
   * This runs in the background!
   */
  async checkAndSendReminders() {
    try {
      console.log('🔍 [Background] Checking for reminders...');
      
      const now = new Date();
      const reminderStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const reminderEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const appointments = await dbService.getAllAppointments();
      let reminderCount = 0;

      for (const appointment of appointments) {
        if (appointment.reminderSent || appointment.status === 'cancelled') {
          continue;
        }

        const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);

        if (appointmentDate >= reminderStart && appointmentDate <= reminderEnd) {
          console.log(`📨 [Background] Sending reminder for: ${appointment.clientName}`);

          const result = await twilioService.sendAppointmentReminder(
            appointment.clientName,
            appointment.phoneNumber,
            appointment.date,
            appointment.time
          );

          if (result.success) {
            await dbService.updateAppointment(appointment.id, {
              ...appointment,
              reminderSent: true,
              reminderSentAt: new Date().toISOString(),
            });
            reminderCount++;
            console.log(`✅ [Background] Reminder sent to ${appointment.clientName}`);
          }
        }
      }

      await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
      
      if (reminderCount > 0) {
        console.log(`✅ [Background] Sent ${reminderCount} reminder(s)`);
      } else {
        console.log('ℹ️  [Background] No reminders needed');
      }

    } catch (error) {
      console.error('❌ [Background] Error checking reminders:', error);
    }
  }

  /**
   * Stop background tasks
   */
  async stop() {
    try {
      await BackgroundFetch.stop();
      this.isConfigured = false;
      console.log('⏹️  Background reminders stopped');
    } catch (error) {
      console.error('Error stopping background reminders:', error);
    }
  }

  /**
   * Get background fetch status
   */
  async getStatus() {
    try {
      const status = await BackgroundFetch.status();
      const statusMap = {
        [BackgroundFetch.STATUS_RESTRICTED]: 'Restricted',
        [BackgroundFetch.STATUS_DENIED]: 'Denied',
        [BackgroundFetch.STATUS_AVAILABLE]: 'Available',
      };
      return {
        status: statusMap[status] || 'Unknown',
        statusCode: status,
        isConfigured: this.isConfigured,
      };
    } catch (error) {
      return { status: 'Error', error: error.message };
    }
  }

  /**
   * Schedule a test task (for debugging)
   */
  async scheduleTest() {
    try {
      await BackgroundFetch.scheduleTask({
        taskId: 'test-reminder',
        delay: 5000, // 5 seconds from now
        periodic: false,
        forceAlarmManager: true,
      });
      console.log('🧪 Test task scheduled in 5 seconds');
    } catch (error) {
      console.error('Error scheduling test:', error);
    }
  }

  /**
   * Get last check time
   */
  async getLastCheckTime() {
    try {
      const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
      return lastCheck ? new Date(lastCheck) : null;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton
export const backgroundReminderService = new BackgroundReminderService();
export default backgroundReminderService;

/*
 * ANDROID SETUP (AndroidManifest.xml):
 * 
 * Add these permissions inside <manifest>:
 * 
 * <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
 * <uses-permission android:name="android.permission.WAKE_LOCK" />
 * 
 * 
 * IOS SETUP (Info.plist):
 * 
 * Background fetch is enabled by default. For guaranteed delivery,
 * consider using push notifications with a server.
 * 
 * 
 * USAGE IN APP.JS:
 * 
 * import { backgroundReminderService } from './services/backgroundReminderService';
 * 
 * useEffect(() => {
 *   backgroundReminderService.initialize();
 *   
 *   return () => {
 *     backgroundReminderService.stop();
 *   };
 * }, []);
 */
