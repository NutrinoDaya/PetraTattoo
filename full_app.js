import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { dbService } from './services/localTattooService';
import { twilioService } from './services/twilioService';
import NewAppointmentModal from './components/NewAppointmentModal';
import NewPaymentModal from './components/NewPaymentModal';
import WorkerManagementModal from './components/WorkerManagementModal';
import ClientManagementModal from './components/ClientManagementModal';
import AnalyticsScreen from './components/AnalyticsScreen';
import CustomAlert from './components/CustomAlert';
import SMSTestComponent from './components/SMSTestComponent';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [navigationStack, setNavigationStack] = useState(['dashboard']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [showWorkerManagement, setShowWorkerManagement] = useState(false);
  const [showClientManagement, setShowClientManagement] = useState(false);
  const [showSMSTest, setShowSMSTest] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedArtistFilter, setSelectedArtistFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  // Payment filters
  const [selectedPaymentArtistFilter, setSelectedPaymentArtistFilter] = useState('');
  const [selectedPaymentDateFilter, setSelectedPaymentDateFilter] = useState('');
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
  const [paymentDatePickerDate, setPaymentDatePickerDate] = useState(new Date());
  // Alert state
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  // Utility function to safely format currency values
  const formatCurrency = (value, decimals = 2) => {
    const num = parseFloat(value) || 0;
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  // Date handling functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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

  // Alert handling functions
  const showCustomAlert = (title, message, buttons = []) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  // Payment date handling functions
  const handlePaymentDateFilterChange = (event, selectedDate) => {
    setShowPaymentDatePicker(false);
    if (selectedDate) {
      setPaymentDatePickerDate(selectedDate);
      setSelectedPaymentDateFilter(selectedDate.toISOString().split('T')[0]);
    }
  };

  const clearPaymentDateFilter = () => {
    setSelectedPaymentDateFilter('');
  };

  // Initialize database on app start
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Load data when screen changes
  useEffect(() => {
    if (isLoggedIn && dbReady) {
      loadScreenData();
    }
  }, [currentScreen, isLoggedIn, dbReady, refreshTrigger]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [navigationStack]);

  const handleBackPress = () => {
    if (navigationStack.length > 1) {
      navigateBack();
      return true; // Prevent default back action
    }
    return false; // Let the app exit if at root
  };

  const navigateToScreen = (screenName) => {
    if (screenName !== currentScreen) {
      setNavigationStack(prev => [...prev, screenName]);
      setCurrentScreen(screenName);
    }
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop(); // Remove current screen
      const previousScreen = newStack[newStack.length - 1];
      setNavigationStack(newStack);
      setCurrentScreen(previousScreen);
    }
  };

  const initializeDatabase = async () => {
    try {
      await dbService.initialize();
      setDbReady(true);
      setIsLoggedIn(true); // Auto-login for now
      setNavigationStack(['dashboard']);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  };

  const loadScreenData = async () => {
    try {
      setLoading(true);

      switch (currentScreen) {
        case 'appointments':
          const appts = await dbService.getAppointments();
          setAppointments(appts);
          break;
        case 'payments':
          const pays = await dbService.getPayments();
          setPayments(pays);
          break;
        case 'crud':
          const w = await dbService.getWorkers();
          const c = await dbService.getClients();
          setWorkers(w);
          setClients(c);
          break;
        case 'analytics':
          const analytics = await dbService.getAnalytics();
          setAnalytics(analytics);
          break;
        case 'dashboard':
        default:
          const todayAppts = await dbService.getTodayAppointments();
          setAppointments(todayAppts);
          const analyticsData = await dbService.getAnalytics();
          setAnalytics(analyticsData);
          break;
      }
    } catch (error) {
      console.error('Error loading screen data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
      // Reload appointments
      loadScreenData();
      
      // Show success message
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

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAppointmentSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Navigate to appointments page after saving
    if (currentScreen !== 'appointments') {
      navigateToScreen('appointments');
    }
  };

  const handlePaymentSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Navigate to appointments page after saving payment
    if (currentScreen !== 'appointments') {
      navigateToScreen('appointments');
    }
  };

  const handleWorkerUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClientUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const login = () => {
    setIsLoggedIn(true);
    setNavigationStack(['dashboard']);
    setCurrentScreen('dashboard');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setNavigationStack(['dashboard']);
    setCurrentScreen('dashboard');
  };

  const renderLoginScreen = () => (
    <View style={styles.loginContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🎨 PetraTatoo</Text>
        <Text style={styles.subtitle}>Admin Portal</Text>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={login}>
        <Text style={styles.loginButtonText}>🔐 Login as Admin</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDashboard = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FFD700']}
          tintColor="#FFD700"
        />
      }
    >
      <Text style={styles.dashboardTitle}>🎨 PetraTatoo Admin</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
      ) : (
        <>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumber}>{appointments.length}</Text>
              <Text style={styles.statLabel}>Today's Appointments</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statNumber}>${formatCurrency(analytics?.todayRevenue, 0)}</Text>
              <Text style={styles.statLabel}>Today's Revenue</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>{analytics?.totalClients || 0}</Text>
              <Text style={styles.statLabel}>Total Clients</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎨</Text>
              <Text style={styles.statNumber}>{analytics?.totalWorkers || 0}</Text>
              <Text style={styles.statLabel}>Total Artists</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowNewAppointment(true)}
              >
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={styles.actionText}>New Appointment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowNewPayment(true)}
              >
                <Text style={styles.actionIcon}>💳</Text>
                <Text style={styles.actionText}>Record Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigateToScreen('appointments')}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionText}>View All Appointments</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigateToScreen('analytics')}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionText}>View Analytics</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.lastActionButton]}
                onPress={() => navigateToScreen('crud')}
              >
                <Text style={styles.actionIcon}>👥</Text>
                <Text style={styles.actionText}>Manage People</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderAppointments = () => {
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

    const uniqueArtists = [...new Set(appointments.map(apt => apt.artist_name))].filter(name => name);

    return (
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFD700']}
            tintColor="#FFD700"
          />
        }
      >
        <Text style={styles.screenTitle}>📅 Appointments</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowNewAppointment(true)}
        >
          <Text style={styles.buttonIcon}>➕</Text>
          <Text style={styles.primaryButtonText}>Schedule New Appointment</Text>
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

        <View style={styles.listContainer}>
          {filteredAppointments.length === 0 ? (
            <Text style={styles.emptyText}>
              {(() => {
                let message = 'No appointments';
                if (selectedArtistFilter && selectedDateFilter) {
                  message += ` for ${selectedArtistFilter} on ${formatDate(selectedDateFilter)}`;
                } else if (selectedArtistFilter) {
                  message += ` for ${selectedArtistFilter}`;
                } else if (selectedDateFilter) {
                  message += ` on ${formatDate(selectedDateFilter)}`;
                } else {
                  message += ' scheduled';
                }
                return message;
              })()}
            </Text>
          ) : (
            filteredAppointments.map((apt) => (
            <View key={apt.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentName}>{apt.customer_name}</Text>
                <Text style={styles.appointmentStatus}>{apt.status}</Text>
              </View>
              <Text style={styles.appointmentDetail}>
                Artist: {apt.artist_name}
              </Text>
              <Text style={styles.appointmentDetail}>
                Tattoo: {apt.tattoo_type}
              </Text>
              <Text style={styles.appointmentDetail}>
                Date: {apt.appointment_date} at {apt.appointment_time}
              </Text>
              <Text style={styles.appointmentDetail}>
                Price: ${formatCurrency(apt.price)}
              </Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => confirmDeleteAppointment(apt.id, apt.customer_name)}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  const renderPayments = () => {
    let filteredPayments = payments;
    
    // Apply artist filter
    if (selectedPaymentArtistFilter) {
      filteredPayments = filteredPayments.filter(payment => payment.artist_name === selectedPaymentArtistFilter);
    }
    
    // Apply date filter
    if (selectedPaymentDateFilter) {
      filteredPayments = filteredPayments.filter(payment => {
        const paymentDate = new Date(payment.created_at || payment.date);
        const filterDate = new Date(selectedPaymentDateFilter);
        return paymentDate.toDateString() === filterDate.toDateString();
      });
    }

    const uniquePaymentArtists = [...new Set(payments.map(payment => payment.artist_name))].filter(name => name);

    return (
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFD700']}
            tintColor="#FFD700"
          />
        }
      >
        <Text style={styles.screenTitle}>💳 Payments</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowNewPayment(true)}
        >
          <Text style={styles.buttonIcon}>➕</Text>
          <Text style={styles.primaryButtonText}>Record New Payment</Text>
        </TouchableOpacity>

        {/* Artist Filter */}
        {uniquePaymentArtists.length > 0 && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Artist:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterButton, !selectedPaymentArtistFilter && styles.activeFilter]}
                onPress={() => setSelectedPaymentArtistFilter('')}
              >
                <Text style={[styles.filterText, !selectedPaymentArtistFilter && styles.activeFilterText]}>
                  All Artists
                </Text>
              </TouchableOpacity>
              {uniquePaymentArtists.map((artist) => (
                <TouchableOpacity
                  key={artist}
                  style={[styles.filterButton, selectedPaymentArtistFilter === artist && styles.activeFilter]}
                  onPress={() => setSelectedPaymentArtistFilter(artist)}
                >
                  <Text style={[styles.filterText, selectedPaymentArtistFilter === artist && styles.activeFilterText]}>
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
              style={[styles.filterButton, !selectedPaymentDateFilter && styles.activeFilter]}
              onPress={clearPaymentDateFilter}
            >
              <Text style={[styles.filterText, !selectedPaymentDateFilter && styles.activeFilterText]}>
                All Dates
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedPaymentDateFilter && styles.activeFilter]}
              onPress={() => setShowPaymentDatePicker(true)}
            >
              <Text style={[styles.filterText, selectedPaymentDateFilter && styles.activeFilterText]}>
                {selectedPaymentDateFilter ? formatDate(selectedPaymentDateFilter) : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.listContainer}>
          {filteredPayments.length === 0 ? (
            <Text style={styles.emptyText}>
              {(() => {
                let message = 'No payments';
                if (selectedPaymentArtistFilter && selectedPaymentDateFilter) {
                  message += ` for ${selectedPaymentArtistFilter} on ${formatDate(selectedPaymentDateFilter)}`;
                } else if (selectedPaymentArtistFilter) {
                  message += ` for ${selectedPaymentArtistFilter}`;
                } else if (selectedPaymentDateFilter) {
                  message += ` on ${formatDate(selectedPaymentDateFilter)}`;
                } else {
                  message += ' recorded';
                }
                return message;
              })()}
            </Text>
          ) : (
            filteredPayments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentName}>{payment.customer_name}</Text>
                  <Text style={styles.paymentAmount}>${formatCurrency(payment.amount)}</Text>
                </View>
                <Text style={styles.paymentDetail}>
                  Artist: {payment.artist_name}
                </Text>
                <Text style={styles.paymentDetail}>
                  Tattoo: {payment.tattoo_type}
                </Text>
                <Text style={styles.paymentDetail}>
                  Method: {payment.payment_method}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  const renderAnalytics = () => (
    <AnalyticsScreen refreshTrigger={refreshTrigger} />
  );

  const renderCRUD = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.screenTitle}>👥 Manage People</Text>

      <View style={styles.managementContainer}>
        <TouchableOpacity
          style={styles.managementButton}
          onPress={() => setShowWorkerManagement(true)}
        >
          <Text style={styles.managementButtonIcon}>🎨</Text>
          <View style={styles.managementButtonText}>
            <Text style={styles.managementButtonTitle}>Manage Artists</Text>
            <Text style={styles.managementButtonSubtitle}>
              {workers.length} artists registered
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.managementButton}
          onPress={() => setShowClientManagement(true)}
        >
          <Text style={styles.managementButtonIcon}>👤</Text>
          <View style={styles.managementButtonText}>
            <Text style={styles.managementButtonTitle}>Manage Clients</Text>
            <Text style={styles.managementButtonSubtitle}>
              {clients.length} clients registered
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Artists List */}
      {workers.length > 0 && (
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Active Artists</Text>
          {workers.map((worker) => (
            <View key={worker.id} style={styles.personCard}>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{worker.full_name}</Text>
                <Text style={styles.personDetails}>{worker.specialties}</Text>
                <Text style={styles.personContact}>{worker.email}</Text>
                {worker.paper && (
                  <Text style={styles.personDocument}>📄 {worker.paper}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Clients List */}
      {clients.length > 0 && (
        <View style={[styles.listSection, styles.lastListSection]}>
          <Text style={styles.sectionTitle}>Registered Clients</Text>
          {clients.map((client) => (
            <View key={client.id} style={styles.personCard}>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{client.full_name}</Text>
                {client.email && (
                  <Text style={styles.personDetails}>{client.email}</Text>
                )}
                {client.phone && (
                  <Text style={styles.personDetails}>{client.phone}</Text>
                )}
                {client.paper && (
                  <TouchableOpacity onPress={() => showCustomAlert('Paper ID', client.paper, [{ text: 'OK', onPress: hideAlert }])}>
                    <Text style={[styles.personDetails, styles.paperLink]}>📄 {client.paper}</Text>
                  </TouchableOpacity>
                )}
                {client.notes && (
                  <Text style={styles.personDetails}>📝 {client.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'appointments':
        return renderAppointments();
      case 'payments':
        return renderPayments();
      case 'analytics':
        return renderAnalytics();
      case 'crud':
        return renderCRUD();
      default:
        return renderDashboard();
    }
  };

  const renderBottomTabs = () => (
    <View style={styles.bottomTabs}>
      <TouchableOpacity
        style={[styles.tab, currentScreen === 'dashboard' && styles.activeTab]}
        onPress={() => { setNavigationStack(['dashboard']); setCurrentScreen('dashboard'); }}
      >
        <Text style={styles.tabIcon}>🏠</Text>
        <Text
          style={[
            styles.tabText,
            currentScreen === 'dashboard' && styles.activeTabText,
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'appointments' && styles.activeTab]}
        onPress={() => navigateToScreen('appointments')}
      >
        <Text style={styles.tabIcon}>📅</Text>
        <Text
          style={[
            styles.tabText,
            currentScreen === 'appointments' && styles.activeTabText,
          ]}
        >
          Appointments
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'payments' && styles.activeTab]}
        onPress={() => navigateToScreen('payments')}
      >
        <Text style={styles.tabIcon}>💳</Text>
        <Text
          style={[
            styles.tabText,
            currentScreen === 'payments' && styles.activeTabText,
          ]}
        >
          Payments
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'analytics' && styles.activeTab]}
        onPress={() => navigateToScreen('analytics')}
      >
        <Text style={styles.tabIcon}>📊</Text>
        <Text
          style={[
            styles.tabText,
            currentScreen === 'analytics' && styles.activeTabText,
          ]}
        >
          Analytics
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentScreen === 'crud' && styles.activeTab]}
        onPress={() => navigateToScreen('crud')}
      >
        <Text style={styles.tabIcon}>👥</Text>
        <Text
          style={[
            styles.tabText,
            currentScreen === 'crud' && styles.activeTabText,
          ]}
        >
          People
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {!isLoggedIn ? (
          renderLoginScreen()
        ) : (
          <View style={styles.mainContent}>
            {renderCurrentScreen()}
            {renderBottomTabs()}
          </View>
        )}

        {/* Modals */}
        <NewAppointmentModal
          visible={showNewAppointment}
          onClose={() => setShowNewAppointment(false)}
          onSave={handleAppointmentSaved}
        />

        <NewPaymentModal
          visible={showNewPayment}
          onClose={() => setShowNewPayment(false)}
          onSave={handlePaymentSaved}
        />

        <WorkerManagementModal
          visible={showWorkerManagement}
          onClose={() => setShowWorkerManagement(false)}
          onUpdate={handleWorkerUpdated}
        />

        <ClientManagementModal
          visible={showClientManagement}
          onClose={() => setShowClientManagement(false)}
          onUpdate={handleClientUpdated}
        />

        <SMSTestComponent
          visible={showSMSTest}
          onClose={() => setShowSMSTest(false)}
        />

        {/* Date Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={datePickerDate}
            mode="date"
            display="default"
            onChange={handleDateFilterChange}
          />
        )}

        {showPaymentDatePicker && (
          <DateTimePicker
            value={paymentDatePickerDate}
            mode="date"
            display="default"
            onChange={handlePaymentDateFilterChange}
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
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 70,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
  },
  loginButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginVertical: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginHorizontal: 20,
    marginVertical: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  actionContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  lastActionButton: {
    marginBottom: 50,
  },
  deleteButton: {
    backgroundColor: '#cc3333',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
  },
  appointmentCard: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appointmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  appointmentStatus: {
    fontSize: 12,
    color: '#00D084',
    fontWeight: 'bold',
  },
  appointmentDetail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  paymentCard: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00D084',
  },
  paymentDetail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  managementContainer: {
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  managementButton: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  managementButtonIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  managementButtonText: {
    flex: 1,
  },
  managementButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  managementButtonSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  listSection: {
    paddingHorizontal: 15,
    marginTop: 20,
    paddingBottom: 30,
  },
  lastListSection: {
    paddingBottom: 80,
  },
  personCard: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  personDetails: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  personContact: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  personDocument: {
    fontSize: 12,
    color: '#00D084',
  },
  paperLink: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  bottomTabs: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#FFD700',
    paddingBottom: 10,
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    flex: 1,
  },
  activeTab: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 10,
    color: '#666',
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  filterLabel: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  filterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#000',
    fontWeight: 'bold',
  },,,
});

export default App;