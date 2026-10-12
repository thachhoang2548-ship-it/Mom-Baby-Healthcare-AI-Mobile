import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import GuestHomeScreen from '../screens/GuestHomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TabNavigator from './TabNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BabyProfileFormScreen from '../screens/nutrition/BabyProfileFormScreen';
import DailyMonitoringScreen from '../screens/monitoring/DailyMonitoringScreen';
import MedicationScreen from '../screens/medication/MedicationScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SymptomHistoryScreen from '../screens/symptoms/SymptomHistoryScreen';
import SymptomDetailScreen from '../screens/symptoms/SymptomDetailScreen';
import PregnancyScreen from '../screens/stages/PregnancyScreen';
import PostpartumScreen from '../screens/stages/PostpartumScreen';
import EpdsScreen from '../screens/stages/EpdsScreen';
import FertilityScreen from '../screens/stages/FertilityScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="GuestHome" component={GuestHomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="BabyProfileForm" component={BabyProfileFormScreen} />
        <Stack.Screen name="DailyMonitoring" component={DailyMonitoringScreen} />
        <Stack.Screen name="Medications" component={MedicationScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="SymptomHistory" component={SymptomHistoryScreen} />
        <Stack.Screen name="SymptomDetail" component={SymptomDetailScreen} />
        <Stack.Screen name="Pregnancy" component={PregnancyScreen} />
        <Stack.Screen name="Postpartum" component={PostpartumScreen} />
        <Stack.Screen name="Epds" component={EpdsScreen} />
        <Stack.Screen name="Fertility" component={FertilityScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
