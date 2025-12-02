import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import CustomAlert from './CustomAlert';
import { dbService } from '../services/localTattooService';

const NewPaymentModal = ({ visible, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    worker_id: '',
    appointment_id: '',
    customer_name: '',
    artist_name: '',
    tattoo_type: '',
    amount: '',
    payment_method: 'cash',
    tip_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showWorkerPicker, setShowWorkerPicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  const showCustomAlert = (title, message, buttons = []) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const w = await dbService.getWorkers();
      const c = await dbService.getClients();
      const a = await dbService.getAppointments();
      setWorkers(w);
      setClients(c);
      setAppointments(a);
    } catch (error) {
      console.error('Error loading data:', error);
      showCustomAlert('Error', 'Failed to load data');
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
    setFormData({
      ...formData,
      client_id: client.id,
      customer_name: client.full_name,
    });
    setShowClientPicker(false);
  };

  const handleAppointmentSelect = (appointment) => {
    setSelectedAppointment(appointment);
    
    // Find the worker and client from the appointment
    const worker = workers.find(w => w.full_name === appointment.artist_name);
    const client = clients.find(c => c.full_name === appointment.customer_name);
    
    // Update selected states
    setSelectedWorker(worker || null);
    setSelectedClient(client || null);
    
    setFormData({
      ...formData,
      appointment_id: appointment.id,
      worker_id: worker ? worker.id : '',
      client_id: client ? client.id : '',
      customer_name: appointment.customer_name,
      artist_name: appointment.artist_name,
      tattoo_type: appointment.tattoo_type,
      amount: appointment.price ? appointment.price.toString() : '',
    });
    setShowAppointmentPicker(false);
  };

  const handleSave = async () => {
    if (!formData.appointment_id) {
      showCustomAlert('Validation Error', 'Please select an appointment', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return;
    }
    
    if (!formData.client_id || !formData.worker_id || !formData.tattoo_type || !formData.amount) {
      showCustomAlert('Validation Error', 'Please fill all required fields', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return;
    }

    try {
      // Add the payment
      await dbService.addPayment(formData);
      
      // Update appointment status to 'completed'
      await dbService.updateAppointmentStatus(formData.appointment_id, 'completed');
      
      showCustomAlert('Success', 'Payment recorded successfully and appointment marked as completed', [
        { text: 'OK', onPress: () => { hideAlert(); onSave(); resetForm(); onClose(); } }
      ]);
    } catch (error) {
      console.error('Error saving payment:', error);
      showCustomAlert('Error', 'Failed to save payment', [
        { text: 'OK', onPress: hideAlert }
      ]);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      worker_id: '',
      appointment_id: '',
      customer_name: '',
      artist_name: '',
      tattoo_type: '',
      amount: '',
      payment_method: 'cash',
      tip_amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setSelectedWorker(null);
    setSelectedClient(null);
    setSelectedAppointment(null);
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
          <Text style={styles.title}>Record Payment</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.form}>
          {/* Quick Select from Appointment */}
          <Text style={styles.label}>Select from Appointment (Optional)</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowAppointmentPicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {selectedAppointment
                ? `${selectedAppointment.customer_name} - ${selectedAppointment.tattoo_type}`
                : 'Choose Appointment'}
            </Text>
          </TouchableOpacity>

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

          {/* Amount */}
          <Text style={styles.label}>Amount ($) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 250"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />

          {/* Tip */}
          <Text style={styles.label}>Tip ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 20"
            value={formData.tip_amount}
            onChangeText={(text) => setFormData({ ...formData, tip_amount: text })}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />

          {/* Payment Method */}
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.methodContainer}>
            {['cash', 'card', 'transfer'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodButton,
                  formData.payment_method === method && styles.methodButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, payment_method: method })}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    formData.payment_method === method && styles.methodButtonTextActive,
                  ]}
                >
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>



          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Additional notes..."
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            placeholderTextColor="#999"
          />

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>💳 Record Payment</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Appointment Picker Modal */}
        <Modal visible={showAppointmentPicker} animationType="slide">
          <SafeAreaView style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowAppointmentPicker(false)}>
                <Text style={styles.pickerHeaderButton}>Done</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Appointment</Text>
              <View style={{ width: 60 }} />
            </View>
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => handleAppointmentSelect(item)}
                >
                  <Text style={styles.pickerItemText}>{item.customer_name}</Text>
                  <Text style={styles.pickerItemSubtext}>
                    {item.tattoo_type} - ${item.price}
                  </Text>
                  <Text style={styles.pickerItemSubtext}>with {item.artist_name}</Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>

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

        {/* Custom Alert */}
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
  methodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  methodButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#2a2a2a',
  },
  methodButtonActive: {
    backgroundColor: '#FFD700',
  },
  methodButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  methodButtonTextActive: {
    color: '#000',
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

export default NewPaymentModal;