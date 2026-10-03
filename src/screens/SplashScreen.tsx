import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../theme/colors';
import { Sparkles, Heart } from 'lucide-react-native';

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { initAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      await initAuth();
    };
    checkSession();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('GuestHome');
      }
    }
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Heart size={44} color={COLORS.primary} fill={COLORS.primaryLight} />
        <View style={styles.sparkleBadge}>
          <Sparkles size={16} color={COLORS.secondary} />
        </View>
      </View>

      <Text style={styles.title}>Mom Ơi</Text>
      <Text style={styles.subtitle}>Trợ lý Y tế & Dinh dưỡng AI cho Mẹ & Bé</Text>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang khởi động...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    marginBottom: 24,
  },
  sparkleBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: 12,
    padding: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 280,
  },
  loaderContainer: {
    marginTop: 48,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
