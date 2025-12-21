import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { dbService } from '../../services/localTattooService';
import { colors, spacing } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import NewAppointmentModal from '../../components/NewAppointmentModal';
import CustomAlert from '../../components/CustomAlert';
import { normalize } from '../../utils/responsive';

const AppointmentsScreen = () => {
  // Dynamic responsive values
  const { width, height } = useWindowDimensions();
  const isTabletLayout = width >= 768;
  const isLandscape = width > height;
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  
  // Filter states
  const [selectedArtistFilter, setSelectedArtistFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  useEffect(() => {
    loadAppointments();
  }, []);

  // Utility function to safely format currency
  const formatCurrency = (value, decimals = 2) => {
    const num = parseFloat(value) || 0;
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  // Date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Alert handling functions
  const showCustomAlert = (title, message, buttons = []) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // Initialize DB if needed
      if (!dbService.isReady) {
        await dbService.initialize();
      }
      const data = await dbService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      showCustomAlert('Error', 'Failed to load appointments', [
        { text: 'OK', onPress: hideAlert }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const handleAppointmentSaved = () => {
    loadAppointments();
  };

  // Date filter handlers
  const handleDateFilterChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      setSelectedDateFilter(selectedDate.toISOString().split('T')[0]);
    }
  };

  const clearDateFilter = () => {
    setSelectedDateFilter('');
  };

  // Delete appointment
  const confirmDeleteAppointment = (appointmentId, customerName) => {
    showCustomAlert(
      'Delete Appointment', 
      `Are you sure you want to delete the appointment for ${customerName}?\n\nThis action cannot be undone.`, 
      [
        { text: 'Cancel', onPress: hideAlert, style: 'cancel' },
        { text: 'Delete', onPress: () => { hideAlert(); deleteAppointment(appointmentId); }, style: 'destructive' }
      ]
    );
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      await dbService.deleteAppointment(appointmentId);
      loadAppointments();
      showCustomAlert('Success', 'Appointment deleted successfully', [
        { text: 'OK', onPress: hideAlert }
      ]);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showCustomAlert('Error', 'Failed to delete appointment. Please try again.', [
        { text: 'OK', onPress: hideAlert }
      ]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return colors.primary;
      case 'upcoming': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textMuted;
    }
  };

  // Filter appointments
  let filteredAppointments = appointments;
  
  // Filter out completed appointments - only show scheduled appointments
  filteredAppointments = filteredAppointments.filter(apt => apt.status !== 'completed');
  
  // Apply artist filter
  if (selectedArtistFilter) {
    filteredAppointments = filteredAppointments.filter(apt => apt.artist_name === selectedArtistFilter);
  }
  
  // Apply date filter
  if (selectedDateFilter) {
    filteredAppointments = filteredAppointments.filter(apt => {
      const appointmentDate = new Date(apt.appointment_date);
      const filterDate = new Date(selectedDateFilter);
      return appointmentDate.toDateString() === filterDate.toDateString();
    });
  }

  // Get unique artists for filter
  const uniqueArtists = [...new Set(appointments.map(apt => apt.artist_name))].filter(name => name);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={globalStyles.container}>
      <AppHeader title="Manage Appointments" />
      
      <View style={[
        styles.contentContainer,
        isTabletLayout && styles.contentContainerTablet,
      ]}>
        {/* Add New Appointment Button */}
        <TouchableOpacity
          style={[globalStyles.button, styles.addButton]}
          onPress={() => setShowNewAppointment(true)}
        >
          <Ionicons name="add" size={normalize(20)} color={colors.surface} />
          <Text style={globalStyles.buttonText}>Schedule New Appointment</Text>
        </TouchableOpacity>

        {/* Artist Filter */}
        {uniqueArtists.length > 0 && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Artist:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterButton, !selectedArtistFilter && styles.activeFilter]}
                onPress={() => setSelectedArtistFilter('')}
              >
                <Text style={[styles.filterText, !selectedArtistFilter && styles.activeFilterText]}>
                  All Artists
                </Text>
              </TouchableOpacity>
              {uniqueArtists.map((artist) => (
                <TouchableOpacity
                  key={artist}
                  style={[styles.filterButton, selectedArtistFilter === artist && styles.activeFilter]}
                  onPress={() => setSelectedArtistFilter(artist)}
                >
                  <Text style={[styles.filterText, selectedArtistFilter === artist && styles.activeFilterText]}>
                    {artist}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Date Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Date:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterButton, !selectedDateFilter && styles.activeFilter]}
              onPress={clearDateFilter}
            >
              <Text style={[styles.filterText, !selectedDateFilter && styles.activeFilterText]}>
                All Dates
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedDateFilter && styles.activeFilter]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.filterText, selectedDateFilter && styles.activeFilterText]}>
                {selectedDateFilter ? formatDate(selectedDateFilter) : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {filteredAppointments.length === 0 ? (
            <View style={globalStyles.emptyState}>
              <Ionicons name="calendar-outline" size={normalize(64)} color={colors.textMuted} />
              <Text style={globalStyles.emptyStateTitle}>No Appointments</Text>
              <Text style={globalStyles.emptyStateText}>
                {(() => {
                  let message = 'No appointments';
                  if (selectedArtistFilter && selectedDateFilter) {
                    message += ` for ${selectedArtistFilter} on ${formatDate(selectedDateFilter)}`;
                  } else if (selectedArtistFilter) {
                    message += ` for ${selectedArtistFilter}`;
                  } else if (selectedDateFilter) {
                    message += ` on ${formatDate(selectedDateFilter)}`;
                  } else {
                    message = 'Create your first appointment to get started';
                  }
                  return message;
                })()}
              </Text>
            </View>
          ) : (
            filteredAppointments.map((appointment) => (
              <View key={appointment.id} style={globalStyles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={globalStyles.cardTitle}>{appointment.customer_name}</Text>
                    <Text style={globalStyles.cardSubtitle}>Artist: {appointment.artist_name}</Text>
                    <Text style={globalStyles.cardText}>Type: {appointment.tattoo_type}</Text>
                    <Text style={globalStyles.cardText}>
                      Date: {formatDate(appointment.appointment_date)} at {appointment.appointment_time}
                    </Text>
                    <Text style={globalStyles.cardText}>Price: ${formatCurrency(appointment.price)}</Text>
                    {appointment.deposit && parseFloat(appointment.deposit) > 0 && (
                      <Text style={globalStyles.cardText}>
                        Deposit: ${formatCurrency(appointment.deposit)} | Remaining: ${formatCurrency(appointment.remaining_amount)}
                      </Text>
                    )}
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      marginTop: spacing.xs 
                    }}>
                      <View style={[
                        globalStyles.statusBadge,
                        { backgroundColor: getStatusColor(appointment.status) }
                      ]}>
                        <Text style={globalStyles.statusText}>{(appointment.status || 'scheduled').toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => confirmDeleteAppointment(appointment.id, appointment.customer_name)}
                    style={[globalStyles.iconButton, { backgroundColor: colors.error }]}
                  >
                    <Ionicons name="trash" size={normalize(16)} color={colors.surface} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </View>

      {/* New Appointment Modal */}
      <NewAppointmentModal
        visible={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        onSave={handleAppointmentSaved}
      />

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerDate}
          mode="date"
          display="default"
          onChange={handleDateFilterChange}
        />
      )}

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  contentContainerTablet: {
    width: '85%',
    maxWidth: 900,
  },
  addButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: normalize(14),
    color: colors.primary,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: normalize(20),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontSize: normalize(12),
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.surface,
    fontWeight: '700',
  },
});

export default AppointmentsScreen;
