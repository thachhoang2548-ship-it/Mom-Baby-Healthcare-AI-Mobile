import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Dumbbell, ShieldAlert } from 'lucide-react-native';
import {
  Card,
  Chip,
  ErrorState,
  Field,
  LoadingView,
  PrimaryButton,
  Screen,
  SectionTitle,
  TierLockedCard,
  uiStyles,
} from '../../components/ui';
import featureService, { ExercisePlan } from '../../services/featureService';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { MOM_THEME, RADII } from '../../theme/colors';

const DURATIONS = [10, 20, 30, 45];

export default function ExercisePlanScreen() {
  const [plan, setPlan] = useState<ExercisePlan | null>(null);
  const [steps, setSteps] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const [exerciseType, setExerciseType] = useState<string | null>(null);
  const [duration, setDuration] = useState(20);
  const [stepInput, setStepInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [data, today] = await Promise.all([
        featureService.getExercisePlan(),
        featureService.getTodaySteps().catch(() => null),
      ]);
      setPlan(data);
      setSteps(today?.todaySteps ?? null);
      setError(null);
    } catch (err) {
      if (isTierLocked(err)) setLocked(true);
      else setError(getApiErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const submit = async () => {
    const type = exerciseType ?? plan?.exercises[0]?.name;
    if (!type) return;
    const stepCount = stepInput ? parseInt(stepInput, 10) : 0;
    if (stepInput && (!Number.isFinite(stepCount) || stepCount < 0 || stepCount > 50000)) {
      Alert.alert('Kiểm tra lại', 'Số bước chân cần nằm trong khoảng 0 - 50.000.');
      return;
    }
    setSaving(true);
    try {
      await featureService.logExercise(type, duration, stepCount);
      setStepInput('');
      Alert.alert('Đã lưu', `Đã ghi ${duration} phút "${type}".`);
      await load();
    } catch (err) {
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const header = {
    eyebrow: 'Thai kỳ',
    title: 'Bài tập an toàn',
    subtitle: 'Bài tập nhẹ nhàng phù hợp tam cá nguyệt hiện tại của mẹ.',
  };

  if (locked) {
    return (
      <Screen {...header}>
        <TierLockedCard feature="Bài tập thai kỳ" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen {...header}>
        <ErrorState message={error} onRetry={load} />
      </Screen>
    );
  }
  if (!plan) {
    return (
      <Screen {...header}>
        <LoadingView />
      </Screen>
    );
  }

  const selected = exerciseType ?? plan.exercises[0]?.name ?? null;

  return (
    <Screen {...header}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Tam cá nguyệt {plan.trimester}</Text>
        <Text style={styles.heroValue}>{plan.exercises.length} bài tập gợi ý</Text>
        {steps !== null ? <Text style={styles.heroSub}>Hôm nay mẹ đã đi {steps.toLocaleString('vi-VN')} bước</Text> : null}
      </View>

      {plan.exercises.map((ex) => (
        <View key={ex.name} style={styles.exercise}>
          <View style={styles.exerciseIcon}>
            <Dumbbell size={18} color={MOM_THEME.sageDark} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            <Text style={uiStyles.muted}>
              {[ex.reps, ex.duration].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.warning}>
        <ShieldAlert size={18} color="#B42318" />
        <Text style={styles.warningText}>
          Dừng tập ngay nếu mẹ thấy đau bụng, ra máu, chóng mặt, khó thở hoặc co thắt tử cung, và liên hệ bác sĩ.
        </Text>
      </View>

      <SectionTitle title="Ghi lại buổi tập" />
      <Card>
        <Text style={uiStyles.label}>Bài tập</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {[...plan.exercises.map((e) => e.name), 'Đi bộ'].map((name) => (
            <Chip key={name} label={name} selected={selected === name} onPress={() => setExerciseType(name)} />
          ))}
        </View>
        <Text style={uiStyles.label}>Thời gian</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {DURATIONS.map((m) => (
            <Chip key={m} label={`${m} phút`} selected={duration === m} onPress={() => setDuration(m)} />
          ))}
        </View>
        <Field
          label="Số bước chân (không bắt buộc)"
          value={stepInput}
          onChangeText={setStepInput}
          keyboardType="number-pad"
          placeholder="VD: 3500"
        />
        <PrimaryButton label="Lưu buổi tập" onPress={submit} loading={saving} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hero: {
    backgroundColor: MOM_THEME.sageDark,
    borderRadius: RADII.cardLg,
    padding: 18,
    marginBottom: 14,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroValue: {
    color: MOM_THEME.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    marginTop: 6,
  },
  exercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    padding: 14,
    marginBottom: 10,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MOM_THEME.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
  warning: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEE4E2',
    borderRadius: RADII.control,
    padding: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  warningText: {
    flex: 1,
    color: '#7A271A',
    fontSize: 13,
    lineHeight: 19,
  },
  gap: {
    marginBottom: 12,
  },
});
