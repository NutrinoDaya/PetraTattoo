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
import { dbService } from '../../services/localTattooService';
import { colors, spacing } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import AddEditArtistModal from '../../components/AddEditArtistModal';
import AddEditClientModal from '../../components/AddEditClientModal';
import CustomAlert from '../../components/CustomAlert';
import { normalize } from '../../utils/responsive';

const WorkerManagement = () => {
  // Dynamic responsive values
  const { width, height } = useWindowDimensions();
  const isTabletLayout = width >= 768;
  const isLandscape = width > height;
  const [activeTab, setActiveTab] = useState('artists'); // 'artists' or 'clients'
  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  useEffect(() => {
    loadData();
  }, []);

  // Alert handling functions
  const showCustomAlert = (title, message, buttons = []) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Initialize DB if needed
      if (!dbService.isReady) {
        await dbService.initialize();
      }
      const [workersData, clientsData] = await Promise.all([
        dbService.getWorkers(),
        dbService.getClients()
      ]);
      setWorkers(workersData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showCustomAlert('Error', 'Failed to load data', [
        { text: 'OK', onPress: hideAlert }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Artist handlers
  const handleAddArtist = () => {
    setEditingArtist(null);
    setShowArtistModal(true);
  };

  const handleEditArtist = (artist) => {
    setEditingArtist(artist);
    setShowArtistModal(true);
  };

  const handleDeleteArtist = (artist) => {
    showCustomAlert('Delete Artist', `Are you sure you want to delete ${artist.full_name}?`, [
      { text: 'Cancel', onPress: hideAlert, style: 'cancel' },
      { 
        text: 'Delete', 
        onPress: async () => {
          hideAlert();
          try {
            await dbService.deleteWorker(artist.id);
            loadData();
          } catch (error) {
            console.error('Error deleting artist:', error);
            showCustomAlert('Error', 'Failed to delete artist', [{ text: 'OK', onPress: hideAlert }]);
          }
        },
        style: 'destructive'
      }
    ]);
  };

  // Client handlers
  const handleAddClient = () => {
    setEditingClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClient = (client) => {
    showCustomAlert('Delete Client', `Are you sure you want to delete ${client.full_name}?`, [
      { text: 'Cancel', onPress: hideAlert, style: 'cancel' },
      { 
        text: 'Delete', 
        onPress: async () => {
          hideAlert();
          try {
            await dbService.deleteClient(client.id);
            loadData();
          } catch (error) {
            console.error('Error deleting client:', error);
            showCustomAlert('Error', 'Failed to delete client', [{ text: 'OK', onPress: hideAlert }]);
          }
        },
        style: 'destructive'
      }
    ]);
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
      <AppHeader title="Manage" />
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'artists' && styles.activeTab]}
          onPress={() => setActiveTab('artists')}
        >
          <Ionicons 
            name={activeTab === 'artists' ? 'people' : 'people-outline'} 
            size={normalize(20)} 
            color={activeTab === 'artists' ? colors.primary : colors.textMuted} 
          />
          <Text style={[styles.tabText, activeTab === 'artists' && styles.activeTabText]}>
            Artists ({workers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clients' && styles.activeTab]}
          onPress={() => setActiveTab('clients')}
        >
          <Ionicons 
            name={activeTab === 'clients' ? 'person' : 'person-outline'} 
            size={normalize(20)} 
            color={activeTab === 'clients' ? colors.primary : colors.textMuted} 
          />
          <Text style={[styles.tabText, activeTab === 'clients' && styles.activeTabText]}>
            Clients ({clients.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[
        styles.contentContainer,
        isTabletLayout && styles.contentContainerTablet,
      ]}>
        {activeTab === 'artists' ? (
          <>
            <TouchableOpacity
              style={[globalStyles.button, styles.addButton]}
              onPress={handleAddArtist}
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
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{worker.full_name}</Text>
                      <Text style={styles.itemDetail}>
                        <Ionicons name="person" size={normalize(14)} color={colors.textSecondary} />
                        {' '}{worker.username}
                      </Text>
                      <Text style={styles.itemDetail}>
                        <Ionicons name="mail" size={normalize(14)} color={colors.textSecondary} />
                        {' '}{worker.email}
                      </Text>
                      {worker.specialties && (
                        <Text style={styles.itemDetail}>
                          <Ionicons name="brush" size={normalize(14)} color={colors.textSecondary} />
                          {' '}{worker.specialties}
                        </Text>
                      )}
                      {worker.paper && (
                        <Text style={styles.itemDetail}>
                          <Ionicons name="document" size={normalize(14)} color={colors.textSecondary} />
                          {' '}{worker.paper}
                        </Text>
                      )}
                      <View style={styles.badgeRow}>
                        <View style={[
                          styles.roleBadge,
                          { backgroundColor: worker.role === 'admin' ? colors.error : colors.primary }
                        ]}>
                          <Text style={styles.roleText}>{worker.role?.toUpperCase() || 'WORKER'}</Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleEditArtist(worker)}
                      >
                        <Ionicons name="create-outline" size={normalize(22)} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDeleteArtist(worker)}
                      >
                        <Ionicons name="trash-outline" size={normalize(22)} color={colors.error} />
                      </TouchableOpacity>
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
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[globalStyles.button, styles.addButton]}
              onPress={handleAddClient}
            >
              <Ionicons name="add" size={normalize(20)} color={colors.surface} />
              <Text style={globalStyles.buttonText}>Add New Client</Text>
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
              {clients.map((client) => (
                <View key={client.id} style={globalStyles.card}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{client.full_name}</Text>
                      {client.email && (
                        <Text style={styles.itemDetail}>
                          <Ionicons name="mail" size={normalize(14)} color={colors.textSecondary} />
                          {' '}{client.email}
                        </Text>
                      )}
                      {client.phone && (
                        <Text style={styles.itemDetail}>
                          <Ionicons name="call" size={normalize(14)} color={colors.textSecondary} />
                          {' '}{client.phone}
                        </Text>
                      )}
                      {client.paper && (
                        <Text style={styles.itemDetail}>
                          <Ionicons name="document" size={normalize(14)} color={colors.textSecondary} />
                          {' '}{client.paper}
                        </Text>
                      )}
                      {client.notes && (
                        <Text style={[styles.itemDetail, { fontStyle: 'italic' }]}>
                          {client.notes}
                        </Text>
                      )}
                    </View>
                    
                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleEditClient(client)}
                      >
                        <Ionicons name="create-outline" size={normalize(22)} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDeleteClient(client)}
                      >
                        <Ionicons name="trash-outline" size={normalize(22)} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
              
              {clients.length === 0 && (
                <View style={globalStyles.emptyState}>
                  <Ionicons name="person-outline" size={normalize(64)} color={colors.textMuted} />
                  <Text style={globalStyles.emptyStateTitle}>No Clients</Text>
                  <Text style={globalStyles.emptyStateText}>
                    Add your first client to get started
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* Add/Edit Artist Modal - Opens directly to form */}
      <AddEditArtistModal
        visible={showArtistModal}
        onClose={() => {
          setShowArtistModal(false);
          setEditingArtist(null);
        }}
        onSave={loadData}
        editingArtist={editingArtist}
      />

      {/* Add/Edit Client Modal - Opens directly to form */}
      <AddEditClientModal
        visible={showClientModal}
        onClose={() => {
          setShowClientModal(false);
          setEditingClient(null);
        }}
        onSave={loadData}
        editingClient={editingClient}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: normalize(12),
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: normalize(10),
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.background,
  },
  tabText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.primary,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  contentContainerTablet: {
    width: '85%',
    maxWidth: 900,
  },
  addButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemDetail: {
    fontSize: normalize(14),
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
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
  actionButtons: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  actionBtn: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: normalize(8),
  },
});

export default WorkerManagement;
