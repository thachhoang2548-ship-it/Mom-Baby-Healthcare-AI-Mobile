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
import { useT } from '../../i18n';

const DURATIONS = [10, 20, 30, 45];

// Giá trị gửi lên server giữ tiếng Việt; tiếng Anh chỉ để hiển thị.
const WALKING = 'Đi bộ';

export default function ExercisePlanScreen() {
  const t = useT();
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
      Alert.alert(t('Kiểm tra lại', 'Please check'), t('Số bước chân cần nằm trong khoảng 0 - 50.000.', 'Steps should be between 0 and 50,000.'));
      return;
    }
    setSaving(true);
    try {
      await featureService.logExercise(type, duration, stepCount);
      setStepInput('');
      Alert.alert(
        t('Đã lưu', 'Saved'),
        t(`Đã ghi ${duration} phút "${type}".`, `Logged ${duration} min of "${type === WALKING ? 'Walking' : type}".`)
      );
      await load();
    } catch (err) {
      Alert.alert(t('Chưa lưu được', 'Could not save'), getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const header = {
    eyebrow: t('Thai kỳ', 'Pregnancy'),
    title: t('Bài tập an toàn', 'Safe exercises'),
    subtitle: t(
      'Bài tập nhẹ nhàng phù hợp tam cá nguyệt hiện tại của mẹ.',
      'Gentle exercises for your current trimester. Exercise names are in Vietnamese.'
    ),
  };

  if (locked) {
    return (
      <Screen {...header}>
        <TierLockedCard feature={t('Bài tập thai kỳ', 'Pregnancy exercises')} />
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
        <Text style={styles.heroLabel}>{t(`Tam cá nguyệt ${plan.trimester}`, `Trimester ${plan.trimester}`)}</Text>
        <Text style={styles.heroValue}>
          {t(`${plan.exercises.length} bài tập gợi ý`, `${plan.exercises.length} suggested exercises`)}
        </Text>
        {steps !== null ? (
          <Text style={styles.heroSub}>
            {t(
              `Hôm nay mẹ đã đi ${steps.toLocaleString('vi-VN')} bước`,
              `${steps.toLocaleString('en-US')} steps today`
            )}
          </Text>
        ) : null}
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
          {t(
            'Dừng tập ngay nếu mẹ thấy đau bụng, ra máu, chóng mặt, khó thở hoặc co thắt tử cung, và liên hệ bác sĩ.',
            'Stop right away and contact your doctor if you have belly pain, bleeding, dizziness, shortness of breath or contractions.'
          )}
        </Text>
      </View>

      <SectionTitle title={t('Ghi lại buổi tập', 'Log a workout')} />
      <Card>
        <Text style={uiStyles.label}>{t('Bài tập', 'Exercise')}</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {[...plan.exercises.map((e) => e.name), WALKING].map((name) => (
            <Chip
              key={name}
              label={name === WALKING ? t(WALKING, 'Walking') : name}
              selected={selected === name} onPress={() => setExerciseType(name)} />
          ))}
        </View>
        <Text style={uiStyles.label}>{t('Thời gian', 'Duration')}</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {DURATIONS.map((m) => (
            <Chip key={m} label={t(`${m} phút`, `${m} min`)} selected={duration === m} onPress={() => setDuration(m)} />
          ))}
        </View>
        <Field
          label={t('Số bước chân (không bắt buộc)', 'Steps (optional)')}
          value={stepInput}
          onChangeText={setStepInput}
          keyboardType="number-pad"
          placeholder={t('VD: 3500', 'e.g. 3500')}
        />
        <PrimaryButton label={t('Lưu buổi tập', 'Save workout')} onPress={submit} loading={saving} />
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
