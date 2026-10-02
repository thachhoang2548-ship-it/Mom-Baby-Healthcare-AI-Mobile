import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Activity, Baby, Grid3X3, HeartPulse, Home } from 'lucide-react-native';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import JourneyScreen from '../screens/journey/JourneyScreen';
import BabyNutritionScreen from '../screens/nutrition/BabyNutritionScreen';
import SymptomCheckerScreen from '../screens/symptoms/SymptomCheckerScreen';
import ToolsScreen from '../screens/tools/ToolsScreen';
import { COLORS } from '../theme/colors';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 66,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
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
