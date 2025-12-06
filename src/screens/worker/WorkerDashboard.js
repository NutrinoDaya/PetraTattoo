import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../utils/authContext';
import { globalStyles } from '../../styles/globalStyles';
import { colors, spacing, typography } from '../../styles/theme';
import { normalize, isTablet } from '../../utils/responsive';
import LoadingSpinner from '../../components/LoadingSpinner';
import PetraLogo from '../../components/PetraLogo';
import ApiService from '../../services/apiService';

const WorkerDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    upcomingAppointments: [],
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    totalTips: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's appointments
      const todayAppointments = await ApiService.getAppointments(user.id, today);
      
      // Get upcoming appointments (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingAppointments = await ApiService.getAppointments(user.id);
      
      // Filter upcoming appointments
      const upcoming = upcomingAppointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate > new Date(today) && app.status === 'upcoming';
      }).slice(0, 5);

      // Get earnings data
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const monthlyPayments = await ApiService.getPayments(user.id);
      const weeklyPayments = monthlyPayments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= startOfWeek;
      });
      
      const monthlyEarnings = monthlyPayments.reduce((sum, payment) => sum + payment.worker_earnings, 0);
      const weeklyEarnings = weeklyPayments.reduce((sum, payment) => sum + payment.worker_earnings, 0);
      const totalTips = monthlyPayments.reduce((sum, payment) => sum + payment.tip_amount, 0);

      setDashboardData({
        todayAppointments,
        upcomingAppointments: upcoming,
        monthlyEarnings,
        weeklyEarnings,
        totalTips,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={globalStyles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.contentContainer}>
        {/* Logo Header */}
        <View style={styles.logoHeader}>
          <PetraLogo size={isTablet() ? "medium" : "medium"} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.full_name || 'Artist'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={normalize(24)} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="wallet" size={normalize(24)} color={colors.primary} />
              <Text style={styles.statValue}>${dashboardData.monthlyEarnings.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Monthly Earnings</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="trending-up" size={normalize(24)} color={colors.secondary} />
              <Text style={styles.statValue}>${dashboardData.weeklyEarnings.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Weekly Earnings</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="gift" size={normalize(24)} color={colors.success} />
              <Text style={styles.statValue}>${dashboardData.totalTips.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total Tips</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="calendar-number" size={normalize(24)} color={colors.warning} />
              <Text style={styles.statValue}>{dashboardData.todayAppointments.length}</Text>
              <Text style={styles.statLabel}>Today's Bookings</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Ionicons name="add-circle" size={normalize(32)} color={colors.primary} />
              <Text style={styles.actionText}>New Appointment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Payments')}
            >
              <Ionicons name="card" size={normalize(32)} color={colors.secondary} />
              <Text style={styles.actionText}>Record Payment</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.todayAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={normalize(48)} color={colors.textMuted} />
              <Text style={styles.emptyText}>No appointments today</Text>
            </View>
          ) : (
            dashboardData.todayAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentTime}>
                  <Text style={styles.timeText}>{appointment.time}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: appointment.status === 'upcoming' ? colors.warning : colors.success }
                  ]}>
                    <Text style={styles.statusText}>{appointment.status}</Text>
                  </View>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.customerName}>{appointment.customer_name}</Text>
                  <Text style={styles.tattooType}>{appointment.tattoo_type}</Text>
                  <Text style={styles.price}>${appointment.price}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          
          {dashboardData.upcomingAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={normalize(48)} color={colors.textMuted} />
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            </View>
          ) : (
            dashboardData.upcomingAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentDate}>
                  <Text style={styles.dateText}>{appointment.date}</Text>
                  <Text style={styles.timeText}>{appointment.time}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.customerName}>{appointment.customer_name}</Text>
                  <Text style={styles.tattooType}>{appointment.tattoo_type}</Text>
                  <Text style={styles.price}>${appointment.price}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    width: isTablet() ? '70%' : '100%',
    alignSelf: 'center',
  },
  logoHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h2,
    marginTop: spacing.xs,
  },
  logoutButton: {
    padding: spacing.sm,
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
    ...typography.h2,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    backgroundColor: colors.card,
    borderRadius: normalize(16),
    padding: spacing.lg,
    alignItems: 'center',
  },
  actionText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
  },
  seeAllText: {
    ...typography.body,
    color: colors.primary,
  },
  appointmentCard: {
    backgroundColor: colors.card,
    borderRadius: normalize(12),
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
  },
  appointmentTime: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  appointmentDate: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timeText: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  dateText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: normalize(12),
  },
  statusText: {
    ...typography.caption,
    color: colors.text,
    fontSize: normalize(12),
  },
  appointmentInfo: {
    flex: 1,
  },
  customerName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  tattooType: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h4,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});

export default WorkerDashboard;