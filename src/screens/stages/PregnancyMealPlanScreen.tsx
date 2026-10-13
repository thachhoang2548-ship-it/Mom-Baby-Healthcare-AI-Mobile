import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, ErrorState, LoadingView, Screen, TierLockedCard, uiStyles } from '../../components/ui';
import featureService, { PregnancyMealDay } from '../../services/featureService';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { MOM_THEME, RADII } from '../../theme/colors';

const MEALS: { key: 'breakfast' | 'lunch' | 'snack' | 'dinner'; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Bữa sáng', icon: '🌅' },
  { key: 'lunch', label: 'Bữa trưa', icon: '🍚' },
  { key: 'snack', label: 'Bữa phụ', icon: '🍎' },
  { key: 'dinner', label: 'Bữa tối', icon: '🌙' },
];

// "Thứ Hai" -> "T2", "Chủ Nhật" -> "CN"
const shortDay = (day: string) => {
  const map: Record<string, string> = { Hai: 'T2', Ba: 'T3', Tư: 'T4', Năm: 'T5', Sáu: 'T6', Bảy: 'T7' };
  if (/chủ nhật/i.test(day)) return 'CN';
  const last = day.trim().split(' ').pop() || day;
  return map[last] || day.slice(0, 3);
};

export default function PregnancyMealPlanScreen() {
  const [plan, setPlan] = useState<PregnancyMealDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [dayIndex, setDayIndex] = useState(() => (new Date().getDay() + 6) % 7);

  const load = useCallback(async () => {
    try {
      const data = await featureService.getPregnancyMealPlan();
      setPlan(Array.isArray(data) ? data : []);
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

  const header = {
    eyebrow: 'Thai kỳ',
    title: 'Thực đơn 7 ngày',
    subtitle: 'Gợi ý theo tuần thai của mẹ. Mẹ có thể đổi món tương đương nếu không hợp khẩu vị.',
  };

  if (locked) {
    return (
      <Screen {...header}>
        <TierLockedCard feature="Thực đơn thai kỳ" />
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

  const day = plan[Math.min(dayIndex, plan.length - 1)];
  const n = day?.dailyNutrients;

  return (
    <Screen {...header}>
      <View style={styles.days}>
        {plan.map((d, index) => {
          const active = index === dayIndex;
          return (
            <TouchableOpacity
              key={d.day}
              style={[styles.day, active && styles.dayActive]}
              onPress={() => setDayIndex(index)}
              accessibilityLabel={d.day}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>{shortDay(d.day)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {day ? (
        <>
          <Text style={styles.dayTitle}>{day.day}</Text>
          {MEALS.map((meal) => (
            <View key={meal.key} style={styles.mealRow}>
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <View style={styles.flex}>
                <Text style={styles.mealLabel}>{meal.label}</Text>
                <Text style={styles.mealText}>{day[meal.key] || '—'}</Text>
              </View>
            </View>
          ))}
          {n ? (
            <Card style={styles.nutrients}>
              <Text style={styles.kcal}>{n.calories ?? '—'} kcal</Text>
              <Text style={uiStyles.muted}>
                Đạm {n.protein ?? '—'} · Tinh bột {n.carbs ?? '—'} · Béo {n.fat ?? '—'} · Sắt {n.iron ?? '—'}
              </Text>
              <Text style={[uiStyles.muted, styles.note]}>
                Mẹ bầu nên bổ sung thêm viên sắt và acid folic theo chỉ định của bác sĩ.
              </Text>
            </Card>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  days: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADII.control,
    backgroundColor: MOM_THEME.white,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  dayActive: {
    backgroundColor: MOM_THEME.roseDark,
    borderColor: MOM_THEME.roseDark,
  },
  dayText: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '800',
  },
  dayTextActive: {
    color: MOM_THEME.white,
  },
  dayTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  mealRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    padding: 14,
    marginBottom: 10,
  },
  mealIcon: {
    fontSize: 22,
  },
  mealLabel: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  mealText: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  nutrients: {
    marginTop: 4,
  },
  kcal: {
    color: MOM_THEME.roseDeep,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  note: {
    marginTop: 8,
  },
});
