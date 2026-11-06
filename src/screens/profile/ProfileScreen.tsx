import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Baby, CalendarHeart, Heart, LogOut, Plus } from 'lucide-react-native';
import {
  Card,
  Chip,
  ErrorState,
  Field,
  InfoRow,
  LoadingView,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
  ToggleRow,
  uiStyles,
} from '../../components/ui';
import DateField from '../../components/DateField';
import profileService, { getStageIndex, MomProfileDto, StageIndex } from '../../services/profileService';
import featureService from '../../services/featureService';
import { getTierDisplayName, useAuthStore } from '../../stores/authStore';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage, isNetworkError } from '../../utils/apiError';
import {
  addDays,
  dueDateFromLmp,
  formatDate,
  fromUtcDateIso,
  pregnancyWeekFromLmp,
  startOfToday,
  toUtcDateIso,
} from '../../utils/date';
import { MOM_THEME, RADII } from '../../theme/colors';
import { PRIVACY_POLICY_URL } from '../../constants/links';
import { tr, useT } from '../../i18n';

// Cùng danh sách với web (ProfilePage.jsx); sửa lỗi chính tả "Dị ứng ứng thuốc".
// Giá trị tiếng Việt được lưu lên server; tiếng Anh chỉ để hiển thị.
const COMMON_CONDITIONS = ['Cao huyết áp', 'Thiếu máu', 'Suy nhược', 'Dị ứng thuốc', 'Hen suyễn'];
const CONDITION_EN: Record<string, string> = {
  'Cao huyết áp': 'High blood pressure',
  'Thiếu máu': 'Anemia',
  'Suy nhược': 'Fatigue / weakness',
  'Dị ứng thuốc': 'Drug allergy',
  'Hen suyễn': 'Asthma',
};

const STAGE_OPTIONS: { id: StageIndex; label: string; labelEn: string; desc: string; descEn: string; icon: typeof Heart }[] = [
  {
    id: 0,
    label: 'Chuẩn bị mang thai',
    labelEn: 'Trying to conceive',
    desc: 'Theo dõi chu kỳ & ngày rụng trứng',
    descEn: 'Track your cycle & ovulation',
    icon: CalendarHeart,
  },
  {
    id: 1,
    label: 'Đang mang thai',
    labelEn: 'Pregnant',
    desc: 'Theo dõi tuần thai & sự phát triển của bé',
    descEn: 'Follow your pregnancy week & baby’s growth',
    icon: Heart,
  },
  {
    id: 2,
    label: 'Sau sinh & nuôi con',
    labelEn: 'After birth & parenting',
    desc: 'Hồi phục sức khỏe mẹ & chăm bé',
    descEn: 'Your recovery & baby care',
    icon: Baby,
  },
];

const toNumber = (value: string): number | null => {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const toText = (value: unknown) =>
  value === null || value === undefined || value === '' ? '' : String(value);

const MAX_NAME_LENGTH = 100; // Cùng giới hạn với backend (UpdateNameDto).

/** Dòng họ tên trong thẻ tài khoản: xem, bấm "Đổi" để sửa và lưu lên server. */
function NameEditor({ fullName }: { fullName?: string }) {
  const updateFullName = useAuthStore((s) => s.updateFullName);
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <View style={styles.nameRow}>
        <View style={styles.flex}>
          <Text style={styles.nameLabel}>{t('Họ và tên', 'Full name')}</Text>
          <Text style={styles.nameValue}>{fullName || t('Chưa cập nhật', 'Not set')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setDraft(fullName ?? '');
            setEditing(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('Đổi họ và tên', 'Change your name')}
          hitSlop={8}
        >
          <Text style={styles.nameAction}>{t('Đổi', 'Change')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trimmed = draft.trim();
  const save = async () => {
    setSaving(true);
    try {
      await updateFullName(trimmed);
      setEditing(false);
    } catch (err) {
      Alert.alert(t('Chưa lưu được', 'Not saved'), getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.nameEditor}>
      <Field
        label={t('Họ và tên', 'Full name')}
        value={draft}
        onChangeText={setDraft}
        maxLength={MAX_NAME_LENGTH}
        autoCapitalize="words"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={trimmed ? save : undefined}
      />
      <View style={styles.row}>
        <SecondaryButton label={t('Hủy', 'Cancel')} onPress={() => setEditing(false)} disabled={saving} style={styles.flex} />
        <PrimaryButton
          label={t('Lưu tên', 'Save name')}
          onPress={save}
          loading={saving}
          disabled={!trimmed || trimmed === fullName}
          style={styles.flex}
        />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, tier, logout } = useAuthStore();
  const t = useT();

  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [saving, setSaving] = useState(false);

  const [stage, setStage] = useState<StageIndex>(0);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState('28');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [isBreastfeeding, setIsBreastfeeding] = useState(true);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [hasGestDiabetes, setHasGestDiabetes] = useState(false);
  const [conditions, setConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');

  const applyProfile = (p: MomProfileDto) => {
    setProfile(p);
    setStage(getStageIndex(p.stage));
    setLastPeriodDate(fromUtcDateIso(p.lastPeriodDate));
    setCycleLength(toText(p.avgCycleLength) || '28');
    setDeliveryDate(fromUtcDateIso(p.deliveryDate));
    setIsBreastfeeding(p.isBreastfeeding ?? true);
    setHeight(toText(p.height));
    setWeight(toText(p.weight));
    setBloodSugar(toText(p.bloodSugarLevel));
    setHasGestDiabetes(!!p.hasGestDiabetes);
    setConditions(p.medicalConditions || []);
  };

  const load = useCallback(async () => {
    try {
      const res = await profileService.getProfile();
      if ((res.isSuccess || res.success) && res.data) {
        applyProfile(res.data);
        setLoadError(null);
      } else {
        setOffline(false);
        setLoadError(res.message || tr('Không tải được hồ sơ.', 'Could not load your profile.'));
      }
    } catch (err) {
      setOffline(isNetworkError(err));
      setLoadError(getApiErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const bmi = useMemo(() => {
    const h = toNumber(height);
    const w = toNumber(weight);
    if (!h || !w || h <= 0) return null;
    return Math.round((w / ((h / 100) * (h / 100))) * 10) / 10;
  }, [height, weight]);

  const pregnancyWeek = stage === 1 && lastPeriodDate ? pregnancyWeekFromLmp(lastPeriodDate) : null;
  const dueDate = stage === 1 && lastPeriodDate ? dueDateFromLmp(lastPeriodDate) : null;
  const today = startOfToday();

  const toggleCondition = (cond: string) => {
    setConditions((prev) => (prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]));
  };

  const addCustomCondition = () => {
    const value = customCondition.trim();
    if (value && !conditions.includes(value)) {
      setConditions((prev) => [...prev, value]);
    }
    setCustomCondition('');
  };

  const validate = (): string | null => {
    const h = toNumber(height);
    const w = toNumber(weight);
    if (height && (h === null || h < 50 || h > 250))
      return t('Chiều cao cần nằm trong khoảng 50 - 250 cm.', 'Height should be between 50 and 250 cm.');
    if (weight && (w === null || w < 20 || w > 300))
      return t('Cân nặng cần nằm trong khoảng 20 - 300 kg.', 'Weight should be between 20 and 300 kg.');
    if (stage === 0) {
      const c = parseInt(cycleLength, 10);
      if (!Number.isFinite(c) || c < 20 || c > 45)
        return t('Độ dài chu kỳ thường từ 20 đến 45 ngày.', 'A cycle is usually 20 to 45 days long.');
    }
    if (stage === 1 && !lastPeriodDate)
      return t('Mẹ chọn ngày đầu kỳ kinh cuối để tính tuần thai nhé.', 'Pick the first day of your last period to work out your pregnancy week.');
    if (stage === 2 && !deliveryDate) return t('Mẹ chọn ngày sinh em bé nhé.', 'Pick your baby’s birth date.');
    if (stage === 2 && deliveryDate && deliveryDate > today)
      return t('Ngày sinh em bé không thể sau hôm nay.', 'The birth date cannot be after today.');
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) {
      Alert.alert(t('Kiểm tra lại thông tin', 'Check your details'), problem);
      return;
    }

    // PUT ghi đè toàn bộ hồ sơ nên gửi đủ trường, cùng cấu trúc với web (ProfilePage.jsx).
    const payload: MomProfileDto = {
      id: profile?.id ?? 0,
      userId: profile?.userId ?? user?.id,
      stage,
      pregnancyWeek,
      bmi,
      height: toNumber(height),
      weight: toNumber(weight),
      bloodSugarLevel: toNumber(bloodSugar),
      hasGestDiabetes,
      medicalConditions: conditions,
      avgCycleLength: stage === 0 ? parseInt(cycleLength, 10) : null,
      lastPeriodDate: stage !== 2 && lastPeriodDate ? toUtcDateIso(lastPeriodDate) : null,
      deliveryDate:
        stage === 1 && dueDate
          ? toUtcDateIso(dueDate)
          : stage === 2 && deliveryDate
            ? toUtcDateIso(deliveryDate)
            : null,
      isBreastfeeding: stage === 2 ? isBreastfeeding : false,
    };

    setSaving(true);
    try {
      const res = await profileService.updateProfile(payload);
      if (!(res.isSuccess || res.success)) {
        throw new Error(res.message || t('Không thể cập nhật hồ sơ.', 'Could not update your profile.'));
      }
      const newWeight = toNumber(weight);
      if (stage === 1 && newWeight && newWeight !== toNumber(toText(profile?.weight))) {
        // Web cũng ghi thêm một mốc cân nặng thai kỳ khi mẹ đổi cân nặng.
        await featureService.logPregnancyWeight(newWeight).catch(() => undefined);
      }
      if (res.data) applyProfile(res.data);
      Alert.alert(t('Đã lưu', 'Saved'), t('Hồ sơ sức khỏe của mẹ đã được cập nhật.', 'Your health profile is updated.'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert(t('Chưa lưu được', 'Not saved'), getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(t('Đăng xuất', 'Sign out'), t('Mẹ có chắc muốn đăng xuất khỏi Mom Ơi không?', 'Do you want to sign out of Mom Ơi?'), [
      { text: t('Hủy', 'Cancel'), style: 'cancel' },
      {
        text: t('Đăng xuất', 'Sign out'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'GuestHome' }] }));
        },
      },
    ]);
  };

  const eyebrow = t('Hồ sơ sức khỏe', 'Health profile');
  const screenTitle = t('Hồ sơ của mẹ', 'Your profile');

  if (loadError) {
    return (
      <Screen eyebrow={eyebrow} title={screenTitle}>
        <ErrorState message={loadError} onRetry={load} offline={offline} />
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen eyebrow={eyebrow} title={screenTitle}>
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen
      eyebrow={eyebrow}
      title={screenTitle}
      subtitle={t(
        'Thông tin này giúp Mom Ơi cá nhân hóa lộ trình, thực đơn và lời khuyên cho mẹ.',
        'This helps Mom Ơi personalize your journey, menus and tips.'
      )}
    >
      <Card>
        <NameEditor fullName={user?.fullName} />
        <InfoRow label="Email" value={user?.email || t('Chưa cập nhật', 'Not set')} />
        <InfoRow label={t('Gói dịch vụ', 'Plan')} value={getTierDisplayName(tier)} />
      </Card>

      <SectionTitle
        title={t('Giai đoạn hiện tại', 'Current stage')}
        subtitle={t('Chọn đúng giai đoạn để nhận nội dung phù hợp', 'Pick your stage to get the right content')}
      />
      {STAGE_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = stage === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.stageOption, active && styles.stageOptionActive]}
            onPress={() => {
              // Khi đang mang thai, deliveryDate là ngày dự sinh (tương lai): không dùng làm ngày sinh bé.
              if (opt.id === 2 && deliveryDate && deliveryDate > today) setDeliveryDate(null);
              setStage(opt.id);
            }}
            activeOpacity={0.85}
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.stageIcon, active && styles.stageIconActive]}>
              <Icon size={18} color={active ? MOM_THEME.white : MOM_THEME.roseDark} />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.stageLabel, active && styles.stageLabelActive]}>{t(opt.label, opt.labelEn)}</Text>
              <Text style={styles.stageDesc}>{t(opt.desc, opt.descEn)}</Text>
            </View>
            <View style={[styles.radio, active && styles.radioActive]} />
          </TouchableOpacity>
        );
      })}

      <Card style={styles.stageCard}>
        {stage === 0 ? (
          <>
            <DateField
              label={t('Ngày đầu kỳ kinh gần nhất', 'First day of your last period')}
              value={lastPeriodDate}
              onChange={setLastPeriodDate}
              maximumDate={today}
              minimumDate={addDays(today, -120)}
            />
            <Field
              label={t('Độ dài chu kỳ trung bình (ngày)', 'Average cycle length (days)')}
              value={cycleLength}
              onChangeText={setCycleLength}
              keyboardType="number-pad"
              hint={t('Thường từ 21 đến 35 ngày', 'Usually 21 to 35 days')}
            />
          </>
        ) : stage === 1 ? (
          <>
            <DateField
              label={t('Ngày đầu kỳ kinh cuối (LMP)', 'First day of last period (LMP)')}
              value={lastPeriodDate}
              onChange={setLastPeriodDate}
              maximumDate={today}
              minimumDate={addDays(today, -300)}
            />
            {pregnancyWeek && dueDate ? (
              <View style={styles.computedBox}>
                <Text style={styles.computedText}>
                  {t('Tuần thai hiện tại: ', 'Pregnancy week: ')}
                  <Text style={styles.computedStrong}>{t(`tuần ${pregnancyWeek}`, `week ${pregnancyWeek}`)}</Text>
                </Text>
                <Text style={styles.computedText}>
                  {t('Ngày dự sinh: ', 'Due date: ')}
                  <Text style={styles.computedStrong}>{formatDate(dueDate)}</Text>
                </Text>
                <Text style={styles.computedHint}>
                  {t('Tự tính: ngày kinh cuối + 280 ngày', 'Worked out as last period + 280 days')}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <DateField
              label={t('Ngày sinh em bé', 'Baby’s birth date')}
              value={deliveryDate}
              onChange={setDeliveryDate}
              maximumDate={today}
              minimumDate={addDays(today, -365 * 3)}
            />
            <ToggleRow
              label={t('Mẹ đang nuôi con bằng sữa mẹ', 'I am breastfeeding')}
              value={isBreastfeeding}
              onValueChange={setIsBreastfeeding}
            />
          </>
        )}
      </Card>

      <SectionTitle title={t('Chỉ số cơ thể', 'Body measurements')} />
      <Card>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field
              label={t('Chiều cao (cm)', 'Height (cm)')}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder={t('VD: 158', 'e.g. 158')}
            />
          </View>
          <View style={styles.flex}>
            <Field
              label={t('Cân nặng (kg)', 'Weight (kg)')}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder={t('VD: 52.5', 'e.g. 52.5')}
            />
          </View>
        </View>
        <Text style={uiStyles.muted}>
          BMI: <Text style={styles.computedStrong}>{bmi ?? '—'}</Text>
        </Text>
        <View style={styles.spacer} />
        <Field
          label={t('Đường huyết lúc đói (mmol/L)', 'Fasting blood sugar (mmol/L)')}
          value={bloodSugar}
          onChangeText={setBloodSugar}
          keyboardType="decimal-pad"
          placeholder={t('VD: 5.1', 'e.g. 5.1')}
        />
        <ToggleRow
          label={t('Mẹ được chẩn đoán tiểu đường thai kỳ', 'I have been diagnosed with gestational diabetes')}
          value={hasGestDiabetes}
          onValueChange={setHasGestDiabetes}
        />
      </Card>

      <SectionTitle
        title={t('Tiền sử bệnh', 'Health history')}
        subtitle={t('Chọn các bệnh lý mẹ đang có (nếu có)', 'Pick any conditions you have')}
      />
      <Card>
        <View style={uiStyles.rowWrap}>
          {[...COMMON_CONDITIONS, ...conditions.filter((c) => !COMMON_CONDITIONS.includes(c))].map(
            (cond) => (
              <Chip
                key={cond}
                label={t(cond, CONDITION_EN[cond] ?? cond)}
                selected={conditions.includes(cond)}
                onPress={() => toggleCondition(cond)}
              />
            )
          )}
        </View>
        <View style={[styles.row, styles.customRow]}>
          <View style={styles.flex}>
            <Field
              label={t('Bệnh lý khác', 'Other condition')}
              value={customCondition}
              onChangeText={setCustomCondition}
              placeholder={t('Nhập rồi bấm Thêm', 'Type it, then tap +')}
              onSubmitEditing={addCustomCondition}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addCustomCondition}
            accessibilityRole="button"
            accessibilityLabel={t('Thêm bệnh lý', 'Add condition')}
          >
            <Plus size={18} color={MOM_THEME.white} />
          </TouchableOpacity>
        </View>
      </Card>

      <PrimaryButton label={t('Lưu hồ sơ', 'Save profile')} onPress={save} loading={saving} />
      <SecondaryButton
        label={t('Đăng xuất', 'Sign out')}
        onPress={confirmLogout}
        icon={<LogOut size={16} color={MOM_THEME.roseDeep} />}
        style={styles.logout}
      />
      <TouchableOpacity
        style={styles.deleteAccount}
        onPress={() => navigation.navigate('DeleteAccount')}
        accessibilityRole="button"
      >
        <Text style={styles.deleteAccountText}>{t('Xóa tài khoản', 'Delete account')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.policyLink}
        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        accessibilityRole="link"
      >
        <Text style={styles.policyText}>
          {t('Điều khoản & Chính sách quyền riêng tư', 'Terms & Privacy Policy (Vietnamese)')}
        </Text>
      </TouchableOpacity>
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
  spacer: {
    height: 12,
  },
  // Cùng kiểu với InfoRow, thêm nút "Đổi" bên phải.
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MOM_THEME.borderSoft,
  },
  nameLabel: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameValue: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '700',
  },
  nameEditor: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: MOM_THEME.borderSoft,
  },
  nameAction: {
    color: MOM_THEME.roseDark,
    fontWeight: '700',
  },
  stageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    padding: 14,
    marginBottom: 10,
  },
  stageOptionActive: {
    borderColor: MOM_THEME.roseDark,
    backgroundColor: MOM_THEME.pinkLight,
  },
  stageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MOM_THEME.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconActive: {
    backgroundColor: MOM_THEME.roseDark,
  },
  stageLabel: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
  stageLabelActive: {
    color: MOM_THEME.roseDeep,
  },
  stageDesc: {
    color: MOM_THEME.muted,
    fontSize: 12,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: MOM_THEME.border,
  },
  radioActive: {
    borderColor: MOM_THEME.roseDark,
    borderWidth: 6,
  },
  stageCard: {
    marginTop: 4,
  },
  computedBox: {
    backgroundColor: MOM_THEME.pinkLight,
    borderRadius: RADII.control,
    padding: 12,
    gap: 4,
  },
  computedText: {
    color: MOM_THEME.charcoalMid,
    fontSize: 14,
  },
  computedStrong: {
    color: MOM_THEME.roseDeep,
    fontWeight: '800',
  },
  computedHint: {
    color: MOM_THEME.muted,
    fontSize: 11,
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
  logout: {
    marginTop: 12,
  },
  deleteAccount: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  policyLink: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  policyText: {
    color: MOM_THEME.muted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  deleteAccountText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
