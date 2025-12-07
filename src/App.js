import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Orientation from 'react-native-orientation-locker';
import { AuthProvider } from './utils/authContext';
import AppNavigator from './navigation/AppNavigator';
import FlashMessage from 'react-native-flash-message';

const App = () => {
  useEffect(() => {
    // Lock orientation to landscape
    Orientation.lockToLandscapeLeft();
    
    return () => {
      // Unlock on unmount if needed
      Orientation.unlockAllOrientations();
    };
  }, []);

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
