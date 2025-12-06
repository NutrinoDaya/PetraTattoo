import React from 'react';
import { View, Image, Text } from 'react-native';
import { spacing, typography } from '../styles/theme';
import { normalize } from '../utils/responsive';

const PetraLogo = ({ 
  size = 'large', 
  showText = false, 
  style = {} 
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: normalize(80), height: normalize(48) };
      case 'medium':
        return { width: normalize(120), height: normalize(72) };
      case 'large':
      default:
        return { width: normalize(200), height: normalize(120) };
      case 'xlarge':
        return { width: normalize(250), height: normalize(150) };
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