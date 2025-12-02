import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

export default function App() {
  console.log('App component is loading...');
  
  React.useEffect(() => {
    console.log('App component mounted successfully');
    Alert.alert('Debug', 'App loaded successfully!');
  }, []);

  try {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Hello World!</Text>
        <Text style={styles.subtext}>Petra Tatto App</Text>
        <Text style={styles.debug}>✅ App is working!</Text>
      </View>
    );
  } catch (error) {
    console.error('Error in App render:', error);
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error.toString()}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  debug: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
});