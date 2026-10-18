import React, { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Activity, Baby, Grid3X3, HeartPulse, Home } from 'lucide-react-native';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import JourneyScreen from '../screens/journey/JourneyScreen';
import BabyNutritionScreen from '../screens/nutrition/BabyNutritionScreen';
import SymptomCheckerScreen from '../screens/symptoms/SymptomCheckerScreen';
import ToolsScreen from '../screens/tools/ToolsScreen';
import { useAuthStore } from '../stores/authStore';
import { COLORS, MOM_THEME } from '../theme/colors';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  const refreshTier = useAuthStore((s) => s.refreshTier);

  // Gói được nâng cấp trên web: hỏi lại khi vào app và mỗi lần app quay lại từ nền.
  useEffect(() => {
    refreshTier();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshTier();
    });
    return () => sub.remove();
  }, [refreshTier]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: MOM_THEME.roseDark,
        tabBarInactiveTintColor: MOM_THEME.mutedLight,
        tabBarStyle: {
          backgroundColor: MOM_THEME.white,
          borderTopWidth: 1,
          borderTopColor: MOM_THEME.border,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: MOM_THEME.charcoal,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Journey"
        component={JourneyScreen}
        options={{
          tabBarLabel: 'Lộ trình',
          tabBarIcon: ({ color, size }) => <HeartPulse size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Nutrition"
        component={BabyNutritionScreen}
        options={{
          tabBarLabel: 'Bé yêu',
          tabBarIcon: ({ color, size }) => <Baby size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="SymptomAI"
        component={SymptomCheckerScreen}
        options={{
          tabBarLabel: 'AI',
          tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Menu"
        component={ToolsScreen}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, size }) => <Grid3X3 size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
