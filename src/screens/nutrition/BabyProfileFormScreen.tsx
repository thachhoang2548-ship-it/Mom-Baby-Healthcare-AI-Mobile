import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import {
  Card,
  Chip,
  Field,
  PrimaryButton,
  Screen,
  SectionTitle,
  TierLockedCard,
  uiStyles,
} from '../../components/ui';
import DateField from '../../components/DateField';
import babyService from '../../services/babyService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { addDays, fromUtcDateIso, startOfToday, toUtcDateIso } from '../../utils/date';
import { MOM_THEME, RADII } from '../../theme/colors';

const COMMON_ALLERGIES = ['Sữa bò', 'Trứng', 'Hải sản', 'Đậu phộng', 'Đậu nành', 'Lúa mì (gluten)'];

const toNumber = (value: string): number | null => {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export default function BabyProfileFormScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'BabyProfileForm'>>();
  const baby = params?.baby;
  const isEdit = !!baby;

  const [babyName, setBabyName] = useState(baby?.babyName || '');
  const [gender, setGender] = useState<0 | 1>(baby?.gender === 1 ? 1 : 0);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(fromUtcDateIso(baby?.dateOfBirth));
  const [weight, setWeight] = useState(baby?.currentWeightKg ? String(baby.currentWeightKg) : '');
  const [height, setHeight] = useState(baby?.currentHeightCm ? String(baby.currentHeightCm) : '');
  const [allergies, setAllergies] = useState<string[]>(baby?.allergies || []);
  const [customAllergy, setCustomAllergy] = useState('');
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);

  const today = startOfToday();

  const toggleAllergy = (item: string) => {
    setAllergies((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));
  };

  const addCustomAllergy = () => {
    const value = customAllergy.trim();
    if (value && !allergies.includes(value)) setAllergies((prev) => [...prev, value]);
    setCustomAllergy('');
  };

  const save = async () => {
    const w = toNumber(weight);
    const h = toNumber(height);
    if (!babyName.trim()) {
      Alert.alert('Thiếu thông tin', 'Mẹ nhập tên hoặc tên ở nhà của bé nhé.');
      return;
    }
    if (!dateOfBirth) {
      Alert.alert('Thiếu thông tin', 'Mẹ chọn ngày sinh của bé nhé.');
      return;
    }
    if (weight && (w === null || w < 1 || w > 40)) {
      Alert.alert('Kiểm tra lại', 'Cân nặng của bé cần nằm trong khoảng 1 - 40 kg.');
      return;
    }
    if (height && (h === null || h < 30 || h > 130)) {
      Alert.alert('Kiểm tra lại', 'Chiều cao của bé cần nằm trong khoảng 30 - 130 cm.');
      return;
    }

    const data = {
      babyName: babyName.trim(),
      dateOfBirth: toUtcDateIso(dateOfBirth),
      gender,
      currentWeightKg: w,
      currentHeightCm: h,
      allergies,
      foodHistory: baby?.foodHistory || [],
    };

    setSaving(true);
    try {
      const res = isEdit
        ? await babyService.updateProfile(baby.id, data)
        : await babyService.createProfile(data);
      if (!(res.isSuccess || res.success)) {
        throw new Error(res.message || 'Không thể lưu hồ sơ bé.');
      }
      Alert.alert('Đã lưu', isEdit ? 'Hồ sơ của bé đã được cập nhật.' : 'Đã tạo hồ sơ cho bé.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      if (isTierLocked(err)) {
        setLocked(true);
      } else {
        Alert.alert('Chưa lưu được', getApiErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      eyebrow="Bé yêu"
      title={isEdit ? 'Sửa hồ sơ bé' : 'Thêm hồ sơ bé'}
      subtitle="Ngày sinh, cân nặng và dị ứng giúp Mom Ơi gợi ý thực đơn đúng độ tuổi của bé."
    >
      {locked ? <TierLockedCard feature="Hồ sơ & thực đơn cho bé" /> : null}

      <Card>
        <Field label="Tên bé" value={babyName} onChangeText={setBabyName} placeholder="VD: Bơ, Na, Minh Anh" />
        <View style={styles.field}>
          <View style={uiStyles.rowWrap}>
            <Chip label="Bé trai" selected={gender === 0} onPress={() => setGender(0)} />
            <Chip label="Bé gái" selected={gender === 1} onPress={() => setGender(1)} />
          </View>
        </View>
        <DateField
          label="Ngày sinh"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          maximumDate={today}
          minimumDate={addDays(today, -365 * 6)}
        />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field
              label="Cân nặng (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="VD: 7.8"
            />
          </View>
          <View style={styles.flex}>
            <Field
              label="Chiều cao (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="VD: 68"
            />
          </View>
        </View>
      </Card>

      <SectionTitle title="Dị ứng thực phẩm" subtitle="Thực đơn sẽ tránh các thực phẩm này" />
      <Card>
        <View style={uiStyles.rowWrap}>
          {[...COMMON_ALLERGIES, ...allergies.filter((a) => !COMMON_ALLERGIES.includes(a))].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={allergies.includes(item)}
              onPress={() => toggleAllergy(item)}
            />
          ))}
        </View>
        <View style={[styles.row, styles.customRow]}>
          <View style={styles.flex}>
            <Field
              label="Dị ứng khác"
              value={customAllergy}
              onChangeText={setCustomAllergy}
              placeholder="Nhập rồi bấm Thêm"
              onSubmitEditing={addCustomAllergy}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addCustomAllergy}>
            <Plus size={18} color={MOM_THEME.white} />
          </TouchableOpacity>
        </View>
      </Card>

      <PrimaryButton label={isEdit ? 'Lưu thay đổi' : 'Tạo hồ sơ bé'} onPress={save} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    marginBottom: 12,
  },
  customRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: RADII.control,
    backgroundColor: MOM_THEME.roseDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
