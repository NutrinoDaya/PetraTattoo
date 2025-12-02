import React from 'react';
import { AuthProvider } from './src/utils/authContext';
import AppNavigator from './src/navigation/AppNavigator';
import FlashMessage from 'react-native-flash-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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