import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import {
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Field,
  LoadingView,
  PrimaryButton,
  Screen,
  SectionTitle,
  TierLockedCard,
  uiStyles,
} from '../../components/ui';
import DateField from '../../components/DateField';
import GrowthChart from '../../components/GrowthChart';
import babyService, { BabyProfileDto, GrowthEvaluation, GrowthRecord } from '../../services/babyService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { formatUtcDate, fromUtcDateIso, startOfToday } from '../../utils/date';
import { ageInMonths, classifyGrowth, GrowthMetric } from '../../utils/who';
import { MOM_THEME, RADII } from '../../theme/colors';

const TONE_COLOR = {
  normal: { color: MOM_THEME.sageDark, bg: MOM_THEME.sageLight },
  watch: { color: MOM_THEME.amberDark, bg: MOM_THEME.amberLight },
  low: { color: '#B42318', bg: '#FEE4E2' },
};

const toNumber = (value: string): number | null => {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export default function GrowthChartScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'GrowthChart'>>();
  const [baby, setBaby] = useState<BabyProfileDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [metric, setMetric] = useState<GrowthMetric>('weight');

  const [measuredAt, setMeasuredAt] = useState<Date>(startOfToday());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [evaluation, setEvaluation] = useState<GrowthEvaluation | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await babyService.getProfiles();
      const found = (res.data || []).find((b) => String(b.id) === String(params.babyId)) ?? null;
      setBaby(found);
      setError(found ? null : 'Không tìm thấy hồ sơ bé.');
    } catch (err) {
      if (isTierLocked(err)) setLocked(true);
      else setError(getApiErrorMessage(err));
    }
  }, [params.babyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const header = { eyebrow: 'Bé yêu', title: 'Biểu đồ tăng trưởng' };

  if (locked) {
    return (
      <Screen {...header}>
        <TierLockedCard feature="Biểu đồ tăng trưởng" />
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
  if (!baby) {
    return (
      <Screen {...header}>
        <LoadingView />
      </Screen>
    );
  }

  const dob = fromUtcDateIso(baby.dateOfBirth) ?? startOfToday();
  const isBoy = baby.gender === 0;
  const records: (GrowthRecord & { month: number })[] = (baby.growthRecords || [])
    .filter((r) => r.recordedAt)
    .map((r) => ({ ...r, month: ageInMonths(dob, new Date(r.recordedAt as string)) }))
    .sort((a, b) => b.month - a.month);
  const latest = records[0];
  const points = records.map((r) => ({
    month: r.month,
    value: metric === 'weight' ? r.weightKg : r.heightCm,
  }));
  const weightBand = latest ? classifyGrowth('weight', isBoy, latest.month, latest.weightKg) : null;
  const heightBand = latest ? classifyGrowth('height', isBoy, latest.month, latest.heightCm) : null;

  const submit = async () => {
    const w = toNumber(weight);
    const h = toNumber(height);
    if (w === null || w < 1 || w > 40) {
      Alert.alert('Kiểm tra lại', 'Cân nặng của bé cần nằm trong khoảng 1 - 40 kg.');
      return;
    }
    if (h === null || h < 30 || h > 130) {
      Alert.alert('Kiểm tra lại', 'Chiều cao của bé cần nằm trong khoảng 30 - 130 cm.');
      return;
    }
    // Ghi mốc vào giữa trưa giờ máy để ngày đo không bị lệch khi đổi sang UTC.
    const at = new Date(measuredAt.getFullYear(), measuredAt.getMonth(), measuredAt.getDate(), 12);
    setSaving(true);
    try {
      const res = await babyService.logGrowth(baby.id, w, h, at.toISOString());
      setEvaluation(res.data ?? null);
      setWeight('');
      setHeight('');
      setMeasuredAt(startOfToday());
      await load();
    } catch (err) {
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (record: GrowthRecord) => {
    Alert.alert('Xóa lần đo', 'Mẹ muốn xóa lần đo này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await babyService.deleteGrowth(baby.id, record.id as number);
            await load();
          } catch (err) {
            Alert.alert('Chưa xóa được', getApiErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen
      {...header}
      subtitle={`${baby.babyName} · ${isBoy ? 'bé trai' : 'bé gái'} · ${baby.ageMonths ?? 0} tháng tuổi`}
    >
      {latest ? (
        <Card>
          <Text style={styles.latestTitle}>
            Lần đo gần nhất · {formatUtcDate(latest.recordedAt)} ({Math.floor(latest.month)} tháng)
          </Text>
          <View style={styles.latestRow}>
            <Measure label="Cân nặng" value={`${latest.weightKg} kg`} band={weightBand} />
            <Measure label="Chiều cao" value={`${latest.heightCm} cm`} band={heightBand} />
          </View>
          {!weightBand && !heightBand ? (
            <Text style={uiStyles.muted}>Bảng chuẩn WHO trong ứng dụng hiện có cho bé 0–24 tháng.</Text>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <View style={[uiStyles.rowWrap, styles.tabs]}>
          <Chip label="Cân nặng" selected={metric === 'weight'} onPress={() => setMetric('weight')} />
          <Chip label="Chiều cao" selected={metric === 'height'} onPress={() => setMetric('height')} />
        </View>
        {records.length ? (
          <GrowthChart metric={metric} isBoy={isBoy} points={points} />
        ) : (
          <EmptyState
            emoji="📈"
            title="Chưa có lần đo nào"
            body="Mẹ ghi cân nặng và chiều cao của bé bên dưới để vẽ biểu đồ so với chuẩn WHO."
          />
        )}
      </Card>

      <SectionTitle title="Ghi lần đo mới" subtitle="Nên đo mỗi tháng, cùng giờ và trước khi ăn" />
      <Card>
        <DateField label="Ngày đo" value={measuredAt} onChange={setMeasuredAt} minimumDate={dob} maximumDate={startOfToday()} />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field label="Cân nặng (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="VD: 11.2" />
          </View>
          <View style={styles.flex}>
            <Field label="Chiều cao (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="VD: 82" />
          </View>
        </View>
        <PrimaryButton label="Lưu lần đo" onPress={submit} loading={saving} />
        {evaluation?.feedback ? (
          <View style={[styles.feedback, evaluation.isHealthy ? styles.feedbackOk : styles.feedbackWatch]}>
            <Text style={uiStyles.body}>{evaluation.feedback}</Text>
          </View>
        ) : null}
      </Card>

      {records.length ? (
        <>
          <SectionTitle title="Các lần đo" />
          <Card>
            {records.map((r, index) => (
              <View key={String(r.id ?? index)} style={[styles.historyRow, index > 0 && styles.historyBorder]}>
                <View style={styles.flex}>
                  <Text style={styles.historyDate}>
                    {formatUtcDate(r.recordedAt)} · {Math.floor(r.month)} tháng
                  </Text>
                  <Text style={styles.historyValue}>
                    {r.weightKg} kg · {r.heightCm} cm
                  </Text>
                </View>
                {r.id !== undefined ? (
                  <TouchableOpacity onPress={() => confirmDelete(r)} accessibilityLabel="Xóa lần đo">
                    <Trash2 size={18} color={MOM_THEME.mutedLight} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

function Measure({
  label,
  value,
  band,
}: {
  label: string;
  value: string;
  band: ReturnType<typeof classifyGrowth>;
}) {
  const tone = band ? TONE_COLOR[band.tone] : null;
  return (
    <View style={styles.measure}>
      <Text style={styles.measureLabel}>{label}</Text>
      <Text style={styles.measureValue}>{value}</Text>
      {band && tone ? (
        <View style={[styles.badge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.badgeText, { color: tone.color }]}>{band.label}</Text>
        </View>
      ) : null}
    </View>
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
  tabs: {
    marginBottom: 12,
  },
  latestTitle: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  latestRow: {
    flexDirection: 'row',
    gap: 12,
  },
  measure: {
    flex: 1,
    gap: 4,
  },
  measureLabel: {
    color: MOM_THEME.muted,
    fontSize: 12,
  },
  measureValue: {
    color: MOM_THEME.charcoal,
    fontSize: 22,
    fontWeight: '800',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  feedback: {
    borderRadius: RADII.control,
    padding: 12,
    marginTop: 12,
  },
  feedbackOk: {
    backgroundColor: MOM_THEME.sageLight,
  },
  feedbackWatch: {
    backgroundColor: MOM_THEME.amberLight,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  historyBorder: {
    borderTopWidth: 1,
    borderTopColor: MOM_THEME.borderSoft,
  },
  historyDate: {
    color: MOM_THEME.muted,
    fontSize: 12,
  },
  historyValue: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
});
