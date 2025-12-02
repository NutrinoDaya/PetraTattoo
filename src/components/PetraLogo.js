import React from 'react';
import { View, Image, Text } from 'react-native';
import { spacing, typography } from '../styles/theme';

const PetraLogo = ({ 
  size = 'large', 
  showText = false, 
  style = {} 
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 48 };
      case 'medium':
        return { width: 120, height: 72 };
      case 'large':
      default:
        return { width: 200, height: 120 };
      case 'xlarge':
        return { width: 250, height: 150 };
    }
  };

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <Image
        source={require('../assets/petra-logo.png')}
        style={[getSizeStyle()]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[
          typography.caption,
          { 
            marginTop: spacing.sm,
            textAlign: 'center',
            opacity: 0.8
          }
        ]}>
          Artist Management System
        </Text>
      )}
    </View>
  );
};

export default PetraLogo;