import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, ErrorState, LoadingView, Screen, TierLockedCard, uiStyles } from '../../components/ui';
import featureService, { PregnancyMealDay } from '../../services/featureService';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { MOM_THEME, RADII } from '../../theme/colors';
import { createThemedStyles } from '../../theme/accent';
import { useT } from '../../i18n';

const MEALS: { key: 'breakfast' | 'lunch' | 'snack' | 'dinner'; label: string; labelEn: string; icon: string }[] = [
  { key: 'breakfast', label: 'Bữa sáng', labelEn: 'Breakfast', icon: '🌅' },
  { key: 'lunch', label: 'Bữa trưa', labelEn: 'Lunch', icon: '🍚' },
  { key: 'snack', label: 'Bữa phụ', labelEn: 'Snack', icon: '🍎' },
  { key: 'dinner', label: 'Bữa tối', labelEn: 'Dinner', icon: '🌙' },
];

// "Thứ Hai" -> "T2" / "Mon", "Chủ Nhật" -> "CN" / "Sun"
const DAY_SHORT: Record<string, [string, string]> = {
  Hai: ['T2', 'Mon'],
  Ba: ['T3', 'Tue'],
  Tư: ['T4', 'Wed'],
  Năm: ['T5', 'Thu'],
  Sáu: ['T6', 'Fri'],
  Bảy: ['T7', 'Sat'],
};
const DAY_FULL_EN: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};
const shortDay = (day: string, en: boolean) => {
  if (/chủ nhật/i.test(day)) return en ? 'Sun' : 'CN';
  const last = day.trim().split(' ').pop() || day;
  const pair = DAY_SHORT[last];
  return pair ? pair[en ? 1 : 0] : day.slice(0, 3);
};

export default function PregnancyMealPlanScreen() {
  const styles = useStyles();
  const t = useT();
  const en = t('vi', 'en') === 'en';
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
    eyebrow: t('Thai kỳ', 'Pregnancy'),
    title: t('Thực đơn 7 ngày', '7-day meal plan'),
    subtitle: t(
      'Gợi ý theo tuần thai của mẹ. Mẹ có thể đổi món tương đương nếu không hợp khẩu vị.',
      'Based on your pregnancy week. Swap in a similar dish if something does not suit you. Dishes are named in Vietnamese.'
    ),
  };

  if (locked) {
    return (
      <Screen {...header}>
        <TierLockedCard feature={t('Thực đơn thai kỳ', 'Pregnancy meal plan')} />
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
              <Text style={[styles.dayText, active && styles.dayTextActive]}>{shortDay(d.day, en)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {day ? (
        <>
          <Text style={styles.dayTitle}>{en ? DAY_FULL_EN[shortDay(day.day, true)] ?? day.day : day.day}</Text>
          {MEALS.map((meal) => (
            <View key={meal.key} style={styles.mealRow}>
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <View style={styles.flex}>
                <Text style={styles.mealLabel}>{t(meal.label, meal.labelEn)}</Text>
                <Text style={styles.mealText}>{day[meal.key] || '—'}</Text>
              </View>
            </View>
          ))}
          {n ? (
            <Card style={styles.nutrients}>
              <Text style={styles.kcal}>{n.calories ?? '—'} kcal</Text>
              <Text style={uiStyles.muted}>
                {t('Đạm', 'Protein')} {n.protein ?? '—'} · {t('Tinh bột', 'Carbs')} {n.carbs ?? '—'} · {t('Béo', 'Fat')}{' '}
                {n.fat ?? '—'} · {t('Sắt', 'Iron')} {n.iron ?? '—'}
              </Text>
              <Text style={[uiStyles.muted, styles.note]}>
                {t(
                  'Mẹ bầu nên bổ sung thêm viên sắt và acid folic theo chỉ định của bác sĩ.',
                  'Take iron and folic acid supplements as your doctor advises.'
                )}
              </Text>
            </Card>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const useStyles = createThemedStyles((a) => ({
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
    backgroundColor: a.primary,
    borderColor: a.primary,
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
    color: a.primaryDark,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  note: {
    marginTop: 8,
  },
}));
