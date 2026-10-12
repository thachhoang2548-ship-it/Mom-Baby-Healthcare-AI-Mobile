import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Baby, Brain, HeartPulse } from 'lucide-react-native';
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingView,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
  TierLockedCard,
  uiStyles,
} from '../../components/ui';
import profileService, { getStageIndex, MomProfileDto } from '../../services/profileService';
import featureService, { LatestEpds, RecoveryPlan } from '../../services/featureService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { daysBetween, formatDate, formatDateTime, fromUtcDateIso, startOfToday } from '../../utils/date';
import { epdsRisk } from '../../utils/epds';
import { MOM_THEME, RADII } from '../../theme/colors';

// Cùng mốc với backend (PostpartumService.SetupPostpartumAsync).
function phaseOf(days: number) {
  if (days <= 7) return 'Hồi phục cấp tính (tuần đầu)';
  if (days <= 42) return 'Phục hồi vết thương (tuần 2 - 6)';
  return 'Ổn định lâu dài (sau 6 tuần)';
}

type Gated<T> = { data: T | null; locked: boolean; error: string | null };

async function gated<T>(task: () => Promise<T>): Promise<Gated<T>> {
  try {
    return { data: await task(), locked: false, error: null };
  } catch (err) {
    return { data: null, locked: isTierLocked(err), error: isTierLocked(err) ? null : getApiErrorMessage(err) };
  }
}

export default function PostpartumScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Gated<RecoveryPlan> | null>(null);
  const [epds, setEpds] = useState<Gated<LatestEpds> | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await profileService.getProfile();
      const p = res.data ?? null;
      setProfile(p);
      if (p && getStageIndex(p.stage) === 2) {
        const delivery = fromUtcDateIso(p.deliveryDate);
        const days = delivery ? Math.max(0, daysBetween(delivery, startOfToday())) : undefined;
        const [planRes, epdsRes] = await Promise.all([
          gated(() => featureService.getRecoveryPlan(days || 1)),
          gated(() => featureService.getLatestEpds()),
        ]);
        setPlan(planRes);
        setEpds(epdsRes);
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

  const header = { eyebrow: 'Sau sinh', title: 'Phục hồi & chăm con' };

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
  if (!profile || getStageIndex(profile.stage) !== 2) {
    return (
      <Screen {...header}>
        <EmptyState
          emoji="🍼"
          title="Mẹ chưa ở giai đoạn sau sinh"
          body="Cập nhật giai đoạn “Sau sinh & nuôi con” và ngày sinh em bé trong hồ sơ để nhận lộ trình phục hồi."
          actionLabel="Cập nhật hồ sơ"
          onAction={() => navigation.navigate('Profile')}
        />
      </Screen>
    );
  }

  const delivery = fromUtcDateIso(profile.deliveryDate);
  const days = delivery ? Math.max(0, daysBetween(delivery, startOfToday())) : null;
  const locked = plan?.locked || epds?.locked;

  return (
    <Screen {...header} onRefresh={load}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>{days !== null ? phaseOf(days) : 'Sau sinh'}</Text>
        <Text style={styles.heroTitle}>{days !== null ? `Ngày thứ ${days} sau sinh` : 'Chưa có ngày sinh'}</Text>
        {delivery ? <Text style={styles.heroSub}>Bé chào đời ngày {formatDate(delivery)}</Text> : null}
        {profile.isBreastfeeding ? <Text style={styles.heroSub}>Mẹ đang nuôi con bằng sữa mẹ 🤱</Text> : null}
      </View>

      {locked ? <TierLockedCard feature="Kế hoạch phục hồi & khảo sát EPDS" /> : null}

      {plan?.data ? (
        <>
          <SectionTitle title="Kế hoạch vận động phục hồi" subtitle={plan.data.recoveryPhase} />
          <Card>
            {plan.data.exerciseSchedule?.activeExercise ? (
              <Text style={uiStyles.body}>{plan.data.exerciseSchedule.activeExercise}</Text>
            ) : null}
            {plan.data.exerciseSchedule?.allowed?.length ? (
              <View style={styles.tagBlock}>
                <Text style={styles.tagTitle}>Nên tập</Text>
                <View style={uiStyles.rowWrap}>
                  {plan.data.exerciseSchedule.allowed.map((item) => (
                    <View key={item} style={[styles.tag, styles.tagOk]}>
                      <Text style={[styles.tagText, styles.tagOkText]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
            {plan.data.exerciseSchedule?.locked?.length ? (
              <View style={styles.tagBlock}>
                <Text style={styles.tagTitle}>Chưa nên tập</Text>
                <View style={uiStyles.rowWrap}>
                  {plan.data.exerciseSchedule.locked.map((item) => (
                    <View key={item} style={[styles.tag, styles.tagNo]}>
                      <Text style={[styles.tagText, styles.tagNoText]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </Card>
        </>
      ) : plan?.error ? (
        <ErrorState message={plan.error} onRetry={load} />
      ) : null}

      {!epds?.locked ? (
        <>
          <SectionTitle title="Sức khỏe tinh thần" subtitle="Khảo sát EPDS nên làm 2 tuần một lần" />
          <Card>
            <View style={styles.epdsRow}>
              <View style={styles.epdsIcon}>
                <Brain size={20} color="#8E6BB8" />
              </View>
              {epds?.data?.takenAt ? (
                <View style={styles.flex}>
                  <Text style={[styles.epdsRisk, { color: epdsRisk(epds.data.score).color }]}>
                    {epdsRisk(epds.data.score).label} · {epds.data.score}/30 điểm
                  </Text>
                  <Text style={uiStyles.muted}>Lần gần nhất: {formatDateTime(epds.data.takenAt)}</Text>
                </View>
              ) : (
                <View style={styles.flex}>
                  <Text style={styles.epdsRisk}>Mẹ chưa làm khảo sát nào</Text>
                  <Text style={uiStyles.muted}>Chỉ mất khoảng 2 phút.</Text>
                </View>
              )}
            </View>
            {epds?.error ? <Text style={styles.inlineError}>{epds.error}</Text> : null}
            <PrimaryButton label="Làm khảo sát EPDS" onPress={() => navigation.navigate('Epds')} />
          </Card>
        </>
      ) : null}

      <SectionTitle title="Chăm sóc hằng ngày" />
      <SecondaryButton
        label="Hồ sơ & thực đơn của bé"
        icon={<Baby size={16} color={MOM_THEME.roseDeep} />}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Nutrition' })}
      />
      <SecondaryButton
        label="Ghi nhật ký sức khỏe hôm nay"
        icon={<HeartPulse size={16} color={MOM_THEME.roseDeep} />}
        onPress={() => navigation.navigate('DailyMonitoring')}
      />
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
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    marginTop: 6,
  },
  tagBlock: {
    marginTop: 12,
  },
  tagTitle: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  tag: {
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagOk: {
    backgroundColor: MOM_THEME.sageLight,
  },
  tagNo: {
    backgroundColor: '#FDECEF',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagOkText: {
    color: MOM_THEME.sageDark,
  },
  tagNoText: {
    color: '#B4344A',
  },
  epdsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  epdsIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MOM_THEME.lavenderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  epdsRisk: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
  inlineError: {
    color: '#D95368',
    fontSize: 12,
    marginBottom: 6,
  },
});
