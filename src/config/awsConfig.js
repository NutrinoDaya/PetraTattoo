// AWS Configuration for SNS SMS Service
// Replace with your actual AWS credentials when ready for production

export const AWS_CONFIG = {
  // Replace these with your actual AWS credentials
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',     // Your AWS Access Key ID
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',  // Your AWS Secret Access Key
  region: 'us-east-1',  // Your AWS region (us-east-1, us-west-2, etc.)
  
  // SMS Configuration
  smsConfig: {
    // SMS sending attributes
    defaultCountryCode: '+1',  // US country code
    senderID: 'PetraTatto',    // Your business name (will show as sender)
    messageType: 'Transactional',  // Transactional for appointment notifications
    
    // Cost and usage tracking
    maxDailySMS: 100,          // Safety limit: max SMS per day
    maxMonthlySMS: 500,        // Safety limit: max SMS per month
    costPerSMS: 0.00645,       // AWS SNS cost per SMS (USD)
    
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000,          // 1 second delay between retries
  }
};

// Environment validation
export const validateAWSConfig = () => {
  const required = ['accessKeyId', 'secretAccessKey', 'region'];
  const missing = required.filter(key => !AWS_CONFIG[key] || AWS_CONFIG[key].includes('EXAMPLE'));
  
  if (missing.length > 0) {
    console.warn('⚠️  AWS Config Warning: Using dummy credentials. Replace with real credentials for production.');
    console.warn('Missing or dummy values:', missing);
    return false;
  }
  
  return true;
};

// Production readiness check
export const isProductionReady = () => {
  return validateAWSConfig() && 
         !AWS_CONFIG.accessKeyId.includes('EXAMPLE') && 
         !AWS_CONFIG.secretAccessKey.includes('EXAMPLE');
};