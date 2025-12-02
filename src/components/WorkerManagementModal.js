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
          <ActivityIndicator size="large" color="#FFD700" />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
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

        {/* Add/Edit Worker Modal */}
        <Modal visible={showAddModal} animationType="slide">
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

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Carlos Rodriguez"
                value={formData.full_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, full_name: text })
                }
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Specialties</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Black & Gray, Realism"
                value={formData.specialties}
                onChangeText={(text) =>
                  setFormData({ ...formData, specialties: text })
                }
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>License/Paper</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., License #001"
                value={formData.paper}
                onChangeText={(text) =>
                  setFormData({ ...formData, paper: text })
                }
                placeholderTextColor="#999"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingWorker ? '✏️ Update Artist' : '➕ Add Artist'}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  addButton: {
    color: '#00D084',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  emptyButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    padding: 15,
  },
  workerCard: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  workerDetail: {
    fontSize: 13,
    color: '#999',
    marginBottom: 3,
  },
  workerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  saveButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkerManagementModal;