import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../styles/theme';

const LoadingSpinner = ({ 
  size = 'large', 
  color = colors.primary, 
  style = {} 
}) => {
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default LoadingSpinner;