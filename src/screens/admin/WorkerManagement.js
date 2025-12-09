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
import { dbService } from '../../services/localTattooService';
import { colors, spacing } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import WorkerManagementModal from '../../components/WorkerManagementModal';
import CustomAlert from '../../components/CustomAlert';
import { normalize, isTablet } from '../../utils/responsive';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  useEffect(() => {
    loadWorkers();
  }, []);

  // Alert handling functions
  const showCustomAlert = (title, message, buttons = []) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  const loadWorkers = async () => {
    try {
      setLoading(true);
      // Initialize DB if needed
      if (!dbService.isReady) {
        await dbService.initialize();
      }
      const data = await dbService.getWorkers();
      setWorkers(data);
    } catch (error) {
      console.error('Error loading workers:', error);
      showCustomAlert('Error', 'Failed to load workers', [
        { text: 'OK', onPress: hideAlert }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWorkers();
  };

  const handleWorkerUpdate = () => {
    loadWorkers();
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
      <AppHeader title="Manage Artists" />
      
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={[globalStyles.button, styles.addButton]}
          onPress={() => setShowWorkerModal(true)}
        >
          <Ionicons name="add" size={normalize(20)} color={colors.surface} />
          <Text style={globalStyles.buttonText}>Add New Artist</Text>
        </TouchableOpacity>

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
          {workers.map((worker) => (
            <View key={worker.id} style={globalStyles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workerName}>{worker.full_name}</Text>
                  <Text style={styles.workerDetail}>
                    <Ionicons name="person" size={normalize(14)} color={colors.textSecondary} />
                    {' '}{worker.username}
                  </Text>
                  <Text style={styles.workerDetail}>
                    <Ionicons name="mail" size={normalize(14)} color={colors.textSecondary} />
                    {' '}{worker.email}
                  </Text>
                  {worker.specialties && (
                    <Text style={styles.workerDetail}>
                      <Ionicons name="brush" size={normalize(14)} color={colors.textSecondary} />
                      {' '}{worker.specialties}
                    </Text>
                  )}
                  {worker.paper && (
                    <Text style={styles.workerDetail}>
                      <Ionicons name="document" size={normalize(14)} color={colors.textSecondary} />
                      {' '}{worker.paper}
                    </Text>
                  )}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginTop: spacing.xs 
                  }}>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: worker.role === 'admin' ? colors.error : colors.primary }
                    ]}>
                      <Text style={styles.roleText}>{worker.role?.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
          
          {workers.length === 0 && (
            <View style={globalStyles.emptyState}>
              <Ionicons name="people-outline" size={normalize(64)} color={colors.textMuted} />
              <Text style={globalStyles.emptyStateTitle}>No Artists</Text>
              <Text style={globalStyles.emptyStateText}>
                Add your first artist to get started
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Worker Management Modal */}
      <WorkerManagementModal
        visible={showWorkerModal}
        onClose={() => setShowWorkerModal(false)}
        onUpdate={handleWorkerUpdate}
      />

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
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerName: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  workerDetail: {
    fontSize: normalize(14),
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: normalize(12),
  },
  roleText: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: colors.text,
  },
});

export default WorkerManagement;