import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import {
  Card,
  Chip,
  ErrorState,
  Field,
  LoadingView,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
  uiStyles,
} from '../../components/ui';
import DateField from '../../components/DateField';
import featureService, { FertilityCalendar, OvulationToday } from '../../services/featureService';
import { getApiErrorMessage } from '../../utils/apiError';
import { addDays, formatDate, fromUtcDateIso, startOfToday, toUtcDateIso } from '../../utils/date';
import { MOM_THEME, RADII } from '../../theme/colors';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const CYCLE_SYMPTOMS = ['Đau bụng kinh', 'Đau lưng', 'Mệt mỏi', 'Đau đầu', 'Căng tức ngực', 'Thay đổi tâm trạng'];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const monthParam = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function MonthGrid({ month, calendar }: { month: Date; calendar: FertilityCalendar | null }) {
  const fertile = new Set(
    (calendar?.fertileWindowDays || [])
      .map((d) => fromUtcDateIso(d))
      .filter((d): d is Date => !!d)
      .map(dayKey)
  );
  const ovulation = fromUtcDateIso(calendar?.ovulationDay);
  const period = fromUtcDateIso(calendar?.periodPrediction);
  const today = startOfToday();

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Thứ 2 là cột đầu
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} style={styles.weekRow}>
          {cells.slice(row * 7, row * 7 + 7).map((date, col) => {
            if (!date) return <View key={col} style={styles.cell} />;
            const key = dayKey(date);
            const isOvulation = ovulation && dayKey(ovulation) === key;
            const isPeriod = period && dayKey(period) === key;
            const isFertile = fertile.has(key);
            const isToday = dayKey(today) === key;
            return (
              <View key={col} style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    isFertile && styles.dayFertile,
                    isOvulation && styles.dayOvulation,
                    isPeriod && styles.dayPeriod,
                    isToday && styles.dayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      (isOvulation || isPeriod) && styles.dayTextStrong,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
      <View style={styles.legend}>
        <Legend color={MOM_THEME.sageLight} label="Cửa sổ thụ thai" />
        <Legend color={MOM_THEME.roseDark} label="Ngày rụng trứng" />
        <Legend color="#F04438" label="Dự kiến có kinh" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

export default function FertilityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [month, setMonth] = useState(() => {
    const t = startOfToday();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [calendar, setCalendar] = useState<FertilityCalendar | null>(null);
  const [today, setToday] = useState<OvulationToday | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState('28');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (target: Date) => {
    try {
      const [cal, ov] = await Promise.all([
        featureService.getFertilityCalendar(monthParam(target)),
        featureService.getOvulationToday(),
      ]);
      setCalendar(cal);
      setToday(ov);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(month);
    }, [load, month])
  );

  const shiftMonth = (delta: number) => {
    setLoading(true);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const submit = async () => {
    const length = parseInt(cycleLength, 10);
    if (!periodStart) {
      Alert.alert('Thiếu ngày', 'Mẹ chọn ngày bắt đầu kỳ kinh nhé.');
      return;
    }
    if (!Number.isFinite(length) || length < 20 || length > 45) {
      Alert.alert('Kiểm tra lại', 'Độ dài chu kỳ thường từ 20 đến 45 ngày.');
      return;
    }
    setSaving(true);
    try {
      await featureService.logCycle(toUtcDateIso(periodStart), length, symptoms);
      setPeriodStart(null);
      setSymptoms([]);
      const start = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
      if (start.getTime() === month.getTime()) await load(month);
      else setMonth(start);
      Alert.alert('Đã lưu', 'Chu kỳ đã được ghi nhận. Lịch dự đoán đã cập nhật.');
    } catch (err) {
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      eyebrow="Chuẩn bị mang thai"
      title="Chu kỳ & rụng trứng"
      subtitle="Dự đoán dựa trên các kỳ kinh mẹ đã ghi. Ghi càng đều, dự đoán càng chính xác."
    >
      {today ? (
        <View style={[styles.todayCard, today.isInFertileWindow ? styles.todayFertile : styles.todayNormal]}>
          <Text style={styles.todayLabel}>
            {today.isInFertileWindow ? 'Hôm nay trong cửa sổ thụ thai 🌱' : 'Hôm nay ngoài cửa sổ thụ thai'}
          </Text>
          <Text style={styles.todayValue}>
            {today.daysUntilOvulation > 0
              ? `Còn ${today.daysUntilOvulation} ngày đến ngày rụng trứng`
              : today.daysUntilOvulation === 0
                ? 'Hôm nay là ngày rụng trứng dự kiến'
                : 'Đã qua ngày rụng trứng của chu kỳ này'}
          </Text>
          {today.recommendation ? <Text style={styles.todayText}>{today.recommendation}</Text> : null}
        </View>
      ) : null}

      <Card>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.monthButton} accessibilityLabel="Tháng trước">
            <ChevronLeft size={20} color={MOM_THEME.roseDark} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            Tháng {month.getMonth() + 1}/{month.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.monthButton} accessibilityLabel="Tháng sau">
            <ChevronRight size={20} color={MOM_THEME.roseDark} />
          </TouchableOpacity>
        </View>
        {error ? (
          <ErrorState message={error} onRetry={() => load(month)} />
        ) : loading && !calendar ? (
          <LoadingView />
        ) : (
          <MonthGrid month={month} calendar={calendar} />
        )}
        {calendar?.ovulationDay ? (
          <Text style={[uiStyles.muted, styles.prediction]}>
            Rụng trứng dự kiến {formatDate(fromUtcDateIso(calendar.ovulationDay))} · kỳ kinh tiếp theo{' '}
            {formatDate(fromUtcDateIso(calendar.periodPrediction))}
          </Text>
        ) : null}
      </Card>

      <SecondaryButton
        label="Lịch trình IVF"
        icon={<CalendarRange size={16} color={MOM_THEME.roseDeep} />}
        onPress={() => navigation.navigate('IvfTimeline')}
        style={styles.ivf}
      />

      <SectionTitle title="Ghi kỳ kinh mới" />
      <Card>
        <DateField
          label="Ngày bắt đầu kỳ kinh"
          value={periodStart}
          onChange={setPeriodStart}
          maximumDate={startOfToday()}
          minimumDate={addDays(startOfToday(), -120)}
        />
        <Field
          label="Độ dài chu kỳ (ngày)"
          value={cycleLength}
          onChangeText={setCycleLength}
          keyboardType="number-pad"
          hint="Tính từ ngày đầu kỳ này đến ngày đầu kỳ sau, thường 21 - 35 ngày"
        />
        <Text style={uiStyles.label}>Triệu chứng đi kèm</Text>
        <View style={[uiStyles.rowWrap, styles.symptoms]}>
          {CYCLE_SYMPTOMS.map((s) => (
            <Chip key={s} label={s} selected={symptoms.includes(s)} onPress={() => toggleSymptom(s)} />
          ))}
        </View>
        <PrimaryButton label="Lưu chu kỳ" onPress={submit} loading={saving} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  todayCard: {
    borderRadius: RADII.cardLg,
    padding: 18,
    marginBottom: 14,
  },
  todayFertile: {
    backgroundColor: MOM_THEME.sageDark,
  },
  todayNormal: {
    backgroundColor: MOM_THEME.roseDark,
  },
  todayLabel: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    fontWeight: '700',
  },
  todayValue: {
    color: MOM_THEME.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  todayText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MOM_THEME.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayFertile: {
    backgroundColor: MOM_THEME.sageLight,
  },
  dayOvulation: {
    backgroundColor: MOM_THEME.roseDark,
  },
  dayPeriod: {
    backgroundColor: '#F04438',
  },
  dayToday: {
    borderWidth: 2,
    borderColor: MOM_THEME.charcoal,
  },
  dayText: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '600',
  },
  dayTextStrong: {
    color: MOM_THEME.white,
    fontWeight: '800',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: MOM_THEME.muted,
    fontSize: 12,
  },
  prediction: {
    marginTop: 10,
  },
  ivf: {
    marginTop: 0,
    marginBottom: 6,
  },
  symptoms: {
    marginBottom: 12,
  },
});
