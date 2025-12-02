import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../utils/authContext';
import { globalStyles } from '../styles/globalStyles';
import { colors, spacing, typography } from '../styles/theme';
import PetraLogo from './PetraLogo';

const AppHeader = ({ 
  title, 
  showLogo = true, 
  showLogout = true,
  subtitle = null,
  style = {} 
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <PetraLogo size="small" />
        </View>
      )}
      
      <View style={styles.titleContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {showLogout && (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: colors.surface,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  logoutButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.lg + spacing.sm,
    padding: spacing.sm,
  },
};

export default AppHeader;