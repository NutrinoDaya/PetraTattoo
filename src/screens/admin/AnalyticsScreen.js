import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { dbService } from '../../services/localTattooService';
import { colors, spacing, typography } from '../../styles/theme';
import { normalize, isTablet } from '../../utils/responsive';

const AnalyticsScreen = ({ refreshTrigger }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Utility function to safely format currency
  const formatCurrency = (value, decimals = 2) => {
    const num = parseFloat(value) || 0;
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  useEffect(() => {
    loadAnalytics();
  }, [refreshTrigger]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await dbService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load analytics</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.screenTitle}>📊 Analytics Dashboard</Text>

        <View style={styles.contentContainer}>
          {/* Revenue Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Revenue</Text>

            <View style={styles.statGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Today</Text>
                <Text style={styles.statValue}>
                  ${formatCurrency(analytics.todayRevenue)}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>
                  ${formatCurrency(analytics.monthlyRevenue)}
                </Text>
              </View>
            </View>
          </View>

          {/* Appointments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Appointments</Text>

            <View style={styles.statGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Today</Text>
                <Text style={styles.statValue}>
                  {analytics.todayAppointmentsCount || 0}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>
                  {analytics.monthlyAppointmentsCount || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Business Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Business</Text>

            <View style={styles.statGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Clients</Text>
                <Text style={styles.statValue}>{analytics.totalClients || 0}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Artists</Text>
                <Text style={styles.statValue}>{analytics.totalWorkers || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  contentContainer: {
    width: isTablet() ? '70%' : '100%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: normalize(16),
  },
  screenTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statBox: {
    flex: 0.48,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: normalize(10),
    padding: spacing.md,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
});

export default AnalyticsScreen;