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
import { globalStyles } from '../../styles/globalStyles';
import { colors, spacing } from '../../styles/theme';
import { normalize, isTablet } from '../../utils/responsive';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import NewAppointmentModal from '../../components/NewAppointmentModal';
import NewPaymentModal from '../../components/NewPaymentModal';
import WorkerManagementModal from '../../components/WorkerManagementModal';
import { dbService } from '../../services/localTattooService';

const AdminDashboard = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    todayAppointmentsCount: 0,
    totalClients: 0,
    totalArtists: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [showWorkerManagement, setShowWorkerManagement] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Initialize DB if needed
      if (!dbService.isReady) {
        await dbService.initialize();
      }
      
      const analytics = await dbService.getAnalytics();
      const todayAppts = await dbService.getTodayAppointments();
      
      setDashboardData({
        todayRevenue: analytics.todayRevenue,
        monthlyRevenue: analytics.monthlyRevenue,
        todayAppointmentsCount: analytics.todayAppointmentsCount,
        totalClients: analytics.totalClients,
        totalArtists: analytics.totalWorkers,
      });
      setTodayAppointments(todayAppts);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleAppointmentSaved = () => {
    loadDashboardData();
    navigation.navigate('Appointments');
  };

  const handlePaymentSaved = () => {
    loadDashboardData();
    navigation.navigate('Payments');
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <AppHeader 
        title="Admin Dashboard" 
        subtitle="Shop Overview & Analytics"
      />
      <ScrollView
        style={globalStyles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="cash" size={normalize(24)} color={colors.primary} />
                <Text style={styles.statValue}>{formatCurrency(dashboardData.monthlyRevenue)}</Text>
                <Text style={styles.statLabel}>Monthly Revenue</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="today" size={normalize(24)} color={colors.secondary} />
                <Text style={styles.statValue}>{formatCurrency(dashboardData.todayRevenue)}</Text>
                <Text style={styles.statLabel}>Today Revenue</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="calendar" size={normalize(24)} color={colors.success} />
                <Text style={styles.statValue}>{dashboardData.todayAppointmentsCount}</Text>
                <Text style={styles.statLabel}>Today Appts</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="people" size={normalize(24)} color={colors.warning} />
                <Text style={styles.statValue}>{dashboardData.totalClients}</Text>
                <Text style={styles.statLabel}>Total Clients</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowNewAppointment(true)}
            >
              <Ionicons name="add-circle" size={normalize(24)} color={colors.primary} />
              <Text style={styles.actionText}>New Appointment</Text>
              <Ionicons name="chevron-forward" size={normalize(20)} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowNewPayment(true)}
            >
              <Ionicons name="card" size={normalize(24)} color={colors.secondary} />
              <Text style={styles.actionText}>Record Payment</Text>
              <Ionicons name="chevron-forward" size={normalize(20)} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Ionicons name="calendar-outline" size={normalize(24)} color={colors.success} />
              <Text style={styles.actionText}>View All Appointments</Text>
              <Ionicons name="chevron-forward" size={normalize(20)} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Ionicons name="bar-chart" size={normalize(24)} color={colors.warning} />
              <Text style={styles.actionText}>View Analytics</Text>
              <Ionicons name="chevron-forward" size={normalize(20)} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('WorkerManagement')}
            >
              <Ionicons name="people-outline" size={normalize(24)} color={colors.primary} />
              <Text style={styles.actionText}>Manage People</Text>
              <Ionicons name="chevron-forward" size={normalize(20)} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Today Appointments Preview */}
          {todayAppointments.length > 0 && (
            <View style={styles.todaySection}>
              <Text style={styles.sectionTitle}>Today Appointments</Text>
              {todayAppointments.slice(0, 3).map((apt) => (
                <View key={apt.id} style={styles.appointmentPreview}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentName}>{apt.customer_name}</Text>
                    <Text style={styles.appointmentDetail}>
                      {apt.appointment_time} - {apt.artist_name}
                    </Text>
                  </View>
                  <Text style={styles.appointmentStatus}>{apt.status}</Text>
                </View>
              ))}
              {todayAppointments.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('Appointments')}
                >
                  <Text style={styles.viewAllText}>
                    View All ({todayAppointments.length} appointments)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{ height: spacing.xl * 2 }} />
        </View>
      </ScrollView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    width: isTablet() ? '70%' : '100%',
    alignSelf: 'center',
    paddingTop: spacing.lg,
  },
  statsContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 0.48,
    backgroundColor: colors.card,
    borderRadius: normalize(16),
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: normalize(12),
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  actionText: {
    flex: 1,
    fontSize: normalize(16),
    fontWeight: '500',
    color: colors.text,
    marginLeft: spacing.md,
  },
  todaySection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  appointmentPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: normalize(12),
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentName: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  appointmentDetail: {
    fontSize: normalize(14),
    color: colors.textSecondary,
  },
  appointmentStatus: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: colors.success,
    textTransform: 'uppercase',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.primary,
  },
});

export default AdminDashboard;
