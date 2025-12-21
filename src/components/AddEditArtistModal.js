import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { dbService } from '../services/localTattooService';
import CustomAlert from './CustomAlert';
import { colors, spacing } from '../styles/theme';
import { normalize } from '../utils/responsive';

const AddEditArtistModal = ({ visible, onClose, onSave, editingArtist = null }) => {
  // Dynamic responsive values
  const { width, height } = useWindowDimensions();
  const isTabletLayout = width >= 768;
  const isLandscape = width > height;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    specialties: '',
    paper: '',
  });
  const [saving, setSaving] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', buttons: [] });

  useEffect(() => {
    if (visible) {
      if (editingArtist) {
        setFormData({
          username: editingArtist.username || '',
          email: editingArtist.email || '',
          full_name: editingArtist.full_name || '',
          specialties: editingArtist.specialties || '',
          paper: editingArtist.paper || '',
        });
      } else {
        setFormData({
          username: '',
          email: '',
          full_name: '',
          specialties: '',
          paper: '',
        });
      }
    }
  }, [visible, editingArtist]);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  const showCustomAlert = (title, message, buttons = []) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig({ visible: false, title: '', message: '', buttons: [] });
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.email) {
      showCustomAlert('Validation Error', 'Please fill Full Name and Email', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return;
    }

    if (!editingArtist && !formData.username) {
      showCustomAlert('Validation Error', 'Username is required for new artists', [
        { text: 'OK', onPress: hideAlert }
      ]);
      return;
    }

    try {
      setSaving(true);
      if (editingArtist) {
        await dbService.updateWorker(editingArtist.id, formData);
        showCustomAlert('Success', 'Artist updated successfully', [
          { text: 'OK', onPress: () => { hideAlert(); onSave(); onClose(); } }
        ]);
      } else {
        await dbService.addWorker(formData);
        showCustomAlert('Success', 'Artist added successfully', [
          { text: 'OK', onPress: () => { hideAlert(); onSave(); onClose(); } }
        ]);
      }
    } catch (error) {
      console.error('Error saving artist:', error);
      showCustomAlert('Error', error.message || 'Failed to save artist', [
        { text: 'OK', onPress: hideAlert }
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={normalize(24)} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingArtist ? 'Edit Artist' : 'Add New Artist'}
          </Text>
          <View style={{ width: normalize(40) }} />
        </View>

        <View style={[styles.contentContainer, isTabletLayout && styles.contentContainerTablet]}>
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Carlos Rodriguez"
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={[styles.input, editingArtist && styles.inputDisabled]}
              placeholder="e.g., carlos"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              editable={!editingArtist}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., carlos@petratattoo.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Specialties</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Black & Gray, Realism"
              value={formData.specialties}
              onChangeText={(text) => setFormData({ ...formData, specialties: text })}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>License/Paper</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., License #001"
              value={formData.paper}
              onChangeText={(text) => setFormData({ ...formData, paper: text })}
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons 
                name={editingArtist ? 'checkmark' : 'add'} 
                size={normalize(20)} 
                color={colors.surface} 
              />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : (editingArtist ? 'Update Artist' : 'Add Artist')}
              </Text>
            </TouchableOpacity>

            <View style={{ height: normalize(40) }} />
          </ScrollView>
        </View>

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  title: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: colors.text,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  contentContainerTablet: {
    width: '60%',
  },
  form: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: normalize(10),
    padding: spacing.md,
    fontSize: normalize(16),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: normalize(10),
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: colors.surface,
  },
});

export default AddEditArtistModal;
