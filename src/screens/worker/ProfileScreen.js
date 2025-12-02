import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const ProfileScreen = () => {
  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Text style={globalStyles.heading}>Profile Screen</Text>
      <Text style={globalStyles.body}>Coming soon...</Text>
    </View>
  );
};

export default ProfileScreen;