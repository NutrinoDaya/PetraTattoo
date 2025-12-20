import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/theme';
import { normalize } from '../utils/responsive';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AppointmentsScreen from '../screens/admin/AppointmentsScreen';
import PaymentsScreen from '../screens/admin/PaymentsScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import WorkerManagement from '../screens/admin/WorkerManagement';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Admin Tab Navigation
const AdminTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Manage') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 10),
          height: normalize(60) + Math.max(insets.bottom, 10),
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen 
        name="Manage" 
        component={WorkerManagement}
        options={{ title: 'Manage' }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigation
const AppNavigator = () => {
  // Define fonts configuration for React Navigation theme
  const navigationTheme = {
    dark: true,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900',
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;