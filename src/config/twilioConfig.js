/**
 * Twilio SMS Configuration for Petra Tattoo
 * Direct Twilio integration for React Native (no backend needed)
 */

// Your Twilio credentials - REPLACE THESE WITH YOUR ACTUAL VALUES
export const TWILIO_CONFIG = {
  accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
  authToken: 'YOUR_TWILIO_AUTH_TOKEN',
  messagingServiceSid: 'YOUR_MESSAGING_SERVICE_SID',
  apiUrl: 'https://api.twilio.com/2010-04-01',
};

/**
 * Validate Twilio configuration
 */
export const validateTwilioConfig = () => {
  const { accountSid, authToken, messagingServiceSid } = TWILIO_CONFIG;
  
  if (!accountSid || accountSid === 'YOUR_ACCOUNT_SID') {
    console.warn('⚠️  Twilio Account SID not configured');
    return false;
  }
  
  if (!authToken || authToken === 'YOUR_AUTH_TOKEN') {
    console.warn('⚠️  Twilio Auth Token not configured');
    return false;
  }
  
  if (!messagingServiceSid || messagingServiceSid === 'YOUR_MESSAGING_SERVICE_SID') {
    console.warn('⚠️  Twilio Messaging Service SID not configured');
    return false;
  }
  
  return true;
};

/**
 * Check if Twilio is production ready
 */
export const isTwilioProductionReady = () => {
  return validateTwilioConfig();
};

export default TWILIO_CONFIG;
