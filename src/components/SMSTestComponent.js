/**
 * AWS SNS SMS Service Test Component
 * Use this to test SMS functionality with dummy credentials
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { smsService } from '../services/notificationService';
import { AWS_CONFIG, isProductionReady } from '../config/awsConfig';

const SMSTestComponent = ({ visible, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('+1234567890'); // Test phone number
  const [message, setMessage] = useState('Test SMS from Petra Tattoo Shop!');
  const [sending, setSending] = useState(false);

  const sendTestSMS = async () => {
    if (!phoneNumber || !message) {
      Alert.alert('Error', 'Please enter both phone number and message');
      return;
    }

    setSending(true);
    try {
      const success = await smsService.sendSMS(phoneNumber, message, 'test');
      
      if (success) {
        const isProd = isProductionReady();
        if (isProd) {
          Alert.alert('Success!', 'SMS sent successfully via AWS SNS');
        } else {
          Alert.alert('Test Complete!', 'SMS simulated successfully (using dummy credentials).\n\nReplace credentials in awsConfig.js for production.');
        }
      } else {
        Alert.alert('Failed', 'SMS sending failed. Check console logs.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setSending(false);
  };

  const showUsageStats = () => {
    const dailyUsage = smsService.dailySMSCount || 0;
    const monthlyUsage = smsService.monthlySMSCount || 0;
    const cost = monthlyUsage * AWS_CONFIG.smsConfig.costPerSMS;
    
    Alert.alert(
      'SMS Usage Stats',
      `Daily: ${dailyUsage}/${AWS_CONFIG.smsConfig.maxDailySMS}\n` +
      `Monthly: ${monthlyUsage}/${AWS_CONFIG.smsConfig.maxMonthlySMS}\n` +
      `Estimated Cost: $${cost.toFixed(3)}\n\n` +
      `Production Ready: ${isProductionReady() ? 'Yes' : 'No (using dummy credentials)'}`
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>AWS SNS SMS Test</Text>
        
        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+1234567890"
          keyboardType="phone-pad"
        />
        
        <Text style={styles.label}>Message:</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter test message"
          multiline
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={sendTestSMS}
            disabled={sending}
          >
            <Text style={styles.buttonText}>
              {sending ? 'Sending...' : 'Send Test SMS'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={showUsageStats}
          >
            <Text style={styles.buttonText}>Usage Stats</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.closeButton]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          {isProductionReady() 
            ? '✅ Using real AWS credentials' 
            : '🧪 Using dummy credentials (simulation mode)'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  infoButton: {
    backgroundColor: '#34C759',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default SMSTestComponent;