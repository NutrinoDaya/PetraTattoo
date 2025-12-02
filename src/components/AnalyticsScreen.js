import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { dbService } from '../services/localTattooService';

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
        <ActivityIndicator size="large" color="#FFD700" />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFD700']}
            tintColor="#FFD700"
          />
        }
      >
        <Text style={styles.screenTitle}>📊 Analytics Dashboard</Text>

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





        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtext: {
    color: '#666',
    fontSize: 11,
  },
  earningsContainer: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    overflow: 'hidden',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  earningsInfo: {
    flex: 1,
  },
  artistName: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earningsLabel: {
    color: '#999',
    fontSize: 12,
  },
  earningsValue: {
    color: '#00D084',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
  },
  infoText: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  infoBold: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

export default AnalyticsScreen;