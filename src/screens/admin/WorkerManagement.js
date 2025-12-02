import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const WorkerManagement = () => {
  return (
    <View style={[globalStyles.container, globalStyles.center]}>
      <Text style={globalStyles.heading}>Worker Management</Text>
      <Text style={globalStyles.body}>Coming soon...</Text>
    </View>
  );
};

export default WorkerManagement;