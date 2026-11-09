import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Baby, Grid3X3, HeartPulse, Home } from 'lucide-react-native';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import JourneyScreen from '../screens/journey/JourneyScreen';
import BabyNutritionScreen from '../screens/nutrition/BabyNutritionScreen';
import SymptomCheckerScreen from '../screens/symptoms/SymptomCheckerScreen';
import ToolsScreen from '../screens/tools/ToolsScreen';
import { useAuthStore } from '../stores/authStore';
import babyService from '../services/babyService';
import { useAccent, useThemeStore } from '../theme/accent';
import { MOM_THEME } from '../theme/colors';
import { MainTabParamList } from './types';
import { useT } from '../i18n';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  const a = useAccent();
  const refreshTier = useAuthStore((s) => s.refreshTier);
  const t = useT();
  // Android 15+ vẽ app tràn xuống dưới thanh điều hướng của máy (edge-to-edge).
  // Chừa đúng chiều cao thanh đó (3 nút hoặc thanh vuốt) để tab không bị đè.
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  // Gói được nâng cấp trên web: hỏi lại khi vào app và mỗi lần app quay lại từ nền.
  useEffect(() => {
    refreshTier();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshTier();
    });
    return () => sub.remove();
  }, [refreshTier]);

  // Màu giao diện theo bé: giữ bé mẹ chọn lần trước nếu còn, không thì lấy bé đầu tiên.
  useEffect(() => {
    babyService
      .getProfiles()
      .then((res) => {
        if (!(res.isSuccess || res.success) || !Array.isArray(res.data)) return;
        const { babyId, setActiveBaby } = useThemeStore.getState();
        const keep = res.data.find((b) => String(b.id) === babyId);
        setActiveBaby(keep ?? res.data[0] ?? null);
      })
      .catch(() => undefined); // Lỗi mạng hoặc gói chưa đủ: giữ màu đang dùng.
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Ẩn thanh tab khi bàn phím mở để ô nhập và nút gửi có đủ chỗ.
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: a.primary,
        tabBarInactiveTintColor: MOM_THEME.mutedLight,
        tabBarStyle: {
          backgroundColor: MOM_THEME.white,
          borderTopWidth: 1,
          borderTopColor: MOM_THEME.border,
          height: 58 + bottomPad,
          paddingBottom: bottomPad,
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
          tabBarLabel: t('Tổng quan', 'Home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Journey"
        component={JourneyScreen}
        options={{
          tabBarLabel: t('Lộ trình', 'Journey'),
          tabBarIcon: ({ color, size }) => <HeartPulse size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Nutrition"
        component={BabyNutritionScreen}
        options={{
          tabBarLabel: t('Bé yêu', 'Baby'),
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
