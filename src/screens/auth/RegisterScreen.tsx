import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../theme/colors';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react-native';
import { PRIVACY_POLICY_URL } from '../../constants/links';
import { useT } from '../../i18n';
import { createThemedStyles } from '../../theme/accent';

export default function RegisterScreen() {
  const styles = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuthStore();
  const t = useT();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert(t('Thông báo', 'Missing details'), t('Vui lòng điền đầy đủ các thông tin.', 'Please fill in every field.'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('Lỗi', 'Check your password'), t('Mật khẩu xác nhận không khớp.', 'The two passwords do not match.'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        t('Lỗi', 'Check your password'),
        t('Mật khẩu phải có độ dài tối thiểu 6 ký tự.', 'Use at least 6 characters for your password.')
      );
      return;
    }

    // Dữ liệu sức khỏe là dữ liệu nhạy cảm (Nghị định 13/2023): cần mẹ đồng ý trước khi tạo tài khoản.
    if (!agreed) {
      Alert.alert(
        t('Cần mẹ đồng ý', 'Consent needed'),
        t(
          'Mẹ vui lòng đọc và đồng ý với Điều khoản & Chính sách quyền riêng tư để tiếp tục.',
          'Please read and accept the Terms & Privacy Policy to continue.'
        )
      );
      return;
    }

    clearError();
    const result = await register(email, password, fullName);
    if (result.success) {
      Alert.alert(
        t('Chúc mừng!', 'Account created'),
        t('Đăng ký tài khoản thành công! Hãy đăng nhập.', 'Your account is ready. Please sign in.'),
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert(t('Đăng ký thất bại', 'Sign-up failed'), result.message || t('Không thể tạo tài khoản.', 'Could not create the account.'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 40 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.welcomeText}>{t('Tạo tài khoản mới 🌸', 'Create your account 🌸')}</Text>
          <Text style={styles.subText}>
            {t(
              'Đồng hành cùng Mom Ơi chăm sóc sức khỏe gia đình trọn vẹn',
              'Care for your family’s health together with Mom Ơi'
            )}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.inputLabel}>{t('Họ và tên của mẹ', 'Your full name')}</Text>
          <View style={styles.inputWrapper}>
            <User size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={t('Nguyễn Thị Mai', 'Jane Smith')}
              placeholderTextColor={COLORS.textLight}
              value={fullName}
              onChangeText={(text) => {
                clearError();
                setFullName(text);
              }}
            />
          </View>

          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={t('mai.nguyen@example.com', 'jane.smith@example.com')}
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
              placeholder={t('Tối thiểu 6 ký tự', 'At least 6 characters')}
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

          <Text style={styles.inputLabel}>{t('Xác nhận mật khẩu', 'Confirm password')}</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={t('Nhập lại mật khẩu', 'Type it again')}
              placeholderTextColor={COLORS.textLight}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View style={styles.consentRow}>
            <TouchableOpacity
              style={[styles.checkbox, agreed && styles.checkboxChecked]}
              onPress={() => setAgreed((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
              accessibilityLabel={t(
                'Đồng ý điều khoản và chính sách quyền riêng tư',
                'Accept the terms and privacy policy'
              )}
            >
              {agreed ? <Check size={14} color={COLORS.white} /> : null}
            </TouchableOpacity>
            <Text style={styles.consentText}>
              {t('Tôi đã đọc và đồng ý với ', 'I have read and accept the ')}
              <Text style={styles.consentLink} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                {t('Điều khoản & Chính sách quyền riêng tư', 'Terms & Privacy Policy (Vietnamese)')}
              </Text>
              {t(
                ', đồng ý để Mom Ơi xử lý dữ liệu sức khỏe của tôi và bé nhằm cá nhân hóa gợi ý chăm sóc.',
                ', and allow Mom Ơi to process my and my baby’s health data to personalize care suggestions.'
              )}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, isLoading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.registerBtnText}>{t('Hoàn tất đăng ký', 'Create account')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('Đã có tài khoản? ', 'Already have an account? ')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>{t('Đăng nhập', 'Sign in')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles((a) => ({
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: a.primary,
    borderColor: a.primary,
  },
  consentText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  consentLink: {
    color: a.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: COLORS.roseLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
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
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 50,
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
  registerBtn: {
    backgroundColor: a.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    shadowColor: a.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
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
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: a.primary,
  },
}));
