import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
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
import { createThemedStyles } from '../../theme/accent';
import { useT } from '../../i18n';

// Giá trị lưu lên server giữ tiếng Việt (AI dùng để tránh món); tiếng Anh chỉ để hiển thị.
const ALLERGY_EN: Record<string, string> = {
  'Sữa bò': "Cow's milk",
  Trứng: 'Eggs',
  'Hải sản': 'Seafood',
  'Đậu phộng': 'Peanuts',
  'Đậu nành': 'Soy',
  'Lúa mì (gluten)': 'Wheat (gluten)',
};
const COMMON_ALLERGIES = Object.keys(ALLERGY_EN);

const toNumber = (value: string): number | null => {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export default function BabyProfileFormScreen() {
  const styles = useStyles();
  const t = useT();
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
      Alert.alert(t('Thiếu thông tin', 'Missing details'), t('Mẹ nhập tên hoặc tên ở nhà của bé nhé.', "Please enter your baby's name or nickname."));
      return;
    }
    if (!dateOfBirth) {
      Alert.alert(t('Thiếu thông tin', 'Missing details'), t('Mẹ chọn ngày sinh của bé nhé.', "Please choose your baby's date of birth."));
      return;
    }
    if (weight && (w === null || w < 1 || w > 40)) {
      Alert.alert(t('Kiểm tra lại', 'Please check'), t('Cân nặng của bé cần nằm trong khoảng 1 - 40 kg.', 'Weight should be between 1 and 40 kg.'));
      return;
    }
    if (height && (h === null || h < 30 || h > 130)) {
      Alert.alert(t('Kiểm tra lại', 'Please check'), t('Chiều cao của bé cần nằm trong khoảng 30 - 130 cm.', 'Height should be between 30 and 130 cm.'));
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
        throw new Error(res.message || t('Không thể lưu hồ sơ bé.', "Could not save your baby's profile."));
      }
      Alert.alert(t('Đã lưu', 'Saved'), isEdit ? t('Hồ sơ của bé đã được cập nhật.', "Your baby's profile is updated.") : t('Đã tạo hồ sơ cho bé.', "Your baby's profile is created."), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      if (isTierLocked(err)) {
        setLocked(true);
      } else {
        Alert.alert(t('Chưa lưu được', 'Could not save'), getApiErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      eyebrow={t('Bé yêu', 'Your baby')}
      title={isEdit ? t('Sửa hồ sơ bé', 'Edit baby profile') : t('Thêm hồ sơ bé', 'Add a baby')}
      subtitle={t(
        'Ngày sinh, cân nặng và dị ứng giúp Mom Ơi gợi ý thực đơn đúng độ tuổi của bé.',
        "Birth date, weight and allergies help Mom Ơi suggest meals for your baby's age."
      )}
    >
      {locked ? <TierLockedCard feature={t('Hồ sơ & thực đơn cho bé', 'Baby profile & menus')} /> : null}

      <Card>
        <Field
          label={t('Tên bé', "Baby's name")}
          value={babyName}
          onChangeText={setBabyName}
          placeholder={t('VD: Bơ, Na, Minh Anh', 'e.g. Bo, Na, Minh Anh')}
        />
        <View style={styles.field}>
          <View style={uiStyles.rowWrap}>
            <Chip label={t('Bé trai', 'Boy')} selected={gender === 0} onPress={() => setGender(0)} />
            <Chip label={t('Bé gái', 'Girl')} selected={gender === 1} onPress={() => setGender(1)} />
          </View>
          <Text style={[uiStyles.muted, styles.genderHint]}>
            {t(
              'Bé trai thì app chuyển sang màu xanh, bé gái giữ màu hồng.',
              'The app turns blue for a boy and stays pink for a girl.'
            )}
          </Text>
        </View>
        <DateField
          label={t('Ngày sinh', 'Date of birth')}
          value={dateOfBirth}
          onChange={setDateOfBirth}
          maximumDate={today}
          minimumDate={addDays(today, -365 * 6)}
        />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field
              label={t('Cân nặng (kg)', 'Weight (kg)')}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder={t('VD: 7.8', 'e.g. 7.8')}
            />
          </View>
          <View style={styles.flex}>
            <Field
              label={t('Chiều cao (cm)', 'Height (cm)')}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder={t('VD: 68', 'e.g. 68')}
            />
          </View>
        </View>
      </Card>

      <SectionTitle
        title={t('Dị ứng thực phẩm', 'Food allergies')}
        subtitle={t('Thực đơn sẽ tránh các thực phẩm này', 'Menus will avoid these foods')}
      />
      <Card>
        <View style={uiStyles.rowWrap}>
          {[...COMMON_ALLERGIES, ...allergies.filter((a) => !COMMON_ALLERGIES.includes(a))].map((item) => (
            <Chip
              key={item}
              label={ALLERGY_EN[item] ? t(item, ALLERGY_EN[item]) : item}
              selected={allergies.includes(item)}
              onPress={() => toggleAllergy(item)}
            />
          ))}
        </View>
        <View style={[styles.row, styles.customRow]}>
          <View style={styles.flex}>
            <Field
              label={t('Dị ứng khác', 'Other allergy')}
              value={customAllergy}
              onChangeText={setCustomAllergy}
              placeholder={t('Nhập rồi bấm Thêm', 'Type it, then tap +')}
              onSubmitEditing={addCustomAllergy}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addCustomAllergy}>
            <Plus size={18} color={MOM_THEME.white} />
          </TouchableOpacity>
        </View>
      </Card>

      <PrimaryButton label={isEdit ? t('Lưu thay đổi', 'Save changes') : t('Tạo hồ sơ bé', 'Create profile')} onPress={save} loading={saving} />
    </Screen>
  );
}

const useStyles = createThemedStyles((a) => ({
  genderHint: {
    marginTop: 8,
  },
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
    backgroundColor: a.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
}));
