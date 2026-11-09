import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Award,
  CalendarDays,
  ChartLine,
  Flame,
  Info,
  Pencil,
  Plus,
  RefreshCw,
  Ruler,
  Sparkles,
  Weight,
} from 'lucide-react-native';
import babyService, { BabyProfileDto, DailyMenuDto, MealItem } from '../../services/babyService';
import { EmptyState, ErrorState, LoadingView, SecondaryButton, TierLockedCard } from '../../components/ui';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage, isNetworkError, isTierLocked } from '../../utils/apiError';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';
import { tr, useT } from '../../i18n';
import { createThemedStyles, useAccent, useThemeStore } from '../../theme/accent';

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Bữa sáng', labelEn: 'Breakfast', time: '07:30', icon: '🥣' },
  { key: 'lunch', label: 'Bữa trưa', labelEn: 'Lunch', time: '11:30', icon: '🍲' },
  { key: 'snack', label: 'Bữa xế', labelEn: 'Afternoon snack', time: '15:30', icon: '🥑' },
  { key: 'dinner', label: 'Bữa tối', labelEn: 'Dinner', time: '18:30', icon: '🥣' },
  { key: 'supplementary_snack', label: 'Cữ phụ', labelEn: 'Extra feed', time: '20:00', icon: '🍼' },
];

const formatMeasure = (value: number | undefined, unit: string) =>
  value ? `${value} ${unit}` : tr('Chưa có', 'Not yet');

export default function BabyNutritionScreen() {
  const a = useAccent();
  const styles = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const t = useT();
  const [offline, setOffline] = useState(false);
  const [babies, setBabies] = useState<BabyProfileDto[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dailyMenu, setDailyMenu] = useState<DailyMenuDto | null>(null);
  const [menuMessage, setMenuMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMenu = useCallback(async (babyId: string, force = false) => {
    setIsLoading(true);
    setMenuMessage(null);
    try {
      const res = await babyService.getDailyMenu(babyId, force);
      if ((res.isSuccess || res.success) && res.data) {
        setDailyMenu(res.data);
        return true;
      }
      setDailyMenu(null);
      setMenuMessage(res.message || tr('Chưa thể tạo thực đơn cho bé.', 'Could not create a menu for your baby.'));
      return false;
    } catch (err) {
      setDailyMenu(null);
      setMenuMessage(
        getApiErrorMessage(
          err,
          tr(
            'Chưa tạo được thực đơn cho bé. Mẹ thử làm mới sau ít phút nhé.',
            'Could not create a menu yet. Try refreshing in a few minutes.'
          )
        )
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectBaby = useCallback(
    (babyId: string | null) => {
      selectedIdRef.current = babyId;
      setSelectedId(babyId);
      if (babyId) loadMenu(babyId);
    },
    [loadMenu]
  );

  const loadBabies = useCallback(async () => {
    setLoadError(null);
    setOffline(false);
    try {
      const res = await babyService.getProfiles();
      const list = (res.isSuccess || res.success) && Array.isArray(res.data) ? res.data : [];
      setLocked(false);
      setBabies(list);
      const keep = list.find((b) => b.id === selectedIdRef.current);
      selectBaby(keep ? keep.id : list[0]?.id ?? null);
    } catch (err) {
      if (isTierLocked(err)) {
        setLocked(true);
        setBabies([]);
      } else {
        setOffline(isNetworkError(err));
        setLoadError(getApiErrorMessage(err));
      }
    }
  }, [selectBaby]);

  // Tải lại khi quay về từ màn thêm/sửa hồ sơ bé.
  useFocusEffect(
    useCallback(() => {
      loadBabies();
    }, [loadBabies])
  );

  const refreshMenu = async () => {
    if (!selectedId) return;
    setIsRefreshing(true);
    await loadMenu(selectedId, true);
    setIsRefreshing(false);
  };

  const selectedBaby = babies?.find((b) => b.id === selectedId) ?? null;

  // Màu giao diện đổi theo bé đang chọn (bé gái hồng, bé trai xanh).
  const setActiveBaby = useThemeStore((s) => s.setActiveBaby);
  useEffect(() => {
    if (babies === null || locked) return;
    setActiveBaby(selectedBaby ? { id: selectedBaby.id, gender: selectedBaby.gender } : null);
  }, [babies, locked, selectedBaby, setActiveBaby]);
  const ageMonths = selectedBaby?.ageMonths ?? 0;
  const tip = getNutritionTip(ageMonths, t);
  const totals = dailyMenu?.nutrition_totals || {};
  const goals = dailyMenu?.goals || {};
  // Backend trả null cho bữa không còn món an toàn với dị ứng của bé. Bữa chính vẫn hiện
  // (kèm lời giải thích) để mẹ biết cần tự chuẩn bị; cữ phụ không phải ngày nào cũng có nên ẩn đi.
  const meals = MEAL_SLOTS.map((slot) => ({
    slot,
    meal: (dailyMenu?.meals?.[slot.key as keyof NonNullable<DailyMenuDto['meals']>] ?? undefined) as
      | MealItem
      | undefined,
  })).filter((item) => item.meal || item.slot.key !== 'supplementary_snack');
  const hasAnyMeal = meals.some((item) => item.meal);

  const renderBody = () => {
    if (loadError) return <ErrorState message={loadError} onRetry={loadBabies} offline={offline} />;
    if (babies === null) return <LoadingView />;
    if (locked) return <TierLockedCard feature={t('Hồ sơ & thực đơn cho bé', 'Baby profile & menus')} />;
    if (!selectedBaby) {
      return (
        <EmptyState
          emoji="👶"
          title={t('Chưa có hồ sơ bé yêu', 'No baby profile yet')}
          body={t(
            'Thêm ngày sinh, cân nặng và dị ứng của bé để nhận thực đơn theo đúng độ tuổi.',
            'Add your baby’s birth date, weight and allergies to get menus for their age.'
          )}
          actionLabel={t('Thêm bé đầu tiên', 'Add your first baby')}
          onAction={() => navigation.navigate('BabyProfileForm')}
        />
      );
    }

    return (
      <>
        {/* ── Baby Selector Chips ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.babyScroller}>
          {babies.map((baby) => {
            const active = selectedId === baby.id;
            return (
              <TouchableOpacity
                key={baby.id}
                style={[styles.babyChip, active && styles.babyChipActive]}
                onPress={() => selectBaby(baby.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.babyChipEmoji}>👶</Text>
                <Text style={[styles.babyChipText, active && styles.babyChipTextActive]}>
                  {baby.babyName || t('Bé yêu', 'Baby')} · {baby.ageMonths ?? 0} {t('tháng', 'mo')}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.babyChip}
            onPress={() => navigation.navigate('BabyProfileForm')}
            activeOpacity={0.8}
          >
            <Plus size={14} color={a.primary} />
            <Text style={styles.babyChipText}>{t('Thêm bé', 'Add baby')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Baby Hero Card with Real Visual ── */}
        <View style={[styles.heroCard, SHADOWS.card]}>
          <Image
            source={require('../../../assets/images/baby.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.statusBadge}>
                <Award size={13} color={MOM_THEME.white} />
                <Text style={styles.statusText}>
                  {selectedBaby.gender === 0 ? t('Bé trai', 'Boy') : t('Bé gái', 'Girl')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.agePill}
                onPress={() => navigation.navigate('BabyProfileForm', { baby: selectedBaby })}
                activeOpacity={0.85}
              >
                <Pencil size={12} color={a.primary} />
                <Text style={styles.agePillText}>{t('Sửa hồ sơ', 'Edit profile')}</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.heroBabyName}>{selectedBaby.babyName || t('Bé yêu của mẹ', 'Your baby')}</Text>
              <Text style={styles.heroBabySub}>{t(`${ageMonths} tháng tuổi`, `${ageMonths} months old`)}</Text>
            </View>

            <View style={styles.statsCardRow}>
              <View style={styles.statMiniCard}>
                <Weight size={15} color={a.primary} />
                <View>
                  <Text style={styles.statMiniVal}>{formatMeasure(selectedBaby.currentWeightKg, 'kg')}</Text>
                  <Text style={styles.statMiniLbl}>{t('Cân nặng', 'Weight')}</Text>
                </View>
              </View>
              <View style={styles.statMiniCard}>
                <Ruler size={15} color={MOM_THEME.sageDark} />
                <View>
                  <Text style={styles.statMiniVal}>{formatMeasure(selectedBaby.currentHeightCm, 'cm')}</Text>
                  <Text style={styles.statMiniLbl}>{t('Chiều cao', 'Height')}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickLinks}>
          <SecondaryButton
            label={t('Tăng trưởng', 'Growth')}
            icon={<ChartLine size={16} color={a.primaryDark} />}
            onPress={() => navigation.navigate('GrowthChart', { babyId: String(selectedBaby.id) })}
            style={styles.quickLink}
          />
          <SecondaryButton
            label={t('Thực đơn 7 ngày', '7-day menu')}
            icon={<CalendarDays size={16} color={a.primaryDark} />}
            onPress={() =>
              navigation.navigate('BabyWeeklyMenu', {
                babyId: String(selectedBaby.id),
                babyName: selectedBaby.babyName || 'bé',
              })
            }
            style={styles.quickLink}
          />
        </View>

        {/* ── Age Tip Card ── */}
        <View style={[styles.tipCard, SHADOWS.sm]}>
          <View style={styles.tipIconWrap}>
            <Sparkles size={18} color={MOM_THEME.amberDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipBody}>{tip.body}</Text>
          </View>
        </View>

        {/* ── Macro Nutrition Card ── */}
        {dailyMenu ? (
          <View style={[styles.macroCard, SHADOWS.card]}>
            <View style={styles.macroTop}>
              <View style={styles.calorieBox}>
                <View style={styles.calorieIconWrap}>
                  <Flame size={18} color="#D95368" />
                </View>
                <View>
                  <Text style={styles.calorieValue}>{Math.round(totals.calories || 0)} kcal</Text>
                  {goals.calories ? (
                    <Text style={styles.calorieLabel}>
                      {t('Mục tiêu hôm nay', 'Today’s goal')}: {Math.round(goals.calories)} kcal
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.nutrientRow}>
              <Nutrient label={t('Đạm (Protein)', 'Protein')} value={`${Math.round(totals.protein_g || 0)}g`} color="#4A88C7" bg="#EEF5FA" />
              <Nutrient label={t('Chất béo', 'Fat')} value={`${Math.round(totals.fat_g || 0)}g`} color={MOM_THEME.amberDark} bg="#FFF5EB" />
              <Nutrient label={t('Tinh bột', 'Carbs')} value={`${Math.round(totals.carbs_g || 0)}g`} color={MOM_THEME.sageDark} bg="#E8F2EC" />
            </View>
          </View>
        ) : null}

        {/* ── Section: Thực đơn theo cữ ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('Thực đơn các cữ hôm nay', 'Today’s meals')}</Text>
          <Text style={styles.sectionSub}>{t('Gợi ý định lượng theo độ tuổi của bé', 'Portions suggested for your baby’s age')}</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={a.primary} />
            <Text style={styles.loadingText}>{t('Đang chuẩn bị thực đơn dinh dưỡng...', 'Preparing the menu...')}</Text>
          </View>
        ) : menuMessage || !hasAnyMeal ? (
          <View style={styles.errorBox}>
            <Info size={15} color={MOM_THEME.amberDark} />
            <View style={styles.flex}>
              <Text style={styles.errorText}>
                {menuMessage || t('Chưa có thực đơn cho hôm nay.', 'No menu for today yet.')}
              </Text>
              <TouchableOpacity onPress={refreshMenu} disabled={isRefreshing} hitSlop={8}>
                <Text style={styles.retryLink}>{t('Tạo lại thực đơn', 'Create the menu again')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          meals.map(({ slot, meal }) => (
            <View key={slot.key} style={[styles.mealCard, SHADOWS.sm]}>
              <View style={styles.mealEmojiWrap}>
                <Text style={{ fontSize: 20 }}>{slot.icon}</Text>
              </View>
              <View style={styles.mealCopy}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealSlot}>{t(slot.label, slot.labelEn)}</Text>
                  <Text style={styles.mealTime}>{slot.time}</Text>
                </View>
                {meal ? (
                  <Text style={styles.mealName}>
                    {t(meal.name_vi || meal.name_en || '', meal.name_en || meal.name_vi || '')}
                  </Text>
                ) : (
                  <Text style={styles.mealMissing}>
                    {t(
                      'Chưa có món phù hợp với dị ứng của bé. Mẹ tự chuẩn bị món quen, tránh ',
                      'No dish fits your baby’s allergies. Prepare a familiar dish and avoid '
                    )}
                    {selectedBaby.allergies?.length
                      ? selectedBaby.allergies.join(', ').toLowerCase()
                      : t('thực phẩm bé dị ứng', 'foods your baby is allergic to')}
                    .
                  </Text>
                )}
                {meal?.total_calories ? (
                  <View style={styles.mealMetaRow}>
                    <Text style={styles.mealMetaKcal}>{Math.round(meal.total_calories)} kcal</Text>
                    {meal.protein_g ? (
                      <>
                        <Text style={styles.mealMetaDot}>·</Text>
                        <Text style={styles.mealMetaSub}>
                          {t('Đạm', 'Protein')} {Math.round(meal.protein_g)}g
                        </Text>
                      </>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>
          ))
        )}
      </>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={MOM_THEME.cream} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <View>
            <View style={styles.eyebrowWrap}>
              <Text style={styles.eyebrow}>{t('DINH DƯỠNG & PHÁT TRIỂN', 'NUTRITION & GROWTH')}</Text>
            </View>
            <Text style={styles.title}>{t('Bé yêu của mẹ', 'Your baby')}</Text>
          </View>
          {selectedBaby ? (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshMenu}
              disabled={isRefreshing}
              accessibilityLabel={t('Tạo lại thực đơn', 'Create the menu again')}
              activeOpacity={0.8}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={a.primary} />
              ) : (
                <RefreshCw size={19} color={a.primary} />
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {renderBody()}
      </ScrollView>
    </View>
  );
}

function getNutritionTip(ageMonths: number, t: (vi: string, en: string) => string) {
  if (ageMonths < 6) {
    return {
      title: t('Sữa mẹ là nguồn dinh dưỡng vàng', 'Breast milk comes first'),
      body: t(
        'Bé dưới 6 tháng nên bú mẹ hoàn toàn hoặc sữa công thức phù hợp. Chưa cần ăn dặm nếu bác sĩ không chỉ định.',
        'Under 6 months, babies need only breast milk or suitable formula. No solids unless your doctor advises it.'
      ),
    };
  }
  if (ageMonths <= 8) {
    return {
      title: t('Giai đoạn bắt đầu ăn dặm', 'Starting solids'),
      body: t(
        'Ưu tiên bột mịn, cháo rây tỉ lệ 1:10, rau củ ngọt thanh và đạm dễ tiêu. Mỗi món mới mẹ cho thử 2-3 ngày nhé.',
        'Start with smooth purées, thin rice porridge, mild vegetables and easy proteins. Try each new food for 2–3 days.'
      ),
    };
  }
  if (ageMonths <= 11) {
    return {
      title: t('Tăng dần độ thô cho bé', 'Adding texture'),
      body: t(
        'Mẹ có thể nấu cháo hạt vỡ, rau củ hấp mềm thái nhỏ, đậu hũ, cá hồi và tập cho bé bốc thức ăn an toàn.',
        'Try coarser porridge, soft steamed vegetables cut small, tofu, salmon and safe finger foods.'
      ),
    };
  }
  return {
    title: t('Đa dạng 4 nhóm chất', 'A varied diet'),
    body: t(
      'Bé có thể ăn cơm nát hoặc cùng bữa với gia đình. Mẹ nêm nhạt, ít muối đường và giữ không khí ăn vui vẻ.',
      'Your baby can eat soft rice or join family meals. Keep salt and sugar low and make mealtimes relaxed.'
    ),
  };
}

function Nutrient({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  const styles = useStyles();
  return (
    <View style={[styles.nutrient, { backgroundColor: bg }]}>
      <Text style={[styles.nutrientValue, { color }]}>{value}</Text>
      <Text style={styles.nutrientLabel}>{label}</Text>
    </View>
  );
}

const useStyles = createThemedStyles((a) => ({
  root: {
    flex: 1,
    backgroundColor: MOM_THEME.cream,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrowWrap: {
    marginBottom: 2,
  },
  eyebrow: {
    color: a.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    color: MOM_THEME.charcoal,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MOM_THEME.white,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyScroller: {
    marginBottom: 16,
  },
  babyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    borderRadius: RADII.pill,
    backgroundColor: MOM_THEME.white,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  babyChipActive: {
    backgroundColor: a.primary,
    borderColor: a.primary,
  },
  babyChipEmoji: {
    fontSize: 14,
  },
  babyChipText: {
    color: MOM_THEME.charcoal,
    fontSize: 12,
    fontWeight: '700',
  },
  babyChipTextActive: {
    color: MOM_THEME.white,
  },
  emptyBox: {
    backgroundColor: MOM_THEME.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  emptyTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyText: {
    color: MOM_THEME.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  heroCard: {
    height: 210,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 33, 24, 0.44)',
  },
  heroContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(95, 122, 107, 0.88)',
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: MOM_THEME.white,
    fontSize: 11,
    fontWeight: '700',
  },
  agePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  agePillText: {
    color: MOM_THEME.charcoal,
    fontSize: 11,
    fontWeight: '700',
  },
  heroBabyName: {
    fontSize: 22,
    fontWeight: '800',
    color: MOM_THEME.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroBabySub: {
    fontSize: 12,
    color: '#FBF8F5',
    fontWeight: '500',
    marginTop: 2,
  },
  statsCardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statMiniCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statMiniVal: {
    fontSize: 13,
    fontWeight: '800',
    color: MOM_THEME.charcoal,
  },
  statMiniLbl: {
    fontSize: 10,
    color: MOM_THEME.muted,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickLink: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F7E7D0',
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE8D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    color: MOM_THEME.amberDark,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  tipBody: {
    color: MOM_THEME.charcoalMid,
    fontSize: 12,
    lineHeight: 18,
  },
  macroCard: {
    backgroundColor: MOM_THEME.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  macroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calorieBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calorieIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieValue: {
    color: MOM_THEME.charcoal,
    fontSize: 17,
    fontWeight: '800',
  },
  calorieLabel: {
    color: MOM_THEME.muted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  balanceBadge: {
    backgroundColor: MOM_THEME.sageLight,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  balanceBadgeText: {
    color: MOM_THEME.sageDark,
    fontSize: 11,
    fontWeight: '800',
  },
  nutrientRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nutrient: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  nutrientLabel: {
    color: MOM_THEME.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSub: {
    color: MOM_THEME.muted,
    fontSize: 12,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF4EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE0C2',
  },
  flex: {
    flex: 1,
  },
  errorText: {
    color: MOM_THEME.amberDark,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  retryLink: {
    color: a.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 28,
  },
  loadingText: {
    color: MOM_THEME.muted,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MOM_THEME.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  mealEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: MOM_THEME.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  mealCopy: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  mealSlot: {
    color: MOM_THEME.charcoalMid,
    fontSize: 12,
    fontWeight: '800',
  },
  mealTime: {
    color: a.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  mealName: {
    color: MOM_THEME.charcoal,
    fontSize: 14,
    fontWeight: '700',
  },
  mealMissing: {
    color: MOM_THEME.amberDark,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  mealMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  mealMetaKcal: {
    color: a.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  mealMetaDot: {
    color: MOM_THEME.mutedLight,
  },
  mealMetaSub: {
    color: MOM_THEME.muted,
    fontSize: 11,
  },
}));

