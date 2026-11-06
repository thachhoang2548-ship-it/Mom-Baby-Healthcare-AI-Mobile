import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../theme/colors';
import { Mail, Lock, Eye, EyeOff, Sparkles, HeartHandshake } from 'lucide-react-native';
import LanguageToggle from '../../components/LanguageToggle';
import { useT } from '../../i18n';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, isLoading, error, clearError } = useAuthStore();
  const t = useT();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Lỗi lưu trong store dùng chung với màn Đăng ký: xóa khi mở màn để không hiện lỗi cũ.
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('Thông báo', 'Missing details'), t('Vui lòng nhập đầy đủ Email và Mật khẩu.', 'Please enter your email and password.'));
      return;
    }

    clearError();
    const result = await login(email, password);
    if (result.success) {
      navigation.replace('MainTabs');
    } else {
      Alert.alert(
        t('Đăng nhập thất bại', 'Sign-in failed'),
        result.message || t('Sai tài khoản hoặc mật khẩu.', 'Incorrect email or password.')
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.langRow}>
          <LanguageToggle />
        </View>

        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.iconCircle}>
              <HeartHandshake size={28} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.welcomeText}>{t('Chào mừng trở lại! 🌸', 'Welcome back! 🌸')}</Text>
          <Text style={styles.subText}>
            {t(
              'Đăng nhập vào Mom Ơi để tiếp tục theo dõi sức khỏe và dinh dưỡng',
              'Sign in to Mom Ơi to keep tracking your health and nutrition'
            )}
          </Text>
        </View>

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form Inputs */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={t('nhap.email@example.com', 'your.email@example.com')}
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                clearError();
                setEmail(text);
              }}
            />
          </View>

          <Text style={styles.inputLabel}>{t('Mật khẩu', 'Password')}</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { paddingRight: 40 }]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                clearError();
                setPassword(text);
              }}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} color={COLORS.textMuted} />
              ) : (
                <Eye size={18} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginBtnText}>{t('Đăng nhập', 'Sign in')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Switch to Register */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('Chưa có tài khoản? ', 'No account yet? ')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>{t('Đăng ký ngay', 'Create one')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoCard}>
          <Sparkles size={14} color={COLORS.secondary} style={{ marginRight: 6 }} />
          <Text style={styles.demoText}>
            {t(
              'Thông tin trong Mom Ơi chỉ mang tính tham khảo, không thay thế bác sĩ.',
              'Information in Mom Ơi is for reference only and does not replace a doctor.'
            )}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  langRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badgeRow: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  errorBox: {
    backgroundColor: COLORS.roseLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.rose,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  eyeBtn: {
    padding: 8,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  demoCard: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  demoText: {
    fontSize: 11,
    color: COLORS.secondaryDark,
    fontWeight: '600',
  },
});
