import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';

const AdminDashboard = () => {
  return (
    <View style={globalStyles.container}>
      <AppHeader 
        title="Admin Dashboard" 
        subtitle="Shop Overview & Analytics"
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={[globalStyles.center, { paddingTop: 100 }]}>
          <Text style={globalStyles.heading}>Admin Dashboard</Text>
          <Text style={globalStyles.body}>Coming soon...</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;