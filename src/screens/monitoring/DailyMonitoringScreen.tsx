import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Minus, Plus } from 'lucide-react-native';
import {
  Card,
  ErrorState,
  Field,
  LoadingView,
  PrimaryButton,
  Screen,
  SectionTitle,
  ToggleRow,
  uiStyles,
} from '../../components/ui';
import featureService, { DailyMonitoringLog, DailyMonitoringPayload } from '../../services/featureService';
import { getApiErrorMessage } from '../../utils/apiError';
import { LITERS_PER_CUP, MOOD_OPTIONS, SLEEP_QUALITY_OPTIONS, cupsFromLiters } from '../../utils/monitoring';
import { MOM_THEME, RADII } from '../../theme/colors';

const toNumber = (value: string): number | undefined => {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};

function Stepper({
  value,
  onChange,
  step,
  min,
  max,
  unit,
}: {
  value: number;
  onChange: (value: number) => void;
  step: number;
  min: number;
  max: number;
  unit: string;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepButton}
        onPress={() => onChange(Math.max(min, value - step))}
        accessibilityLabel="Giảm"
      >
        <Minus size={18} color={MOM_THEME.roseDark} />
      </TouchableOpacity>
      <Text style={styles.stepValue}>
        {value} <Text style={styles.stepUnit}>{unit}</Text>
      </Text>
      <TouchableOpacity
        style={styles.stepButton}
        onPress={() => onChange(Math.min(max, value + step))}
        accessibilityLabel="Tăng"
      >
        <Plus size={18} color={MOM_THEME.roseDark} />
      </TouchableOpacity>
    </View>
  );
}

function EmojiScale({
  options,
  value,
  onChange,
}: {
  options: { score: number; emoji: string; label: string }[];
  value: number | null;
  onChange: (score: number) => void;
}) {
  return (
    <View style={styles.emojiRow}>
      {options.map((opt) => {
        const active = value === opt.score;
        return (
          <TouchableOpacity
            key={opt.score}
            style={[styles.emojiItem, active && styles.emojiItemActive]}
            onPress={() => onChange(opt.score)}
            accessibilityState={{ selected: active }}
          >
            <Text style={styles.emoji}>{opt.emoji}</Text>
            <Text style={[styles.emojiLabel, active && styles.emojiLabelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function DailyMonitoringScreen() {
  const navigation = useNavigation();
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [cups, setCups] = useState(0);
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [bpHigh, setBpHigh] = useState('');
  const [bpLow, setBpLow] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [weight, setWeight] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState(0);
  const [symptomNote, setSymptomNote] = useState('');

  const apply = (log: DailyMonitoringLog) => {
    if (log.sleepHours != null) setSleepHours(log.sleepHours);
    setSleepQuality(log.sleepQuality ?? null);
    setCups(cupsFromLiters(log.waterLiters));
    setMeals({
      breakfast: !!log.hadBreakfast,
      lunch: !!log.hadLunch,
      dinner: !!log.hadDinner,
    });
    setMoodScore(log.moodScore ?? null);
    setMoodNote(log.moodNote && !MOOD_OPTIONS.some((m) => m.label === log.moodNote) ? log.moodNote : '');
    setBpHigh(log.bloodPressureHigh ? String(log.bloodPressureHigh) : '');
    setBpLow(log.bloodPressureLow ? String(log.bloodPressureLow) : '');
    setBloodSugar(log.bloodSugar ? String(log.bloodSugar) : '');
    setWeight(log.weight ? String(log.weight) : '');
    setSymptomSeverity(log.symptomSeverity ?? 0);
    setSymptomNote(log.symptomNote || '');
  };

  const load = useCallback(async () => {
    try {
      const today = await featureService.getTodayMonitoring();
      if (today?.data) apply(today.data);
      setLoadError(null);
      setLoaded(true);
    } catch (err) {
      setLoadError(getApiErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const save = async () => {
    const high = toNumber(bpHigh);
    const low = toNumber(bpLow);
    if ((high && !low) || (!high && low)) {
      Alert.alert('Huyết áp chưa đủ', 'Mẹ nhập cả chỉ số tâm thu và tâm trương (VD: 110 / 70) nhé.');
      return;
    }
    if (high && low && (high < 60 || high > 250 || low < 30 || low > 150 || low >= high)) {
      Alert.alert('Kiểm tra lại', 'Chỉ số huyết áp chưa hợp lý. VD: 110 / 70 mmHg.');
      return;
    }

    const payload: DailyMonitoringPayload = {
      sleepHours,
      sleepQuality: sleepQuality ?? undefined,
      waterLiters: Math.round(cups * LITERS_PER_CUP * 100) / 100,
      hadBreakfast: meals.breakfast,
      hadLunch: meals.lunch,
      hadDinner: meals.dinner,
      moodScore: moodScore ?? undefined,
      moodNote: moodNote.trim() || MOOD_OPTIONS.find((m) => m.score === moodScore)?.label,
      bloodPressureHigh: high,
      bloodPressureLow: low,
      bloodSugar: toNumber(bloodSugar),
      weight: toNumber(weight),
      symptomSeverity,
      symptomNote: symptomNote.trim() || undefined,
    };

    setSaving(true);
    try {
      await featureService.saveDailyMonitoring(payload);
      Alert.alert('Đã lưu', 'Nhật ký sức khỏe hôm nay đã được ghi nhận.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const header = {
    eyebrow: 'Theo dõi hằng ngày',
    title: 'Nhật ký hôm nay',
    subtitle: 'Chỉ mất khoảng 1 phút. Mẹ có thể lưu nhiều lần trong ngày, số liệu mới sẽ ghi đè.',
  };

  if (loadError) {
    return (
      <Screen {...header}>
        <ErrorState message={loadError} onRetry={load} />
      </Screen>
    );
  }
  if (!loaded) {
    return (
      <Screen {...header}>
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen {...header}>
      <SectionTitle title="😴 Giấc ngủ" />
      <Card>
        <Text style={uiStyles.label}>Đêm qua mẹ ngủ bao lâu?</Text>
        <Stepper value={sleepHours} onChange={setSleepHours} step={0.5} min={0} max={14} unit="giờ" />
        <Text style={[uiStyles.label, styles.gap]}>Chất lượng giấc ngủ</Text>
        <EmojiScale options={SLEEP_QUALITY_OPTIONS} value={sleepQuality} onChange={setSleepQuality} />
      </Card>

      <SectionTitle title="💧 Uống nước" subtitle={`1 ly ≈ ${LITERS_PER_CUP * 1000} ml · mục tiêu 10 ly (2,5 lít)`} />
      <Card>
        <Stepper value={cups} onChange={setCups} step={1} min={0} max={20} unit="ly" />
      </Card>

      <SectionTitle title="🍚 Bữa ăn" />
      <Card>
        <ToggleRow label="Bữa sáng" value={meals.breakfast} onValueChange={(v) => setMeals((m) => ({ ...m, breakfast: v }))} />
        <ToggleRow label="Bữa trưa" value={meals.lunch} onValueChange={(v) => setMeals((m) => ({ ...m, lunch: v }))} />
        <ToggleRow label="Bữa tối" value={meals.dinner} onValueChange={(v) => setMeals((m) => ({ ...m, dinner: v }))} />
      </Card>

      <SectionTitle title="🌸 Tâm trạng" />
      <Card>
        <EmojiScale options={MOOD_OPTIONS} value={moodScore} onChange={setMoodScore} />
        <View style={styles.gap} />
        <Field
          label="Ghi chú (không bắt buộc)"
          value={moodNote}
          onChangeText={setMoodNote}
          placeholder="Hôm nay mẹ thấy thế nào?"
        />
      </Card>

      <SectionTitle title="🩺 Chỉ số cơ thể" subtitle="Không bắt buộc, nhập nếu mẹ có đo" />
      <Card>
        <Text style={uiStyles.label}>Huyết áp (mmHg)</Text>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field label="Tâm thu" value={bpHigh} onChangeText={setBpHigh} keyboardType="number-pad" placeholder="110" />
          </View>
          <View style={styles.flex}>
            <Field label="Tâm trương" value={bpLow} onChangeText={setBpLow} keyboardType="number-pad" placeholder="70" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field
              label="Đường huyết (mmol/L)"
              value={bloodSugar}
              onChangeText={setBloodSugar}
              keyboardType="decimal-pad"
              placeholder="5.1"
            />
          </View>
          <View style={styles.flex}>
            <Field label="Cân nặng (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="55" />
          </View>
        </View>
      </Card>

      <SectionTitle title="🤒 Triệu chứng" />
      <Card>
        <Text style={uiStyles.label}>Mức độ khó chịu: {symptomSeverity} / 5</Text>
        <View style={styles.severityRow}>
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.severityDot, symptomSeverity === level && styles.severityDotActive]}
              onPress={() => setSymptomSeverity(level)}
            >
              <Text style={[styles.severityText, symptomSeverity === level && styles.severityTextActive]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field
          label="Mô tả (không bắt buộc)"
          value={symptomNote}
          onChangeText={setSymptomNote}
          placeholder="VD: hơi đau lưng buổi chiều"
          multiline
        />
      </Card>

      <PrimaryButton label="Lưu nhật ký hôm nay" onPress={save} loading={saving} />
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
  gap: {
    marginTop: 14,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MOM_THEME.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    color: MOM_THEME.charcoal,
    fontSize: 26,
    fontWeight: '800',
  },
  stepUnit: {
    color: MOM_THEME.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  emojiItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emojiItemActive: {
    backgroundColor: MOM_THEME.pinkLight,
    borderColor: MOM_THEME.rose,
  },
  emoji: {
    fontSize: 26,
  },
  emojiLabel: {
    color: MOM_THEME.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  emojiLabelActive: {
    color: MOM_THEME.roseDeep,
    fontWeight: '800',
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  severityDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.creamSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityDotActive: {
    backgroundColor: MOM_THEME.roseDark,
    borderColor: MOM_THEME.roseDark,
  },
  severityText: {
    color: MOM_THEME.charcoalMid,
    fontWeight: '800',
  },
  severityTextActive: {
    color: MOM_THEME.white,
  },
});
