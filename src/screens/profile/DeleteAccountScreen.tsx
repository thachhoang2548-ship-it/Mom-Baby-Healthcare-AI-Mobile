import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { TriangleAlert } from 'lucide-react-native';
import { Card, Field, PrimaryButton, Screen, uiStyles } from '../../components/ui';
import authService from '../../services/authService';
import { STORAGE_KEYS } from '../../api/axiosClient';
import { useAuthStore } from '../../stores/authStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { RADII } from '../../theme/colors';
import { tr, useT } from '../../i18n';

const DELETED_DATA = [
  { vi: 'Thông tin tài khoản (họ tên, email)', en: 'Account details (name, email)' },
  { vi: 'Hồ sơ sức khỏe của mẹ và hồ sơ của bé', en: "Your health profile and your baby's profiles" },
  { vi: 'Nhật ký hằng ngày, cân nặng, chu kỳ, lịch uống vitamin', en: 'Daily logs, weight, cycles and supplement schedules' },
  { vi: 'Lịch sử hỏi trợ lý AI (kèm ảnh) và kết quả khảo sát', en: 'AI question history (with photos) and survey results' },
  { vi: 'Món ăn đã lưu và thông báo', en: 'Saved recipes and notifications' },
];

export default function DeleteAccountScreen() {
  const navigation = useNavigation();
  const { user, clearSession } = useAuthStore();
  const t = useT();
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await authService.deleteAccount(password);
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      clearSession();
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'GuestHome' }] }));
      Alert.alert(
        tr('Đã xóa tài khoản', 'Account deleted'),
        tr('Tài khoản và dữ liệu của mẹ đã được xóa khỏi Mom Ơi.', 'Your account and data have been deleted from Mom Ơi.')
      );
    } catch (err) {
      Alert.alert(tr('Chưa xóa được tài khoản', 'Could not delete your account'), getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const confirm = () => {
    if (!password) {
      Alert.alert(
        t('Cần nhập mật khẩu', 'Password needed'),
        t('Mẹ nhập mật khẩu hiện tại để xác nhận.', 'Enter your current password to confirm.')
      );
      return;
    }
    Alert.alert(
      t('Xóa vĩnh viễn tài khoản?', 'Delete your account permanently?'),
      t(
        'Toàn bộ dữ liệu sẽ bị xóa và không thể khôi phục. Gói dịch vụ còn hạn (nếu có) cũng sẽ mất.',
        'All your data will be deleted and cannot be recovered. Any remaining plan time will be lost too.'
      ),
      [
        { text: t('Hủy', 'Cancel'), style: 'cancel' },
        { text: t('Xóa tài khoản', 'Delete account'), style: 'destructive', onPress: deleteAccount },
      ]
    );
  };

  return (
    <Screen
      eyebrow={t('Tài khoản', 'Account')}
      title={t('Xóa tài khoản', 'Delete account')}
      subtitle={user?.email ? `${t('Tài khoản', 'Account')}: ${user.email}` : undefined}
    >
      <View style={styles.warning}>
        <TriangleAlert size={20} color="#B42318" />
        <Text style={styles.warningText}>
          {t(
            'Việc xóa tài khoản là vĩnh viễn. Mẹ sẽ không thể đăng nhập lại hay khôi phục dữ liệu.',
            'Deleting your account is permanent. You will not be able to sign in again or recover your data.'
          )}
        </Text>
      </View>

      <Card>
        <Text style={uiStyles.label}>{t('Dữ liệu sẽ bị xóa', 'Data that will be deleted')}</Text>
        {DELETED_DATA.map((item) => (
          <Text key={item.vi} style={[uiStyles.body, styles.item]}>
            • {t(item.vi, item.en)}
          </Text>
        ))}
      </Card>

      <Card>
        <Field
          label={t('Mật khẩu hiện tại', 'Current password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder={t('Nhập mật khẩu để xác nhận', 'Enter your password to confirm')}
        />
        <PrimaryButton
          label={t('Xóa vĩnh viễn tài khoản', 'Delete account permanently')}
          onPress={confirm}
          loading={deleting}
          style={styles.danger}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEE4E2',
    borderRadius: RADII.control,
    padding: 14,
    marginBottom: 14,
  },
  warningText: {
    flex: 1,
    color: '#7A271A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  item: {
    marginTop: 2,
  },
  danger: {
    backgroundColor: '#D92D20',
  },
});
