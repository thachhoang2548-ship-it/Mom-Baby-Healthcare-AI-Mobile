import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react-native';
import { Card, ErrorState, LoadingView, Screen, TierLockedCard, uiStyles } from '../../components/ui';
import babyService, { DailyMenuDto, MealItem, WeeklyMenuDto } from '../../services/babyService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';
import { createThemedStyles, useAccent } from '../../theme/accent';
import { useT } from '../../i18n';

const SLOTS = [
  { key: 'breakfast', label: 'Bữa sáng', labelEn: 'Breakfast', icon: '🥣' },
  { key: 'lunch', label: 'Bữa trưa', labelEn: 'Lunch', icon: '🍲' },
  { key: 'snack', label: 'Bữa xế', labelEn: 'Afternoon snack', icon: '🍎' },
  { key: 'dinner', label: 'Bữa tối', labelEn: 'Dinner', icon: '🥘' },
  { key: 'supplementary_snack', label: 'Cữ phụ', labelEn: 'Extra feed', icon: '🍼' },
] as const;

type Meals = NonNullable<DailyMenuDto['meals']>;

export default function BabyWeeklyMenuScreen() {
  const a = useAccent();
  const styles = useStyles();
  const t = useT();
  const en = t('vi', 'en') === 'en';
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
          setError(res.message || t('Chưa tạo được thực đơn tuần cho bé.', 'Could not create a weekly menu yet.'));
        }
      } catch (err) {
        if (isTierLocked(err)) setLocked(true);
        else setError(getApiErrorMessage(err));
      }
    },
    [params.babyId, t]
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
    eyebrow: t('Bé yêu', 'Your baby'),
    title: t('Thực đơn 7 ngày', '7-day menu'),
    subtitle: t(
      `Gợi ý cho ${params.babyName}, đã tránh các thực phẩm bé dị ứng.`,
      `Ideas for ${params.babyName}, avoiding foods your baby is allergic to.`
    ),
  };

  if (locked) {
    return (
      <Screen {...header}>
        <TierLockedCard feature={t('Thực đơn 7 ngày', '7-day menu')} />
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
        <LoadingView text={t('Đang lên thực đơn cho cả tuần...', 'Planning the week...')} />
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
          accessibilityLabel={t('Tạo lại thực đơn tuần', 'Make a new weekly menu')}
        >
          <RefreshCw size={18} color={a.primary} />
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
              <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{t('Ngày', 'Day')}</Text>
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
              {day.meets_80pct ? t('Đủ ≥ 80% nhu cầu', 'Meets ≥ 80% of needs') : t('Chưa đủ 80% nhu cầu', 'Under 80% of needs')}
            </Text>
          </View>
        </View>
        <Text style={uiStyles.muted}>
          {t('Đạm', 'Protein')} {Math.round(totals.protein_g || 0)}g · {t('Béo', 'Fat')} {Math.round(totals.fat_g || 0)}g ·{' '}
          {t('Tinh bột', 'Carbs')} {Math.round(totals.carbs_g || 0)}g · {t('Sắt', 'Iron')} {(totals.iron_mg || 0).toFixed(1)}mg
        </Text>
        {!day.meets_80pct ? (
          <Text style={[uiStyles.muted, styles.note]}>
            {t(
              'Bữa ăn dặm chưa đủ năng lượng; phần còn lại bé nhận từ sữa mẹ hoặc sữa công thức.',
              'Solid meals do not cover all the energy; breast milk or formula makes up the rest.'
            )}
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
                <Text style={styles.mealSlot}>{t(slot.label, slot.labelEn)}</Text>
                {meal ? (
                  <Text style={styles.mealName}>{(en ? meal.name_en : meal.name_vi) || meal.name_vi || meal.name_en}</Text>
                ) : (
                  <Text style={styles.mealMissing}>{t('Chưa có món phù hợp với dị ứng của bé.', "No dish fits your baby's allergies yet.")}</Text>
                )}
                {meal?.total_calories ? (
                  <Text style={styles.mealMeta}>
                    {Math.round(meal.total_calories)} kcal{meal.prep_time_min ? ` · ${meal.prep_time_min} ${t('phút', 'min')}` : ''}
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
                    <Text style={styles.subTitle}>{t('Nguyên liệu', 'Ingredients')}</Text>
                    {meal.ingredients.map((item, i) => (
                      <Text key={i} style={uiStyles.body}>
                        • {(en ? item.ingredient.english_name : item.ingredient.vietnamese_name) ||
                          item.ingredient.vietnamese_name ||
                          item.ingredient.english_name}
                        {item.weight_grams ? ` – ${item.weight_grams}g` : ''}
                      </Text>
                    ))}
                  </>
                ) : null}
                {meal.cooking_steps?.length ? (
                  <>
                    <Text style={styles.subTitle}>{t('Cách làm', 'Steps')}</Text>
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

const useStyles = createThemedStyles((a) => ({
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
    backgroundColor: a.primary,
    borderColor: a.primary,
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
    color: a.primary,
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
}));
