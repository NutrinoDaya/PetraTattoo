import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../utils/authContext';
import { globalStyles } from '../styles/globalStyles';
import { colors, spacing } from '../styles/theme';
import { normalize, isTablet, wp } from '../utils/responsive';
import LoadingSpinner from '../components/LoadingSpinner';
import PetraLogo from '../components/PetraLogo';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    const result = await login(username.trim(), password);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
    // Navigation will be handled by the AuthProvider
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('demo_worker');
      setPassword('worker123');
    }
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar barStyle="light-content" />
      <View
        style={[globalStyles.gradientContainer, { backgroundColor: colors.background }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <PetraLogo size={isTablet() ? "xlarge" : "large"} showText={true} />
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Sign In</Text>
              
              <View style={styles.inputContainer}>
                <Icon name="person-outline" size={normalize(20)} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={normalize(20)} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={normalize(20)}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[globalStyles.primaryButton, styles.loginButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" color={colors.text} />
                ) : (
                  <Text style={globalStyles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Quick Login Options for Demo */}
              <View style={styles.quickLoginContainer}>
                <Text style={styles.quickLoginTitle}>Quick Login (Demo)</Text>
                <View style={styles.quickLoginButtons}>
                  <TouchableOpacity
                    style={[globalStyles.secondaryButton, styles.quickButton]}
                    onPress={() => handleQuickLogin('admin')}
                  >
                    <Icon name="shield-checkmark" size={normalize(16)} color={colors.primary} />
                    <Text style={[globalStyles.buttonText, { color: colors.primary, marginLeft: normalize(8) }]}>
                      Admin
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[globalStyles.secondaryButton, styles.quickButton]}
                    onPress={() => handleQuickLogin('worker')}
                  >
                    <Icon name="brush" size={normalize(16)} color={colors.primary} />
                    <Text style={[globalStyles.buttonText, { color: colors.primary, marginLeft: normalize(8) }]}>
                      Artist
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Manage appointments, payments, and artist profiles
              </Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    alignItems: 'center', // Center content horizontally
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    width: '100%',
  },
  appSubtitle: {
    fontSize: normalize(14),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: normalize(16),
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    width: isTablet() ? '60%' : '100%', // Limit width on tablet
    maxWidth: 600, // Max width for very large screens
  },
  formTitle: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: normalize(16),
    paddingVertical: spacing.xs,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  quickLoginContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickLoginTitle: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  quickLoginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  footerText: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  versionText: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: colors.textMuted,
  },
});

export default LoginScreen;