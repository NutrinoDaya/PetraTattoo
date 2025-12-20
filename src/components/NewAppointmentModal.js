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
  BackHandler,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomAlert from './CustomAlert';
import { dbService } from '../services/localTattooService';
import { emailService } from '../services/emailService';
import { colors, spacing, typography } from '../styles/theme';
import { normalize, isTablet } from '../utils/responsive';

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

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

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

  const createAppointmentWithoutEmail = async () => {
    try {
      const finalFormData = {
        ...formData,
        remaining_amount: formData.remaining_amount || updateRemainingAmount(formData.price, formData.deposit)
      };
      
      const newAppointment = await dbService.addAppointment(finalFormData);
      
      showCustomAlert('Success', 'Appointment scheduled successfully (no email sent)', [
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

    try {
      // Calculate remaining amount if not already calculated
      const finalFormData = {
        ...formData,
        remaining_amount: formData.remaining_amount || updateRemainingAmount(formData.price, formData.deposit)
      };
      
      // Send email confirmation - if it fails, still allow appointment creation
      let emailSent = false;
      if (selectedClient && selectedClient.email) {
        console.log('Sending email confirmation...');
        
        const emailResult = await emailService.sendAppointmentConfirmation(
          finalFormData.customer_name,
          selectedClient.email,
          finalFormData.appointment_date,
          finalFormData.appointment_time,
          finalFormData.tattoo_type,
          finalFormData.artist_name
        );
        
        if (emailResult.success) {
          console.log('✅ Email sent successfully');
          emailSent = true;
        } else {
          console.warn('Email sending failed (but appointment will still be created):', emailResult.error);
        }
      }
      
      // Create appointment regardless of email status
      const newAppointment = await dbService.addAppointment(finalFormData);
      
      let successMessage = 'Appointment scheduled successfully!';
      if (emailSent) {
        // Check if email was actually sent or simulated
        const isConfigured = emailService.isConfigured();
        if (isConfigured) {
          successMessage = 'Appointment scheduled and confirmation email sent!';
        } else {
          successMessage = 'Appointment scheduled! (Email requires EmailJS setup - see emailService.js)';
        }
      }
      
      showCustomAlert('Success', successMessage, [
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
          <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Schedule Appointment</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.contentContainer}>
          <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: spacing.xl }}>
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
              placeholderTextColor={colors.textMuted}
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: normalize(100) }]}
              placeholder="Design details..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              placeholderTextColor={colors.textMuted}
            />

            {/* Price */}
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 250"
              value={formData.price}
              onChangeText={handlePriceChange}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />

            {/* Deposit */}
            <Text style={styles.label}>Deposit ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100"
              value={formData.deposit}
              onChangeText={handleDepositChange}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />

            {/* Remaining Amount */}
            <Text style={styles.label}>Remaining Amount ($)</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.remaining_amount}
              editable={false}
              placeholder="Calculated automatically"
              placeholderTextColor={colors.textMuted}
            />

            {/* Client Phone */}
            <Text style={styles.label}>Client Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.customer_phone}
              onChangeText={(value) => setFormData({...formData, customer_phone: value})}
              placeholder="Enter client phone number (+1234567890)"
              placeholderTextColor={colors.textMuted}
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
              placeholderTextColor={colors.textMuted}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>📅 Schedule Appointment</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>

        {/* Client Picker Modal */}
        <Modal visible={showClientPicker} animationType="slide" presentationStyle="pageSheet">
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
        <Modal visible={showWorkerPicker} animationType="slide" presentationStyle="pageSheet">
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
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    width: isTablet() ? '70%' : '100%',
    alignSelf: 'center',
    maxWidth: 800,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  title: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: colors.primary,
  },
  cancelButton: {
    color: colors.error,
    fontSize: normalize(16),
  },
  form: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    color: colors.primary,
    fontSize: normalize(14),
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: normalize(8),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: normalize(16),
  },
  disabledInput: {
    backgroundColor: colors.background,
    borderColor: colors.textSecondary,
    color: colors.textMuted,
  },
  pickerButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: normalize(8),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  pickerButtonText: {
    color: colors.text,
    fontSize: normalize(16),
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: normalize(8),
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: '#000',
    fontSize: normalize(16),
    fontWeight: '700',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  pickerTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: colors.primary,
  },
  pickerHeaderButton: {
    color: colors.primary,
    fontSize: normalize(16),
    fontWeight: '700',
  },
  pickerItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  pickerItemText: {
    color: colors.text,
    fontSize: normalize(16),
    fontWeight: '500',
  },
  pickerItemSubtext: {
    color: colors.textMuted,
    fontSize: normalize(14),
    marginTop: spacing.xs,
  },
});

export default NewAppointmentModal;