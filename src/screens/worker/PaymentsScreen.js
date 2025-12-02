import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const PaymentsScreen = () => {
  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Text style={globalStyles.heading}>Payments Screen</Text>
      <Text style={globalStyles.body}>Coming soon...</Text>
    </View>
  );
};

export default PaymentsScreen;