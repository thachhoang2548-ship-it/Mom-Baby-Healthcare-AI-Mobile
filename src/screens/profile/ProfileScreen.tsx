import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { getApiErrorMessage } from '../../utils/apiError';
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

// Cùng danh sách với web (ProfilePage.jsx); sửa lỗi chính tả "Dị ứng ứng thuốc".
const COMMON_CONDITIONS = ['Cao huyết áp', 'Thiếu máu', 'Suy nhược', 'Dị ứng thuốc', 'Hen suyễn'];

const STAGE_OPTIONS: { id: StageIndex; label: string; desc: string; icon: typeof Heart }[] = [
  { id: 0, label: 'Chuẩn bị mang thai', desc: 'Theo dõi chu kỳ & ngày rụng trứng', icon: CalendarHeart },
  { id: 1, label: 'Đang mang thai', desc: 'Theo dõi tuần thai & sự phát triển của bé', icon: Heart },
  { id: 2, label: 'Sau sinh & nuôi con', desc: 'Hồi phục sức khỏe mẹ & chăm bé', icon: Baby },
];

const toNumber = (value: string): number | null => {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const toText = (value: unknown) =>
  value === null || value === undefined || value === '' ? '' : String(value);

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, tier, logout } = useAuthStore();

  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
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
        setLoadError(res.message || 'Không tải được hồ sơ.');
      }
    } catch (err) {
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
    if (height && (h === null || h < 50 || h > 250)) return 'Chiều cao cần nằm trong khoảng 50 - 250 cm.';
    if (weight && (w === null || w < 20 || w > 300)) return 'Cân nặng cần nằm trong khoảng 20 - 300 kg.';
    if (stage === 0) {
      const c = parseInt(cycleLength, 10);
      if (!Number.isFinite(c) || c < 20 || c > 45) return 'Độ dài chu kỳ thường từ 20 đến 45 ngày.';
    }
    if (stage === 1 && !lastPeriodDate) return 'Mẹ chọn ngày đầu kỳ kinh cuối để tính tuần thai nhé.';
    if (stage === 2 && !deliveryDate) return 'Mẹ chọn ngày sinh em bé nhé.';
    if (stage === 2 && deliveryDate && deliveryDate > today) return 'Ngày sinh em bé không thể sau hôm nay.';
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) {
      Alert.alert('Kiểm tra lại thông tin', problem);
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
        throw new Error(res.message || 'Không thể cập nhật hồ sơ.');
      }
      const newWeight = toNumber(weight);
      if (stage === 1 && newWeight && newWeight !== toNumber(toText(profile?.weight))) {
        // Web cũng ghi thêm một mốc cân nặng thai kỳ khi mẹ đổi cân nặng.
        await featureService.logPregnancyWeight(newWeight).catch(() => undefined);
      }
      if (res.data) applyProfile(res.data);
      Alert.alert('Đã lưu', 'Hồ sơ sức khỏe của mẹ đã được cập nhật.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert('Đăng xuất', 'Mẹ có chắc muốn đăng xuất khỏi Mom Ơi không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'GuestHome' }] }));
        },
      },
    ]);
  };

  if (loadError) {
    return (
      <Screen eyebrow="Hồ sơ sức khỏe" title="Hồ sơ của mẹ">
        <ErrorState message={loadError} onRetry={load} />
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen eyebrow="Hồ sơ sức khỏe" title="Hồ sơ của mẹ">
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen
      eyebrow="Hồ sơ sức khỏe"
      title="Hồ sơ của mẹ"
      subtitle="Thông tin này giúp Mom Ơi cá nhân hóa lộ trình, thực đơn và lời khuyên cho mẹ."
    >
      <Card>
        <InfoRow label="Họ và tên" value={user?.fullName || 'Chưa cập nhật'} />
        <InfoRow label="Email" value={user?.email || 'Chưa cập nhật'} />
        <InfoRow label="Gói dịch vụ" value={getTierDisplayName(tier)} />
      </Card>

      <SectionTitle title="Giai đoạn hiện tại" subtitle="Chọn đúng giai đoạn để nhận nội dung phù hợp" />
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
              <Text style={[styles.stageLabel, active && styles.stageLabelActive]}>{opt.label}</Text>
              <Text style={styles.stageDesc}>{opt.desc}</Text>
            </View>
            <View style={[styles.radio, active && styles.radioActive]} />
          </TouchableOpacity>
        );
      })}

      <Card style={styles.stageCard}>
        {stage === 0 ? (
          <>
            <DateField
              label="Ngày đầu kỳ kinh gần nhất"
              value={lastPeriodDate}
              onChange={setLastPeriodDate}
              maximumDate={today}
              minimumDate={addDays(today, -120)}
            />
            <Field
              label="Độ dài chu kỳ trung bình (ngày)"
              value={cycleLength}
              onChangeText={setCycleLength}
              keyboardType="number-pad"
              hint="Thường từ 21 đến 35 ngày"
            />
          </>
        ) : stage === 1 ? (
          <>
            <DateField
              label="Ngày đầu kỳ kinh cuối (LMP)"
              value={lastPeriodDate}
              onChange={setLastPeriodDate}
              maximumDate={today}
              minimumDate={addDays(today, -300)}
            />
            {pregnancyWeek && dueDate ? (
              <View style={styles.computedBox}>
                <Text style={styles.computedText}>
                  Tuần thai hiện tại: <Text style={styles.computedStrong}>tuần {pregnancyWeek}</Text>
                </Text>
                <Text style={styles.computedText}>
                  Ngày dự sinh: <Text style={styles.computedStrong}>{formatDate(dueDate)}</Text>
                </Text>
                <Text style={styles.computedHint}>Tự tính: ngày kinh cuối + 280 ngày</Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <DateField
              label="Ngày sinh em bé"
              value={deliveryDate}
              onChange={setDeliveryDate}
              maximumDate={today}
              minimumDate={addDays(today, -365 * 3)}
            />
            <ToggleRow
              label="Mẹ đang nuôi con bằng sữa mẹ"
              value={isBreastfeeding}
              onValueChange={setIsBreastfeeding}
            />
          </>
        )}
      </Card>

      <SectionTitle title="Chỉ số cơ thể" />
      <Card>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field
              label="Chiều cao (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="VD: 158"
            />
          </View>
          <View style={styles.flex}>
            <Field
              label="Cân nặng (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="VD: 52.5"
            />
          </View>
        </View>
        <Text style={uiStyles.muted}>
          BMI: <Text style={styles.computedStrong}>{bmi ?? '—'}</Text>
        </Text>
        <View style={styles.spacer} />
        <Field
          label="Đường huyết lúc đói (mmol/L)"
          value={bloodSugar}
          onChangeText={setBloodSugar}
          keyboardType="decimal-pad"
          placeholder="VD: 5.1"
        />
        <ToggleRow
          label="Mẹ được chẩn đoán tiểu đường thai kỳ"
          value={hasGestDiabetes}
          onValueChange={setHasGestDiabetes}
        />
      </Card>

      <SectionTitle title="Tiền sử bệnh" subtitle="Chọn các bệnh lý mẹ đang có (nếu có)" />
      <Card>
        <View style={uiStyles.rowWrap}>
          {[...COMMON_CONDITIONS, ...conditions.filter((c) => !COMMON_CONDITIONS.includes(c))].map(
            (cond) => (
              <Chip
                key={cond}
                label={cond}
                selected={conditions.includes(cond)}
                onPress={() => toggleCondition(cond)}
              />
            )
          )}
        </View>
        <View style={[styles.row, styles.customRow]}>
          <View style={styles.flex}>
            <Field
              label="Bệnh lý khác"
              value={customCondition}
              onChangeText={setCustomCondition}
              placeholder="Nhập rồi bấm Thêm"
              onSubmitEditing={addCustomCondition}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addCustomCondition}>
            <Plus size={18} color={MOM_THEME.white} />
          </TouchableOpacity>
        </View>
      </Card>

      <PrimaryButton label="Lưu hồ sơ" onPress={save} loading={saving} />
      <SecondaryButton
        label="Đăng xuất"
        onPress={confirmLogout}
        icon={<LogOut size={16} color={MOM_THEME.roseDeep} />}
        style={styles.logout}
      />
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
});
