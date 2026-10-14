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

const DELETED_DATA = [
  'Thông tin tài khoản (họ tên, email)',
  'Hồ sơ sức khỏe của mẹ và hồ sơ của bé',
  'Nhật ký hằng ngày, cân nặng, chu kỳ, lịch uống thuốc',
  'Lịch sử phân tích triệu chứng (kèm ảnh) và kết quả EPDS',
  'Món ăn đã lưu và thông báo',
];

export default function DeleteAccountScreen() {
  const navigation = useNavigation();
  const { user, clearSession } = useAuthStore();
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await authService.deleteAccount(password);
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      clearSession();
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'GuestHome' }] }));
      Alert.alert('Đã xóa tài khoản', 'Tài khoản và dữ liệu của mẹ đã được xóa khỏi Mom Ơi.');
    } catch (err) {
      Alert.alert('Chưa xóa được tài khoản', getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const confirm = () => {
    if (!password) {
      Alert.alert('Cần nhập mật khẩu', 'Mẹ nhập mật khẩu hiện tại để xác nhận.');
      return;
    }
    Alert.alert(
      'Xóa vĩnh viễn tài khoản?',
      'Toàn bộ dữ liệu sẽ bị xóa và không thể khôi phục. Gói dịch vụ còn hạn (nếu có) cũng sẽ mất.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa tài khoản', style: 'destructive', onPress: deleteAccount },
      ]
    );
  };

  return (
    <Screen
      eyebrow="Tài khoản"
      title="Xóa tài khoản"
      subtitle={user?.email ? `Tài khoản: ${user.email}` : undefined}
    >
      <View style={styles.warning}>
        <TriangleAlert size={20} color="#B42318" />
        <Text style={styles.warningText}>
          Việc xóa tài khoản là vĩnh viễn. Mẹ sẽ không thể đăng nhập lại hay khôi phục dữ liệu.
        </Text>
      </View>

      <Card>
        <Text style={uiStyles.label}>Dữ liệu sẽ bị xóa</Text>
        {DELETED_DATA.map((item) => (
          <Text key={item} style={[uiStyles.body, styles.item]}>
            • {item}
          </Text>
        ))}
      </Card>

      <Card>
        <Field
          label="Mật khẩu hiện tại"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Nhập mật khẩu để xác nhận"
        />
        <PrimaryButton label="Xóa vĩnh viễn tài khoản" onPress={confirm} loading={deleting} style={styles.danger} />
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
