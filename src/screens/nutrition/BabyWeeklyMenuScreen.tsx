import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react-native';
import { Card, ErrorState, LoadingView, Screen, TierLockedCard, uiStyles } from '../../components/ui';
import babyService, { DailyMenuDto, MealItem, WeeklyMenuDto } from '../../services/babyService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';

const SLOTS = [
  { key: 'breakfast', label: 'Bữa sáng', icon: '🥣' },
  { key: 'lunch', label: 'Bữa trưa', icon: '🍲' },
  { key: 'snack', label: 'Bữa xế', icon: '🍎' },
  { key: 'dinner', label: 'Bữa tối', icon: '🥘' },
  { key: 'supplementary_snack', label: 'Cữ phụ', icon: '🍼' },
] as const;

type Meals = NonNullable<DailyMenuDto['meals']>;

export default function BabyWeeklyMenuScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'BabyWeeklyMenu'>>();
  const [menu, setMenu] = useState<WeeklyMenuDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [openMeal, setOpenMeal] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (force = false) => {
      try {
        const res = await babyService.getWeeklyMenu(params.babyId, force);
        if ((res.isSuccess || res.success) && res.data?.days?.length) {
          setMenu(res.data);
          setError(null);
        } else {
          setError(res.message || 'Chưa tạo được thực đơn tuần cho bé.');
        }
      } catch (err) {
        if (isTierLocked(err)) setLocked(true);
        else setError(getApiErrorMessage(err));
      }
    },
    [params.babyId]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const regenerate = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const header = {
    eyebrow: 'Bé yêu',
    title: 'Thực đơn 7 ngày',
    subtitle: `Gợi ý cho ${params.babyName}, đã tránh các thực phẩm bé dị ứng.`,
  };

  if (locked) {
    return (
      <Screen {...header}>
        <TierLockedCard feature="Thực đơn 7 ngày" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen {...header}>
        <ErrorState message={error} onRetry={() => load()} />
      </Screen>
    );
  }
  if (!menu) {
    return (
      <Screen {...header}>
        <LoadingView text="Đang lên thực đơn cho cả tuần..." />
      </Screen>
    );
  }

  const day = menu.days[Math.min(dayIndex, menu.days.length - 1)];
  const totals = day.nutrition_totals || {};
  const goals = day.goals || {};
  const meals: Meals = day.meals || {};
  const slots = SLOTS.filter((s) => s.key !== 'supplementary_snack' || meals[s.key]);

  return (
    <Screen
      {...header}
      right={
        <TouchableOpacity
          style={styles.refresh}
          onPress={regenerate}
          disabled={refreshing}
          accessibilityLabel="Tạo lại thực đơn tuần"
        >
          <RefreshCw size={18} color={MOM_THEME.roseDark} />
        </TouchableOpacity>
      }
    >
      <View style={styles.days}>
        {menu.days.map((_, index) => {
          const active = index === dayIndex;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.day, active && styles.dayActive]}
              onPress={() => {
                setDayIndex(index);
                setOpenMeal(null);
              }}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>Ngày</Text>
              <Text style={[styles.dayNumber, active && styles.dayLabelActive]}>{index + 1}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Card>
        <View style={styles.totalsHeader}>
          <Text style={styles.kcal}>
            {Math.round(totals.calories || 0)}
            <Text style={styles.kcalGoal}> / {Math.round(goals.calories || 0)} kcal</Text>
          </Text>
          <View style={[styles.badge, day.meets_80pct ? styles.badgeOk : styles.badgeWatch]}>
            <Text style={[styles.badgeText, day.meets_80pct ? styles.badgeOkText : styles.badgeWatchText]}>
              {day.meets_80pct ? 'Đủ ≥ 80% nhu cầu' : 'Chưa đủ 80% nhu cầu'}
            </Text>
          </View>
        </View>
        <Text style={uiStyles.muted}>
          Đạm {Math.round(totals.protein_g || 0)}g · Béo {Math.round(totals.fat_g || 0)}g · Tinh bột{' '}
          {Math.round(totals.carbs_g || 0)}g · Sắt {(totals.iron_mg || 0).toFixed(1)}mg
        </Text>
        {!day.meets_80pct ? (
          <Text style={[uiStyles.muted, styles.note]}>
            Bữa ăn dặm chưa đủ năng lượng; phần còn lại bé nhận từ sữa mẹ hoặc sữa công thức.
          </Text>
        ) : null}
      </Card>

      {slots.map((slot) => {
        const meal = meals[slot.key] as MealItem | null | undefined;
        const key = `${dayIndex}-${slot.key}`;
        const open = openMeal === key;
        return (
          <View key={slot.key} style={[styles.meal, SHADOWS.sm]}>
            <TouchableOpacity
              style={styles.mealHead}
              onPress={() => meal && setOpenMeal(open ? null : key)}
              disabled={!meal}
              activeOpacity={0.85}
            >
              <Text style={styles.mealIcon}>{slot.icon}</Text>
              <View style={styles.flex}>
                <Text style={styles.mealSlot}>{slot.label}</Text>
                {meal ? (
                  <Text style={styles.mealName}>{meal.name_vi || meal.name_en}</Text>
                ) : (
                  <Text style={styles.mealMissing}>Chưa có món phù hợp với dị ứng của bé.</Text>
                )}
                {meal?.total_calories ? (
                  <Text style={styles.mealMeta}>
                    {Math.round(meal.total_calories)} kcal{meal.prep_time_min ? ` · ${meal.prep_time_min} phút` : ''}
                  </Text>
                ) : null}
              </View>
              {meal ? open ? <ChevronUp size={18} color={MOM_THEME.muted} /> : <ChevronDown size={18} color={MOM_THEME.muted} /> : null}
            </TouchableOpacity>
            {open && meal ? (
              <View style={styles.mealBody}>
                {meal.description ? <Text style={uiStyles.body}>{meal.description}</Text> : null}
                {meal.ingredients?.length ? (
                  <>
                    <Text style={styles.subTitle}>Nguyên liệu</Text>
                    {meal.ingredients.map((item, i) => (
                      <Text key={i} style={uiStyles.body}>
                        • {item.ingredient.vietnamese_name || item.ingredient.english_name}
                        {item.weight_grams ? ` – ${item.weight_grams}g` : ''}
                      </Text>
                    ))}
                  </>
                ) : null}
                {meal.cooking_steps?.length ? (
                  <>
                    <Text style={styles.subTitle}>Cách làm</Text>
                    {meal.cooking_steps.map((s) => (
                      <Text key={s.step} style={uiStyles.body}>
                        {s.step}. {s.instruction}
                        {s.duration ? ` (${s.duration})` : ''}
                      </Text>
                    ))}
                  </>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  refresh: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MOM_THEME.white,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  days: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: RADII.control,
    backgroundColor: MOM_THEME.white,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  dayActive: {
    backgroundColor: MOM_THEME.roseDark,
    borderColor: MOM_THEME.roseDark,
  },
  dayLabel: {
    color: MOM_THEME.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  dayNumber: {
    color: MOM_THEME.charcoal,
    fontSize: 17,
    fontWeight: '800',
  },
  dayLabelActive: {
    color: MOM_THEME.white,
  },
  totalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  kcal: {
    color: MOM_THEME.charcoal,
    fontSize: 24,
    fontWeight: '800',
  },
  kcalGoal: {
    color: MOM_THEME.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeOk: {
    backgroundColor: MOM_THEME.sageLight,
  },
  badgeWatch: {
    backgroundColor: MOM_THEME.amberLight,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeOkText: {
    color: MOM_THEME.sageDark,
  },
  badgeWatchText: {
    color: MOM_THEME.amberDark,
  },
  note: {
    marginTop: 6,
  },
  meal: {
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    marginBottom: 10,
  },
  mealHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealSlot: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  mealName: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  mealMissing: {
    color: MOM_THEME.amberDark,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  mealMeta: {
    color: MOM_THEME.roseDark,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  mealBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },
  subTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
});
