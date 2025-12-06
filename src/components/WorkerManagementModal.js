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

const WorkerManagementModal = ({ visible, onClose, onUpdate }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    specialties: '',
    paper: '',
  });

  useEffect(() => {
    if (visible) {
      loadWorkers();
    }
  }, [visible]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const w = await dbService.getWorkers();
      setWorkers(w);
    } catch (error) {
      console.error('Error loading workers:', error);
      Alert.alert('Error', 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = () => {
    setEditingWorker(null);
    setFormData({
      username: '',
      email: '',
      full_name: '',
      specialties: '',
      paper: '',
    });
    setShowAddModal(true);
  };

  const handleEditWorker = (worker) => {
    setEditingWorker(worker);
    setFormData({
      username: worker.username,
      email: worker.email,
      full_name: worker.full_name,
      specialties: worker.specialties || '',
      paper: worker.paper || '',
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.email) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      if (editingWorker) {
        await dbService.updateWorker(editingWorker.id, formData);
        Alert.alert('Success', 'Worker updated successfully');
      } else {
        if (!formData.username) {
          Alert.alert('Validation Error', 'Username is required');
          return;
        }
        await dbService.addWorker(formData);
        Alert.alert('Success', 'Worker added successfully');
      }
      setShowAddModal(false);
      loadWorkers();
      onUpdate();
    } catch (error) {
      console.error('Error saving worker:', error);
      Alert.alert('Error', error.message || 'Failed to save worker');
    }
  };

  const handleDelete = (worker) => {
    Alert.alert(
      'Delete Worker',
      `Are you sure you want to delete ${worker.full_name}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await dbService.deleteWorker(worker.id);
              Alert.alert('Success', 'Worker deleted successfully');
              loadWorkers();
              onUpdate();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete worker');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading && workers.length === 0) {
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
          <Text style={styles.title}>Manage Artists</Text>
          <TouchableOpacity onPress={handleAddWorker}>
            <Text style={styles.addButton}>➕ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {workers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No artists added yet</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddWorker}
              >
                <Text style={styles.emptyButtonText}>Add First Artist</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={workers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.workerCard}>
                  <View style={styles.workerInfo}>
                    <Text style={styles.workerName}>{item.full_name}</Text>
                    <Text style={styles.workerDetail}>{item.specialties}</Text>
                    <Text style={styles.workerDetail}>{item.email}</Text>
                    {item.paper && (
                      <Text style={styles.workerDetail}>📄 {item.paper}</Text>
                    )}
                  </View>
                  <View style={styles.workerActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditWorker(item)}
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

        {/* Add/Edit Worker Modal */}
        <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.formContainer}>
            <View style={styles.formHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.formTitle}>
                {editingWorker ? 'Edit Artist' : 'Add New Artist'}
              </Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.contentContainer}>
              <ScrollView style={styles.form}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Carlos Rodriguez"
                  value={formData.full_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, full_name: text })
                  }
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Username *</Text>
                <TextInput
                  style={[styles.input, editingWorker && styles.inputDisabled]}
                  placeholder="e.g., carlos"
                  value={formData.username}
                  onChangeText={(text) =>
                    setFormData({ ...formData, username: text })
                  }
                  editable={!editingWorker}
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., carlos@PetraTatoo.com"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>Specialties</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Black & Gray, Realism"
                  value={formData.specialties}
                  onChangeText={(text) =>
                    setFormData({ ...formData, specialties: text })
                  }
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.label}>License/Paper</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., License #001"
                  value={formData.paper}
                  onChangeText={(text) =>
                    setFormData({ ...formData, paper: text })
                  }
                  placeholderTextColor={colors.textMuted}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>
                    {editingWorker ? '✏️ Update Artist' : '➕ Add Artist'}
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
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeButton: {
    color: colors.error,
    fontSize: normalize(16),
  },
  addButton: {
    color: colors.success,
    fontSize: normalize(16),
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    fontSize: normalize(16),
  },
  listContent: {
    padding: spacing.md,
  },
  workerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: normalize(8),
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  workerDetail: {
    fontSize: normalize(13),
    color: colors.textMuted,
    marginBottom: 3,
  },
  workerActions: {
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
    fontWeight: 'bold',
    color: colors.primary,
  },
  form: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    color: colors.primary,
    fontSize: normalize(14),
    fontWeight: 'bold',
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
  inputDisabled: {
    opacity: 0.6,
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
    fontWeight: 'bold',
  },
});

export default WorkerManagementModal;