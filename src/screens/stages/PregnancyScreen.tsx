import React, { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Baby, Dumbbell, HeartPulse, Pill, Salad, Scale } from 'lucide-react-native';
import FoodLogCard from '../../components/FoodLogCard';
import { useIsFreeTier } from '../../stores/authStore';
import {
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingView,
  LockIcon,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
  uiStyles,
} from '../../components/ui';
import profileService, { getStageIndex, MomProfileDto } from '../../services/profileService';
import featureService, { PregnancyWeekInfo, PregnancyWeightLog } from '../../services/featureService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage } from '../../utils/apiError';
import { daysBetween, formatDate, formatUtcDate, fromUtcDateIso, startOfToday } from '../../utils/date';
import { MOM_THEME, RADII } from '../../theme/colors';
import { createThemedStyles, useAccent } from '../../theme/accent';
import { useT } from '../../i18n';

const trimesterOf = (week: number) => (week <= 13 ? 1 : week <= 27 ? 2 : 3);

const lockIcon = <LockIcon color={MOM_THEME.roseDeep} />;

export default function PregnancyScreen() {
  const a = useAccent();
  const styles = useStyles();
  const t = useT();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFree = useIsFreeTier();
  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [weekInfo, setWeekInfo] = useState<PregnancyWeekInfo | null>(null);
  const [weekError, setWeekError] = useState<string | null>(null);
  const [logs, setLogs] = useState<PregnancyWeightLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await profileService.getProfile();
      const p = res.data ?? null;
      setProfile(p);
      if (p && getStageIndex(p.stage) === 1) {
        const [week, weightLogs] = await Promise.allSettled([
          featureService.getPregnancyThisWeek(),
          featureService.getPregnancyWeightLogs(),
        ]);
        if (week.status === 'fulfilled') {
          setWeekInfo(week.value);
          setWeekError(null);
        } else {
          setWeekInfo(null);
          setWeekError(getApiErrorMessage(week.reason));
        }
        setLogs(weightLogs.status === 'fulfilled' && Array.isArray(weightLogs.value) ? weightLogs.value : []);
      }
      setLoaded(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const submitWeight = async () => {
    const w = parseFloat(weight.replace(',', '.'));
    if (!Number.isFinite(w) || w < 20 || w > 300) {
      Alert.alert(t('Kiểm tra lại', 'Please check'), t('Cân nặng cần nằm trong khoảng 20 - 300 kg.', 'Weight should be between 20 and 300 kg.'));
      return;
    }
    setSaving(true);
    try {
      const result = await featureService.logPregnancyWeight(w);
      setAdvice(result?.recommendation || t('Đã ghi nhận cân nặng.', 'Weight saved.'));
      setWeight('');
      const weightLogs = await featureService.getPregnancyWeightLogs();
      setLogs(Array.isArray(weightLogs) ? weightLogs : []);
    } catch (err) {
      Alert.alert(t('Chưa lưu được', 'Could not save'), getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const header = { eyebrow: t('Thai kỳ', 'Pregnancy'), title: t('Hành trình 40 tuần', 'Your 40-week journey') };

  if (error) {
    return (
      <Screen {...header}>
        <ErrorState message={error} onRetry={load} />
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
  if (!profile || getStageIndex(profile.stage) !== 1) {
    return (
      <Screen {...header}>
        <EmptyState
          emoji="🤰"
          title={t('Mẹ chưa ở giai đoạn mang thai', "You're not set as pregnant yet")}
          body={t(
            'Cập nhật giai đoạn “Đang mang thai” và ngày kinh cuối trong hồ sơ để theo dõi tuần thai.',
            'Set your stage to “Pregnant” and add your last period date in your profile to track your weeks.'
          )}
          actionLabel={t('Cập nhật hồ sơ', 'Update profile')}
          onAction={() => navigation.navigate('Profile')}
        />
      </Screen>
    );
  }

  const week = weekInfo?.week ?? profile.pregnancyWeek ?? null;
  const dueDate = fromUtcDateIso(profile.deliveryDate);
  const daysLeft = dueDate ? daysBetween(startOfToday(), dueDate) : null;
  const sortedLogs = [...logs].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const oldest = sortedLogs[sortedLogs.length - 1];
  const latest = sortedLogs[0];
  const totalGain = latest && oldest && sortedLogs.length > 1 ? latest.weight - oldest.weight : null;

  return (
    <Screen {...header} refreshing={false} onRefresh={load}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>
          {week ? t(`Tam cá nguyệt ${trimesterOf(week)}`, `Trimester ${trimesterOf(week)}`) : t('Thai kỳ', 'Pregnancy')}
        </Text>
        <Text style={styles.heroTitle}>{week ? t(`Tuần thai thứ ${week}`, `Week ${week}`) : t('Chưa rõ tuần thai', 'Week not known yet')}</Text>
        {weekInfo?.babySize ? <Text style={styles.heroSize}>{t('Bé', 'Baby:')} {weekInfo.babySize}</Text> : null}
        {dueDate ? (
          <Text style={styles.heroDue}>
            {t('Dự sinh', 'Due')} {formatDate(dueDate)}
            {daysLeft !== null && daysLeft >= 0 ? t(` · còn ${daysLeft} ngày`, ` · ${daysLeft} days to go`) : ''}
          </Text>
        ) : null}
      </View>

      {weekInfo ? (
        <>
          {weekInfo.development ? (
            <Card>
              <View style={styles.cardTitleRow}>
                <Baby size={18} color={a.primary} />
                <Text style={styles.cardTitle}>{t('Bé phát triển thế nào', "How your baby is growing")}</Text>
              </View>
              <Text style={uiStyles.body}>{weekInfo.development}</Text>
            </Card>
          ) : null}
          {weekInfo.momTips ? (
            <Card>
              <View style={styles.cardTitleRow}>
                <HeartPulse size={18} color={MOM_THEME.sageDark} />
                <Text style={styles.cardTitle}>{t('Lời khuyên cho mẹ', 'Tips for you')}</Text>
              </View>
              <Text style={uiStyles.body}>{weekInfo.momTips}</Text>
            </Card>
          ) : null}
        </>
      ) : weekError ? (
        <ErrorState message={weekError} onRetry={load} />
      ) : null}

      <SectionTitle
        title={t('Cân nặng thai kỳ', 'Pregnancy weight')}
        subtitle={t('Ghi đều mỗi tuần để theo dõi mức tăng cân', 'Log it weekly to follow your weight gain')}
      />
      <Card>
        <Field
          label={t('Cân nặng hôm nay (kg)', "Today's weight (kg)")}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder={t('VD: 56.8', 'e.g. 56.8')}
        />
        <PrimaryButton
          label={t('Ghi cân nặng', 'Save weight')}
          icon={<Scale size={16} color={MOM_THEME.white} />}
          onPress={submitWeight}
          loading={saving}
        />
        {advice ? <Text style={styles.advice}>{advice}</Text> : null}

        {sortedLogs.length ? (
          <View style={styles.logs}>
            {totalGain !== null ? (
              <Text style={styles.gain}>
                {t('Tổng thay đổi:', 'Total change:')} {totalGain >= 0 ? '+' : ''}
                {totalGain.toFixed(1)} kg {t('kể từ lần ghi đầu', 'since your first entry')}
              </Text>
            ) : null}
            {sortedLogs.slice(0, 8).map((log, index) => (
              <View key={`${log.recordedAt}-${index}`} style={styles.logRow}>
                <Text style={styles.logWeek}>{t('Tuần', 'Week')} {log.week}</Text>
                <Text style={styles.logWeight}>{log.weight} kg</Text>
                <Text style={styles.logDate}>{formatUtcDate(log.recordedAt)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[uiStyles.muted, styles.noLogs]}>{t('Chưa có lần ghi cân nặng nào.', 'No weight entries yet.')}</Text>
        )}
      </Card>

      <SectionTitle
        title={t('Bữa ăn hôm nay', "Today's meals")}
        subtitle={t('Mom Ơi nhắc nếu có món cần tránh khi mang thai', 'Mom Ơi flags foods to avoid during pregnancy')}
      />
      <FoodLogCard />

      <SectionTitle title={t('Chăm sóc hằng ngày', 'Everyday care')} />
      <SecondaryButton
        label={t('Ghi nhật ký sức khỏe hôm nay', "Log today's health")}
        icon={<HeartPulse size={16} color={a.primaryDark} />}
        onPress={() => navigation.navigate('DailyMonitoring')}
      />
      <SecondaryButton
        label={t('Lịch uống vitamin & sắt', 'Vitamin & iron schedule')}
        icon={<Pill size={16} color={a.primaryDark} />}
        onPress={() => navigation.navigate('Medications')}
      />
      <SecondaryButton
        label={t('Thực đơn thai kỳ 7 ngày', '7-day pregnancy meal plan')}
        icon={isFree ? lockIcon : <Salad size={16} color={a.primaryDark} />}
        onPress={() => navigation.navigate('PregnancyMealPlan')}
      />
      <SecondaryButton
        label={t('Bài tập an toàn', 'Safe exercises')}
        icon={isFree ? lockIcon : <Dumbbell size={16} color={a.primaryDark} />}
        onPress={() => navigation.navigate('ExercisePlan')}
      />
    </Screen>
  );
}

const useStyles = createThemedStyles((a) => ({
  hero: {
    backgroundColor: a.primary,
    borderRadius: RADII.cardLg,
    padding: 20,
    marginBottom: 14,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: MOM_THEME.white,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  heroSize: {
    color: MOM_THEME.white,
    fontSize: 15,
    marginTop: 6,
  },
  heroDue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
  advice: {
    color: MOM_THEME.sageDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    marginTop: 10,
  },
  logs: {
    marginTop: 14,
  },
  gain: {
    color: a.primaryDark,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: MOM_THEME.borderSoft,
  },
  logWeek: {
    width: 70,
    color: MOM_THEME.muted,
    fontSize: 13,
  },
  logWeight: {
    flex: 1,
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
  logDate: {
    color: MOM_THEME.mutedLight,
    fontSize: 12,
  },
  noLogs: {
    marginTop: 12,
  },
}));
