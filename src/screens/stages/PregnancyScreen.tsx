import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Baby, HeartPulse, Pill, Scale } from 'lucide-react-native';
import {
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingView,
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

const trimesterOf = (week: number) => (week <= 13 ? 1 : week <= 27 ? 2 : 3);

export default function PregnancyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
      Alert.alert('Kiểm tra lại', 'Cân nặng cần nằm trong khoảng 20 - 300 kg.');
      return;
    }
    setSaving(true);
    try {
      const result = await featureService.logPregnancyWeight(w);
      setAdvice(result?.recommendation || 'Đã ghi nhận cân nặng.');
      setWeight('');
      const weightLogs = await featureService.getPregnancyWeightLogs();
      setLogs(Array.isArray(weightLogs) ? weightLogs : []);
    } catch (err) {
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const header = { eyebrow: 'Thai kỳ', title: 'Hành trình 40 tuần' };

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
          title="Mẹ chưa ở giai đoạn mang thai"
          body="Cập nhật giai đoạn “Đang mang thai” và ngày kinh cuối trong hồ sơ để theo dõi tuần thai."
          actionLabel="Cập nhật hồ sơ"
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
          {week ? `Tam cá nguyệt ${trimesterOf(week)}` : 'Thai kỳ'}
        </Text>
        <Text style={styles.heroTitle}>{week ? `Tuần thai thứ ${week}` : 'Chưa rõ tuần thai'}</Text>
        {weekInfo?.babySize ? <Text style={styles.heroSize}>Bé {weekInfo.babySize}</Text> : null}
        {dueDate ? (
          <Text style={styles.heroDue}>
            Dự sinh {formatDate(dueDate)}
            {daysLeft !== null && daysLeft >= 0 ? ` · còn ${daysLeft} ngày` : ''}
          </Text>
        ) : null}
      </View>

      {weekInfo ? (
        <>
          {weekInfo.development ? (
            <Card>
              <View style={styles.cardTitleRow}>
                <Baby size={18} color={MOM_THEME.roseDark} />
                <Text style={styles.cardTitle}>Bé phát triển thế nào</Text>
              </View>
              <Text style={uiStyles.body}>{weekInfo.development}</Text>
            </Card>
          ) : null}
          {weekInfo.momTips ? (
            <Card>
              <View style={styles.cardTitleRow}>
                <HeartPulse size={18} color={MOM_THEME.sageDark} />
                <Text style={styles.cardTitle}>Lời khuyên cho mẹ</Text>
              </View>
              <Text style={uiStyles.body}>{weekInfo.momTips}</Text>
            </Card>
          ) : null}
        </>
      ) : weekError ? (
        <ErrorState message={weekError} onRetry={load} />
      ) : null}

      <SectionTitle title="Cân nặng thai kỳ" subtitle="Ghi đều mỗi tuần để theo dõi mức tăng cân" />
      <Card>
        <Field
          label="Cân nặng hôm nay (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder="VD: 56.8"
        />
        <PrimaryButton
          label="Ghi cân nặng"
          icon={<Scale size={16} color={MOM_THEME.white} />}
          onPress={submitWeight}
          loading={saving}
        />
        {advice ? <Text style={styles.advice}>{advice}</Text> : null}

        {sortedLogs.length ? (
          <View style={styles.logs}>
            {totalGain !== null ? (
              <Text style={styles.gain}>
                Tổng thay đổi: {totalGain >= 0 ? '+' : ''}
                {totalGain.toFixed(1)} kg kể từ lần ghi đầu
              </Text>
            ) : null}
            {sortedLogs.slice(0, 8).map((log, index) => (
              <View key={`${log.recordedAt}-${index}`} style={styles.logRow}>
                <Text style={styles.logWeek}>Tuần {log.week}</Text>
                <Text style={styles.logWeight}>{log.weight} kg</Text>
                <Text style={styles.logDate}>{formatUtcDate(log.recordedAt)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[uiStyles.muted, styles.noLogs]}>Chưa có lần ghi cân nặng nào.</Text>
        )}
      </Card>

      <SectionTitle title="Chăm sóc hằng ngày" />
      <SecondaryButton
        label="Ghi nhật ký sức khỏe hôm nay"
        icon={<HeartPulse size={16} color={MOM_THEME.roseDeep} />}
        onPress={() => navigation.navigate('DailyMonitoring')}
      />
      <SecondaryButton
        label="Lịch uống vitamin & sắt"
        icon={<Pill size={16} color={MOM_THEME.roseDeep} />}
        onPress={() => navigation.navigate('Medications')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: MOM_THEME.roseDark,
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
    color: MOM_THEME.roseDeep,
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
});
