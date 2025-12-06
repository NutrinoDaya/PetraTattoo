import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { apiService } from '../../services/apiService';
import { colors, spacing } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { normalize, isTablet } from '../../utils/responsive';

const PaymentsScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    artist_name: '',
    tattoo_type: '',
    amount: '',
    payment_method: 'cash',
    tip_amount: '0',
    date: '',
    notes: '',
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPayments();
      setPayments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = () => {
    setEditingPayment(null);
    setFormData({
      customer_name: '',
      artist_name: '',
      tattoo_type: '',
      amount: '',
      payment_method: 'cash',
      tip_amount: '0',
      date: new Date().toISOString().split('T')[0], // Today's date
      notes: '',
    });
    setModalVisible(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setFormData({
      customer_name: payment.customer_name,
      artist_name: payment.artist_name,
      tattoo_type: payment.tattoo_type,
      amount: payment.amount.toString(),
      payment_method: payment.payment_method,
      tip_amount: payment.tip_amount.toString(),
      date: payment.date,
      notes: payment.notes || '',
    });
    setModalVisible(true);
  };

  const handleSavePayment = async () => {
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        tip_amount: parseFloat(formData.tip_amount),
      };

      if (editingPayment) {
        await apiService.updatePayment(editingPayment.id, paymentData);
      } else {
        await apiService.createPayment(paymentData);
      }

      setModalVisible(false);
      loadPayments();
      Alert.alert('Success', `Payment ${editingPayment ? 'updated' : 'created'} successfully`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save payment');
    }
  };

  const handleDeletePayment = (payment) => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deletePayment(payment.id);
              loadPayments();
              Alert.alert('Success', 'Payment deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete payment');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={globalStyles.container}>
      <AppHeader title="Manage Payments" />
      
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={[globalStyles.button, styles.addButton]}
          onPress={handleCreatePayment}
        >
          <Ionicons name="add" size={normalize(20)} color={colors.surface} />
          <Text style={globalStyles.buttonText}>New Payment</Text>
        </TouchableOpacity>

        <ScrollView style={{ flex: 1 }}>
          {payments.map((payment) => (
            <View key={payment.id} style={globalStyles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={globalStyles.cardTitle}>{payment.customer_name}</Text>
                  <Text style={globalStyles.cardSubtitle}>Artist: {payment.artist_name}</Text>
                  <Text style={globalStyles.cardText}>Type: {payment.tattoo_type}</Text>
                  <Text style={globalStyles.cardText}>Amount: {formatCurrency(payment.amount)}</Text>
                  <Text style={globalStyles.cardText}>Tips: {formatCurrency(payment.tip_amount)}</Text>
                  <Text style={globalStyles.cardText}>Payment: {payment.payment_method}</Text>
                  <Text style={globalStyles.cardText}>Date: {formatDate(payment.date)}</Text>
                  
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    marginTop: spacing.sm,
                    paddingTop: spacing.sm,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}>
                    <View>
                      <Text style={[globalStyles.cardText, { fontSize: normalize(12) }]}>
                        Shop Commission: {formatCurrency(payment.shop_commission)}
                      </Text>
                      <Text style={[globalStyles.cardText, { fontSize: normalize(12) }]}>
                        Artist Earnings: {formatCurrency(payment.artist_earnings)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => handleEditPayment(payment)}
                    style={[globalStyles.iconButton, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="create" size={normalize(16)} color={colors.surface} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDeletePayment(payment)}
                    style={[globalStyles.iconButton, { backgroundColor: colors.error }]}
                  >
                    <Ionicons name="trash" size={normalize(16)} color={colors.surface} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          
          {payments.length === 0 && (
            <View style={globalStyles.emptyState}>
              <Ionicons name="card-outline" size={normalize(64)} color={colors.textMuted} />
              <Text style={globalStyles.emptyStateTitle}>No Payments</Text>
              <Text style={globalStyles.emptyStateText}>
                Record your first payment to get started
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Payment Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={globalStyles.container}>
          <AppHeader 
            title={editingPayment ? 'Edit Payment' : 'New Payment'}
            showBack
            onBack={() => setModalVisible(false)}
          />
          
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.formContainer}>
              <TextInput
                style={globalStyles.input}
                placeholder="Customer Name"
                placeholderTextColor={colors.textMuted}
                value={formData.customer_name}
                onChangeText={(text) => setFormData({ ...formData, customer_name: text })}
              />
              
              <TextInput
                style={globalStyles.input}
                placeholder="Artist Name"
                placeholderTextColor={colors.textMuted}
                value={formData.artist_name}
                onChangeText={(text) => setFormData({ ...formData, artist_name: text })}
              />
              
              <TextInput
                style={globalStyles.input}
                placeholder="Tattoo Type"
                placeholderTextColor={colors.textMuted}
                value={formData.tattoo_type}
                onChangeText={(text) => setFormData({ ...formData, tattoo_type: text })}
              />
              
              <TextInput
                style={globalStyles.input}
                placeholder="Amount"
                placeholderTextColor={colors.textMuted}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="numeric"
              />
              
              <TextInput
                style={globalStyles.input}
                placeholder="Tip Amount"
                placeholderTextColor={colors.textMuted}
                value={formData.tip_amount}
                onChangeText={(text) => setFormData({ ...formData, tip_amount: text })}
                keyboardType="numeric"
              />
              
              <TextInput
                style={globalStyles.input}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={colors.textMuted}
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
              
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={[globalStyles.cardText, { marginBottom: spacing.sm }]}>Payment Method:</Text>
                {['cash', 'card'].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      globalStyles.radioOption,
                      formData.payment_method === method && globalStyles.radioOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, payment_method: method })}
                  >
                    <Text style={[
                      globalStyles.radioText,
                      formData.payment_method === method && globalStyles.radioTextSelected
                    ]}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={[globalStyles.input, { height: normalize(80) }]}
                placeholder="Notes (optional)"
                placeholderTextColor={colors.textMuted}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                textAlignVertical="top"
              />
              
              <TouchableOpacity
                style={globalStyles.button}
                onPress={handleSavePayment}
              >
                <Text style={globalStyles.buttonText}>
                  {editingPayment ? 'Update Payment' : 'Create Payment'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.secondaryButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[globalStyles.buttonText, globalStyles.secondaryButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  },
  formContainer: {
    padding: spacing.lg,
    width: isTablet() ? '60%' : '100%',
    alignSelf: 'center',
  },
});

export default PaymentsScreen;