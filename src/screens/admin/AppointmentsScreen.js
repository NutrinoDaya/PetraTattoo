import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    artist_name: '',
    tattoo_type: '',
    description: '',
    price: '',
    date: '',
    time: '',
    duration: '120',
    status: 'upcoming',
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAppointments();
      setAppointments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setFormData({
      customer_name: '',
      customer_phone: '',
      artist_name: '',
      tattoo_type: '',
      description: '',
      price: '',
      date: '',
      time: '',
      duration: '120',
      status: 'upcoming',
    });
    setModalVisible(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      customer_name: appointment.customer_name,
      customer_phone: appointment.customer_phone,
      artist_name: appointment.artist_name,
      tattoo_type: appointment.tattoo_type,
      description: appointment.description || '',
      price: appointment.price.toString(),
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration?.toString() || '120',
      status: appointment.status,
    });
    setModalVisible(true);
  };

  const handleSaveAppointment = async () => {
    try {
      const appointmentData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };

      if (editingAppointment) {
        await apiService.updateAppointment(editingAppointment.id, appointmentData);
      } else {
        await apiService.createAppointment(appointmentData);
      }

      setModalVisible(false);
      loadAppointments();
      Alert.alert('Success', `Appointment ${editingAppointment ? 'updated' : 'created'} successfully`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save appointment');
    }
  };

  const handleDeleteAppointment = (appointment) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAppointment(appointment.id);
              loadAppointments();
              Alert.alert('Success', 'Appointment deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete appointment');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textMuted;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={globalStyles.container}>
      <AppHeader title="Manage Appointments" />
      
      <TouchableOpacity
        style={[globalStyles.button, { marginHorizontal: 20, marginBottom: 20 }]}
        onPress={handleCreateAppointment}
      >
        <Ionicons name="add" size={20} color={colors.surface} />
        <Text style={globalStyles.buttonText}>New Appointment</Text>
      </TouchableOpacity>

      <ScrollView style={{ flex: 1 }}>
        {appointments.map((appointment) => (
          <View key={appointment.id} style={globalStyles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.cardTitle}>{appointment.customer_name}</Text>
                <Text style={globalStyles.cardSubtitle}>Artist: {appointment.artist_name}</Text>
                <Text style={globalStyles.cardText}>Type: {appointment.tattoo_type}</Text>
                <Text style={globalStyles.cardText}>Date: {formatDate(appointment.date)} at {appointment.time}</Text>
                <Text style={globalStyles.cardText}>Price: ${appointment.price}</Text>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginTop: 5 
                }}>
                  <View style={[
                    globalStyles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) }
                  ]}>
                    <Text style={globalStyles.statusText}>{appointment.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => handleEditAppointment(appointment)}
                  style={[globalStyles.iconButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="create" size={16} color={colors.surface} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleDeleteAppointment(appointment)}
                  style={[globalStyles.iconButton, { backgroundColor: colors.error }]}
                >
                  <Ionicons name="trash" size={16} color={colors.surface} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        
        {appointments.length === 0 && (
          <View style={globalStyles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={globalStyles.emptyStateTitle}>No Appointments</Text>
            <Text style={globalStyles.emptyStateText}>
              Create your first appointment to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Appointment Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={globalStyles.container}>
          <AppHeader 
            title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
            showBack
            onBack={() => setModalVisible(false)}
          />
          
          <ScrollView style={{ padding: 20 }}>
            <TextInput
              style={globalStyles.input}
              placeholder="Customer Name"
              placeholderTextColor={colors.textMuted}
              value={formData.customer_name}
              onChangeText={(text) => setFormData({ ...formData, customer_name: text })}
            />
            
            <TextInput
              style={globalStyles.input}
              placeholder="Customer Phone"
              placeholderTextColor={colors.textMuted}
              value={formData.customer_phone}
              onChangeText={(text) => setFormData({ ...formData, customer_phone: text })}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={globalStyles.input}
              placeholder="Artist Name"
              placeholderTextColor={colors.textMuted}
              value={formData.artist_name}
              onChangeText={(text) => setFormData({ ...formData, artist_name: text })}
            />
            
            <TextInput
              style={globalStyles.input}
              placeholder="Tattoo Type"
              placeholderTextColor={colors.textMuted}
              value={formData.tattoo_type}
              onChangeText={(text) => setFormData({ ...formData, tattoo_type: text })}
            />
            
            <TextInput
              style={[globalStyles.input, { height: 80 }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textMuted}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              textAlignVertical="top"
            />
            
            <TextInput
              style={globalStyles.input}
              placeholder="Price"
              placeholderTextColor={colors.textMuted}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={globalStyles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={colors.textMuted}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />
            
            <TextInput
              style={globalStyles.input}
              placeholder="Time (HH:MM)"
              placeholderTextColor={colors.textMuted}
              value={formData.time}
              onChangeText={(text) => setFormData({ ...formData, time: text })}
            />
            
            <TextInput
              style={globalStyles.input}
              placeholder="Duration (minutes)"
              placeholderTextColor={colors.textMuted}
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
              keyboardType="numeric"
            />
            
            <View style={{ marginBottom: 20 }}>
              <Text style={[globalStyles.cardText, { marginBottom: 10 }]}>Status:</Text>
              {['upcoming', 'completed', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    globalStyles.radioOption,
                    formData.status === status && globalStyles.radioOptionSelected
                  ]}
                  onPress={() => setFormData({ ...formData, status })}
                >
                  <Text style={[
                    globalStyles.radioText,
                    formData.status === status && globalStyles.radioTextSelected
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={globalStyles.button}
              onPress={handleSaveAppointment}
            >
              <Text style={globalStyles.buttonText}>
                {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.secondaryButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[globalStyles.buttonText, globalStyles.secondaryButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default AppointmentsScreen;