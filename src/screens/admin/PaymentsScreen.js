import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { dbService } from '../../services/localTattooService';
import { colors, spacing } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import NewPaymentModal from '../../components/NewPaymentModal';
import CustomAlert from '../../components/CustomAlert';
import { normalize, isTablet } from '../../utils/responsive';

const PaymentsScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewPayment, setShowNewPayment] = useState(false);
  
  // Filter states
  const [selectedArtistFilter, setSelectedArtistFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  useEffect(() => {
    loadPayments();
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

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Initialize DB if needed
      if (!dbService.isReady) {
        await dbService.initialize();
      }
      const data = await dbService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      showCustomAlert('Error', 'Failed to load payments', [
        { text: 'OK', onPress: hideAlert }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const handlePaymentSaved = () => {
    loadPayments();
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

  // Filter payments
  let filteredPayments = payments;
  
  // Apply artist filter
  if (selectedArtistFilter) {
    filteredPayments = filteredPayments.filter(payment => payment.artist_name === selectedArtistFilter);
  }
  
  // Apply date filter
  if (selectedDateFilter) {
    filteredPayments = filteredPayments.filter(payment => {
      const paymentDate = new Date(payment.payment_date || payment.created_at);
      const filterDate = new Date(selectedDateFilter);
      return paymentDate.toDateString() === filterDate.toDateString();
    });
  }

  // Get unique artists for filter
  const uniqueArtists = [...new Set(payments.map(payment => payment.artist_name))].filter(name => name);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={globalStyles.container}>
      <AppHeader title="Manage Payments" />
      
      <View style={styles.contentContainer}>
        {/* Add New Payment Button */}
        <TouchableOpacity
          style={[globalStyles.button, styles.addButton]}
          onPress={() => setShowNewPayment(true)}
        >
          <Ionicons name="add" size={normalize(20)} color={colors.surface} />
          <Text style={globalStyles.buttonText}>Record New Payment</Text>
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
          {filteredPayments.length === 0 ? (
            <View style={globalStyles.emptyState}>
              <Ionicons name="card-outline" size={normalize(64)} color={colors.textMuted} />
              <Text style={globalStyles.emptyStateTitle}>No Payments</Text>
              <Text style={globalStyles.emptyStateText}>
                {(() => {
                  let message = 'No payments';
                  if (selectedArtistFilter && selectedDateFilter) {
                    message += ` for ${selectedArtistFilter} on ${formatDate(selectedDateFilter)}`;
                  } else if (selectedArtistFilter) {
                    message += ` for ${selectedArtistFilter}`;
                  } else if (selectedDateFilter) {
                    message += ` on ${formatDate(selectedDateFilter)}`;
                  } else {
                    message = 'Record your first payment to get started';
                  }
                  return message;
                })()}
              </Text>
            </View>
          ) : (
            filteredPayments.map((payment) => (
              <View key={payment.id} style={globalStyles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                      <Text style={globalStyles.cardTitle}>{payment.customer_name}</Text>
                      <Text style={[globalStyles.cardTitle, { color: colors.success }]}>
                        ${formatCurrency(payment.amount)}
                      </Text>
                    </View>
                    <Text style={globalStyles.cardSubtitle}>Artist: {payment.artist_name}</Text>
                    <Text style={globalStyles.cardText}>Tattoo: {payment.tattoo_type}</Text>
                    <Text style={globalStyles.cardText}>Method: {payment.payment_method}</Text>
                    {payment.tip_amount && parseFloat(payment.tip_amount) > 0 && (
                      <Text style={globalStyles.cardText}>Tip: ${formatCurrency(payment.tip_amount)}</Text>
                    )}
                    <Text style={globalStyles.cardText}>
                      Date: {formatDate(payment.payment_date || payment.created_at)}
                    </Text>
                    {payment.notes && (
                      <Text style={globalStyles.cardText}>Notes: {payment.notes}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
          
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </View>

      {/* New Payment Modal */}
      <NewPaymentModal
        visible={showNewPayment}
        onClose={() => setShowNewPayment(false)}
        onSave={handlePaymentSaved}
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
    width: isTablet() ? '70%' : '100%',
    alignSelf: 'center',
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

export default PaymentsScreen;
