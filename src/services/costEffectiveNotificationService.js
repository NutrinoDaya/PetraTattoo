/**
 * Cost-Effective Notification Strategy
 * Uses free methods first, then cheap SMS as fallback
 */

export class CostEffectiveNotificationService {
  
  async sendAppointmentNotification(customerData, appointmentData) {
    const { email, phone, telegram_id, whatsapp_number, notification_preference } = customerData;
    
    // Try methods in order of cost (free first)
    
    // 1. Email (FREE)
    if (email && (notification_preference === 'email' || !notification_preference)) {
      try {
        await this.sendEmail(email, appointmentData);
        console.log('✅ Email sent (FREE)');
        return { success: true, method: 'email', cost: 0 };
      } catch (error) {
        console.log('❌ Email failed, trying next method');
      }
    }
    
    // 2. Telegram (FREE)
    if (telegram_id) {
      try {
        await this.sendTelegram(telegram_id, appointmentData);
        console.log('✅ Telegram sent (FREE)');
        return { success: true, method: 'telegram', cost: 0 };
      } catch (error) {
        console.log('❌ Telegram failed, trying next method');
      }
    }
    
    // 3. WhatsApp (1000 free/month)
    if (whatsapp_number) {
      try {
        await this.sendWhatsApp(whatsapp_number, appointmentData);
        console.log('✅ WhatsApp sent (FREE/CHEAP)');
        return { success: true, method: 'whatsapp', cost: 0.005 };
      } catch (error) {
        console.log('❌ WhatsApp failed, trying SMS');
      }
    }
    
    // 4. SMS (PAID - last resort)
    if (phone) {
      try {
        await this.sendCheapSMS(phone, appointmentData);
        console.log('💸 SMS sent (PAID)');
        return { success: true, method: 'sms', cost: 0.003 };
      } catch (error) {
        console.log('❌ All notification methods failed');
      }
    }
    
    return { success: false, method: 'none', cost: 0 };
  }
  
  async sendEmail(email, data) {
    // Use Gmail SMTP (free)
    // Implementation here...
  }
  
  async sendTelegram(telegram_id, data) {
    // Telegram Bot API (free)
    // Implementation here...
  }
  
  async sendWhatsApp(number, data) {
    // WhatsApp Business API
    // Implementation here...
  }
  
  async sendCheapSMS(phone, data) {
    // Use Fast2SMS or Textbelt
    // Implementation here...
  }
}