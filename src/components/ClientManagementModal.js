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
          <Text style={styles.title}>Manage Clients</Text>
          <TouchableOpacity onPress={handleAddClient}>
            <Text style={styles.addButton}>➕ Add</Text>
          </TouchableOpacity>
        </View>

        {clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clients registered yet</Text>
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
                  {item.email && (
                    <Text style={styles.clientDetail}>📧 {item.email}</Text>
                  )}
                  {item.phone && (
                    <Text style={styles.clientDetail}>📱 {item.phone}</Text>
                  )}
                  {item.notes && (
                    <Text style={styles.clientDetail}>📝 {item.notes}</Text>
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

        {/* Add/Edit Client Modal */}
        <Modal visible={showAddModal} animationType="slide">
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

            <ScrollView style={styles.form}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Juan Perez"
                value={formData.full_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, full_name: text })
                }
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Paper *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., ID document number"
                value={formData.paper}
                onChangeText={(text) =>
                  setFormData({ ...formData, paper: text })
                }
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Design preferences, previous tattoos, etc."
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData({ ...formData, notes: text })
                }
                multiline
                placeholderTextColor="#999"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingClient ? '✏️ Update Client' : '➕ Add Client'}
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
  clientCard: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  clientDetail: {
    fontSize: 13,
    color: '#999',
    marginBottom: 3,
  },
  clientActions: {
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

export default ClientManagementModal;