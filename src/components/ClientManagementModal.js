import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { dbService } from '../services/localTattooService';
import { colors, spacing, typography } from '../styles/theme';
import { normalize, isTablet } from '../utils/responsive';

const ClientManagementModal = ({ visible, onClose, onUpdate }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    paper: '',
    notes: '',
  });

  useEffect(() => {
    if (visible) {
      loadClients();
    }
  }, [visible]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const c = await dbService.getClients();
      setClients(c);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      paper: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setFormData({
      full_name: client.full_name,
      email: client.email || '',
      phone: client.phone || '',
      paper: client.paper || '',
      notes: client.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.full_name) {
      Alert.alert('Validation Error', 'Please enter client name');
      return;
    }

    if (!formData.paper) {
      Alert.alert('Validation Error', 'Please enter paper ID');
      return;
    }

    try {
      if (editingClient) {
        await dbService.updateClient(editingClient.id, formData);
        Alert.alert('Success', 'Client updated successfully');
      } else {
        await dbService.addClient(formData);
        Alert.alert('Success', 'Client added successfully');
      }
      setShowAddModal(false);
      loadClients();
      onUpdate();
    } catch (error) {
      console.error('Error saving client:', error);
      Alert.alert('Error', 'Failed to save client');
    }
  };

  const handleDelete = (client) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client.full_name}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await dbService.deleteClient(client.id);
              Alert.alert('Success', 'Client deleted successfully');
              loadClients();
              onUpdate();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete client');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading && clients.length === 0) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Manage Clients</Text>
          <TouchableOpacity onPress={handleAddClient}>
            <Text style={styles.addButton}>➕ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {clients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No clients added yet</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddClient}
              >
                <Text style={styles.emptyButtonText}>Add First Client</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={clients}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.clientCard}>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{item.full_name}</Text>
                    <Text style={styles.clientDetail}>{item.email}</Text>
                    <Text style={styles.clientDetail}>{item.phone}</Text>
                    {item.notes && (
                      <Text style={styles.clientNotes} numberOfLines={1}>
                        📝 {item.notes}
                      </Text>
                    )}
                  </View>
                  <View style={styles.clientActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditClient(item)}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        {/* Add/Edit Client Modal */}
        <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.formContainer}>
            <View style={styles.formHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.formTitle}>
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.contentContainer}>
              <ScrollView style={styles.form}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Juan Perez"
                  value={formData.full_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, full_name: text })
                  }
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., juan@email.com"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., +34 612345678"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Paper *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ID document number"
                  value={formData.paper}
                  onChangeText={(text) =>
                    setFormData({ ...formData, paper: text })
                  }
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, { height: normalize(100) }]}
                  placeholder="Design preferences, previous tattoos, etc."
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, notes: text })
                  }
                  multiline
                  placeholderTextColor={colors.textMuted}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>
                    {editingClient ? '✏️ Update Client' : '➕ Add Client'}
                  </Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    width: isTablet() ? '70%' : '100%',
    alignSelf: 'center',
    maxWidth: 800,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  title: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: colors.primary,
  },
  closeButton: {
    color: colors.error,
    fontSize: normalize(16),
  },
  addButton: {
    color: colors.success,
    fontSize: normalize(16),
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: normalize(16),
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: normalize(8),
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: normalize(16),
  },
  listContent: {
    padding: spacing.md,
  },
  clientCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: normalize(8),
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  clientDetail: {
    fontSize: normalize(13),
    color: colors.textMuted,
    marginBottom: 3,
  },
  clientNotes: {
    fontSize: normalize(13),
    color: colors.textMuted,
    marginBottom: 3,
  },
  clientActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: normalize(6),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: normalize(16),
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: normalize(6),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: normalize(16),
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  formTitle: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: colors.primary,
  },
  form: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    color: colors.primary,
    fontSize: normalize(14),
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: normalize(8),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: normalize(16),
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: normalize(8),
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: '#000',
    fontSize: normalize(16),
    fontWeight: '700',
  },
});

export default ClientManagementModal;