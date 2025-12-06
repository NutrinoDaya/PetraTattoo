import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './utils/authContext';
import AppNavigator from './navigation/AppNavigator';
import FlashMessage from 'react-native-flash-message';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <FlashMessage position="top" />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
