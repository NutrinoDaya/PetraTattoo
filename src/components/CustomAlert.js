import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';

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
                <Text style={styles.buttonText}>OK</Text>
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
    paddingHorizontal: 40,
  },
  alertContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  messageContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#3a3a3a',
    borderRightWidth: 1,
    borderRightColor: '#444',
  },
  singleButton: {
    borderRightWidth: 0,
    backgroundColor: '#FFD700',
  },
  leftButton: {
    // Keep default styling
  },
  rightButton: {
    borderRightWidth: 0,
    backgroundColor: '#FFD700',
  },
  destructiveButton: {
    backgroundColor: '#cc3333',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
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