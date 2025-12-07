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
import { dbService } from '../../services/localTattooService';

const AdminDashboard = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    todayAppointmentsCount: 0,
    totalClients: 0,
    totalArtists: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      
      setDashboardData({
        todayRevenue: analytics.todayRevenue,
        monthlyRevenue: analytics.monthlyRevenue,
        todayAppointmentsCount: analytics.todayAppointmentsCount,
        totalClients: analytics.totalClients,
        totalArtists: analytics.totalWorkers,
      });
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

  const formatCurrency = (value) => {
    return `$${(value || 0).toFixed(2)}`;
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
                <Text style={styles.statLabel}>Today's Revenue</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="calendar" size={normalize(24)} color={colors.success} />
                <Text style={styles.statValue}>{dashboardData.todayAppointmentsCount}</Text>
                <Text style={styles.statLabel}>Today's Appts</Text>
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
        </View>
      </ScrollView>
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
    fontSize: normalize(16),
    fontWeight: '400',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default AdminDashboard;