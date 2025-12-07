import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import { normalize } from '../utils/responsive';

const { width } = Dimensions.get('window');

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  buttons = [], 
  onClose 
}) => {
  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          {/* Message */}
          {message && (
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'destructive' && styles.destructiveButton,
                    buttons.length === 1 && styles.singleButton,
                    index === 0 && buttons.length > 1 && styles.leftButton,
                    index === buttons.length - 1 && buttons.length > 1 && styles.rightButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text style={[
                    styles.buttonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                    // If it's the right button (usually confirm) or single button, use black text
                    (buttons.length === 1 || (index === buttons.length - 1 && buttons.length > 1)) && styles.primaryButtonText
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.singleButton]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  alertContainer: {
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    borderWidth: 2,
    borderColor: colors.primary,
    width: '100%',
    maxWidth: normalize(320),
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  messageContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  message: {
    fontSize: normalize(16),
    color: colors.text,
    textAlign: 'center',
    lineHeight: normalize(22),
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#3a3a3a',
    borderRightWidth: 1,
    borderRightColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    borderRightWidth: 0,
    backgroundColor: colors.primary,
  },
  leftButton: {
    // Keep default styling
  },
  rightButton: {
    borderRightWidth: 0,
    backgroundColor: colors.primary,
  },
  destructiveButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#000',
  },
  destructiveButtonText: {
    color: '#fff',
  },
});

// Custom Alert API similar to React Native's Alert
const showAlert = (title, message, buttons) => {
  return new Promise((resolve) => {
    const alertComponent = (
      <CustomAlert
        visible={true}
        title={title}
        message={message}
        buttons={buttons}
        onClose={() => resolve()}
      />
    );
    // This would need to be integrated with a global modal system
    // For now, we'll export the component for direct usage
  });
};

export { CustomAlert, showAlert };
export default CustomAlert;