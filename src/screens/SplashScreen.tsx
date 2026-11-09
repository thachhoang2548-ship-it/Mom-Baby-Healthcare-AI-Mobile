import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../theme/colors';
import { Sparkles, Heart } from 'lucide-react-native';
import { useLanguageStore, useT } from '../i18n';
import { createThemedStyles, useAccent, useThemeStore } from '../theme/accent';

export default function SplashScreen() {
  const a = useAccent();
  const styles = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { initAuth, isAuthenticated, isLoading } = useAuthStore();
  const initLang = useLanguageStore((s) => s.initLang);
  const initTheme = useThemeStore((s) => s.initTheme);
  const t = useT();

  useEffect(() => {
    const checkSession = async () => {
      // Đọc ngôn ngữ và màu trước: initAuth xong là chuyển màn ngay.
      await Promise.all([initLang(), initTheme()]);
      await initAuth();
    };
    checkSession();
  }, [initAuth, initLang, initTheme]);

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
        <Heart size={44} color={a.primary} fill={a.light} />
        <View style={styles.sparkleBadge}>
          <Sparkles size={16} color={COLORS.secondary} />
        </View>
      </View>

      <Text style={styles.title}>Mom Ơi</Text>
      <Text style={styles.subtitle}>
        {t('Đồng hành sức khỏe & dinh dưỡng cho mẹ và bé', 'Health and nutrition companion for mom and baby')}
      </Text>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={a.primary} />
        <Text style={styles.loadingText}>{t('Đang khởi động...', 'Starting...')}</Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles((a) => ({
  container: {
    flex: 1,
    backgroundColor: a.light,
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
    shadowColor: a.primary,
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
}));
