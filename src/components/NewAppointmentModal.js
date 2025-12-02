import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomAlert from './CustomAlert';
import { dbService } from '../services/localTattooService';
import { twilioService } from '../services/twilioService';

const NewAppointmentModal = ({ visible, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    worker_id: '',
    customer_name: '',
    customer_phone: '',
    artist_name: '',
    tattoo_type: '',
    description: '',
    price: '',
    deposit: '',
    remaining_amount: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '14:00',
    duration: '120',
    status: 'scheduled',
  });

  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showWorkerPicker, setShowWorkerPicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const showCustomAlert = (title, message, buttons = []) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  const loadData = async () => {
    try {
      const w = await dbService.getWorkers();
      const c = await dbService.getClients();
      setWorkers(w);
      setClients(c);
    } catch (error) {
      console.error('Error loading data:', error);
      showCustomAlert('Error', 'Failed to load workers and clients', [
        { text: 'OK', onPress: hideAlert }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSelect = (worker) => {
    setSelectedWorker(worker);
    setFormData({
      ...formData,
      worker_id: worker.id,
      artist_name: worker.full_name,
    });
    setShowWorkerPicker(false);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    
    // Ensure phone number has + prefix
    let phoneNumber = client.phone || '';
    if (phoneNumber && !phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber.replace(/\D/g, '');
    }
    
    setFormData({
      ...formData,
      client_id: client.id,
      customer_name: client.full_name,
      customer_phone: phoneNumber,
    });
    setShowClientPicker(false);
  };

  const handleDateChange = (event, date) => {
    if (date) {
      setFormData({
        ...formData,
        appointment_date: date.toISOString().split('T')[0],
      });
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, date) => {
    if (date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      setFormData({
        ...formData,
        appointment_time: `${hours}:${minutes}`,
      });
    }
    setShowTimePicker(false);
  };

  // Calculate remaining amount when price or deposit changes
  const updateRemainingAmount = (price, deposit) => {
    const priceValue = parseFloat(price) || 0;
    const depositValue = parseFloat(deposit) || 0;
    const remaining = Math.max(0, priceValue - depositValue);
    return remaining.toFixed(2);
  };

  const handlePriceChange = (price) => {
    const remaining = updateRemainingAmount(price, formData.deposit);
    setFormData({
      ...formData,
      price,
      remaining_amount: remaining,
    });
  };

  const handleDepositChange = (deposit) => {
    const remaining = updateRemainingAmount(formData.price, deposit);
    setFormData({
      ...formData,
      deposit,
      remaining_amount: remaining,
    });
  };

  const createAppointmentWithoutSMS = async () => {
    try {
      const finalFormData = {
        ...formData,
        remaining_amount: formData.remaining_amount || updateRemainingAmount(formData.price, formData.deposit)
      };
      
      const newAppointment = await dbService.addAppointment(finalFormData);
      
      showCustomAlert('Success', 'Appointment scheduled successfully (no SMS sent)', [
        { text: 'OK', onPress: () => { hideAlert(); onSave(); resetForm(); onClose(); } }
      ]);
    } catch (error) {
      console.error('Error saving appointment:', error);
      showCustomAlert('Error', 'Failed to save appointment', [
        { text: 'OK', onPress: hideAlert }
      ]);
    }
  };

  const handleSave = async () => {
    if (!formData.client_id || !formData.worker_id || !formData.tattoo_type || !formData.price) {
      showCustomAlert('Validation Error', 'Please fill all required fields', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return;
    }

    // Validate phone number format
    if (formData.customer_phone) {
      if (!formData.customer_phone.startsWith('+')) {
        showCustomAlert(
          'Invalid Phone Number',
          'Phone number must include country code with + prefix.\n\nExample:\n+1 555-123-4567 (US)\n+971 55-379-0079 (UAE)',
          [{ text: 'OK', onPress: hideAlert }]
        );
        return;
      }
      
      // Check if it's a US number (Twilio SMS restriction)
      const cleaned = formData.customer_phone.replace(/\D/g, '');
      if (!cleaned.startsWith('1') || cleaned.length !== 11) {
        showCustomAlert(
          'SMS Not Available',
          'SMS confirmations are currently only available for US phone numbers (+1).\n\nFor international clients, please confirm appointments via WhatsApp or call.\n\nDo you want to continue without SMS?',
          [
            { text: 'Cancel', onPress: hideAlert },
            { 
              text: 'Continue Without SMS', 
              onPress: () => {
                hideAlert();
                createAppointmentWithoutSMS();
              }
            }
          ]
        );
        return;
      }
    }

    try {
      // Calculate remaining amount if not already calculated
      const finalFormData = {
        ...formData,
        remaining_amount: formData.remaining_amount || updateRemainingAmount(formData.price, formData.deposit)
      };
      
      // Send SMS confirmation FIRST - must succeed before creating appointment
      if (finalFormData.customer_phone) {
        console.log('Sending SMS confirmation...');
        
        const smsResult = await twilioService.sendAppointmentConfirmation(
          finalFormData.customer_name,
          finalFormData.customer_phone,
          finalFormData.appointment_date,
          finalFormData.appointment_time,
          finalFormData.tattoo_type
        );
        
        if (!smsResult.success) {
          // SMS failed - do not create appointment
          console.error('SMS Error:', smsResult.error);
          showCustomAlert(
            'SMS Failed', 
            `Cannot schedule appointment. SMS delivery failed: ${smsResult.error || 'Unknown error'}\n\nPlease verify the phone number is correct and try again.`,
            [{ text: 'OK', onPress: hideAlert }]
          );
          return;
        }
        
        console.log('✅ SMS sent successfully');
      }
      
      // SMS succeeded (or no phone provided) - now create appointment
      const newAppointment = await dbService.addAppointment(finalFormData);
      
      showCustomAlert('Success', 'Appointment scheduled successfully and SMS confirmation sent!', [
        { text: 'OK', onPress: () => { hideAlert(); onSave(); resetForm(); onClose(); } }
      ]);
    } catch (error) {
      console.error('Error saving appointment:', error);
      showCustomAlert('Error', 'Failed to save appointment', [
        { text: 'OK', onPress: hideAlert }
      ]);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      worker_id: '',
      customer_name: '',
      customer_phone: '',
      artist_name: '',
      tattoo_type: '',
      description: '',
      price: '',
      deposit: '',
      remaining_amount: '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '14:00',
      duration: '120',
      status: 'scheduled',
    });
    setSelectedWorker(null);
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#FFD700" />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Schedule Appointment</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.form}>
          {/* Client Selection */}
          <Text style={styles.label}>Select Client *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowClientPicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {selectedClient ? selectedClient.full_name : 'Choose Client'}
            </Text>
          </TouchableOpacity>

          {/* Worker Selection */}
          <Text style={styles.label}>Select Artist *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowWorkerPicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {selectedWorker ? selectedWorker.full_name : 'Choose Artist'}
            </Text>
          </TouchableOpacity>

          {/* Tattoo Type */}
          <Text style={styles.label}>Tattoo Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Black & Gray Sleeve"
            value={formData.tattoo_type}
            onChangeText={(text) => setFormData({ ...formData, tattoo_type: text })}
            placeholderTextColor="#999"
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Design details..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            placeholderTextColor="#999"
          />

          {/* Price */}
          <Text style={styles.label}>Price ($) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 250"
            value={formData.price}
            onChangeText={handlePriceChange}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />

          {/* Deposit */}
          <Text style={styles.label}>Deposit ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 100"
            value={formData.deposit}
            onChangeText={handleDepositChange}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />

          {/* Remaining Amount */}
          <Text style={styles.label}>Remaining Amount ($)</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.remaining_amount}
            editable={false}
            placeholder="Calculated automatically"
            placeholderTextColor="#666"
          />

          {/* Client Phone */}
          <Text style={styles.label}>Client Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.customer_phone}
            onChangeText={(value) => setFormData({...formData, customer_phone: value})}
            placeholder="Enter client phone number (+1234567890)"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
          />

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerButtonText}>{formData.appointment_date}</Text>
          </TouchableOpacity>

          {/* Time */}
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.pickerButtonText}>{formData.appointment_time}</Text>
          </TouchableOpacity>

          {/* Duration */}
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="120"
            value={formData.duration}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>📅 Schedule Appointment</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Client Picker Modal */}
        <Modal visible={showClientPicker} animationType="slide">
          <SafeAreaView style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowClientPicker(false)}>
                <Text style={styles.pickerHeaderButton}>Done</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Client</Text>
              <View style={{ width: 60 }} />
            </View>
            <FlatList
              data={clients}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => handleClientSelect(item)}
                >
                  <Text style={styles.pickerItemText}>{item.full_name}</Text>
                  {item.email && (
                    <Text style={styles.pickerItemSubtext}>{item.email}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>

        {/* Worker Picker Modal */}
        <Modal visible={showWorkerPicker} animationType="slide">
          <SafeAreaView style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowWorkerPicker(false)}>
                <Text style={styles.pickerHeaderButton}>Done</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Artist</Text>
              <View style={{ width: 60 }} />
            </View>
            <FlatList
              data={workers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => handleWorkerSelect(item)}
                >
                  <Text style={styles.pickerItemText}>{item.full_name}</Text>
                  <Text style={styles.pickerItemSubtext}>{item.specialties}</Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date(formData.appointment_date)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={new Date(`2024-01-01T${formData.appointment_time}`)}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  cancelButton: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#1a1a1a',
    borderColor: '#666',
    color: '#999',
  },
  pickerButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  pickerHeaderButton: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pickerItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  pickerItemSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
});

export default NewAppointmentModal;