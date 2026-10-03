import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Award,
  Baby,
  ChevronRight,
  Flame,
  Heart,
  Info,
  RefreshCw,
  Ruler,
  Sparkles,
  Utensils,
  Weight,
} from 'lucide-react-native';
import babyService, { BabyProfileDto, DailyMenuDto, MealItem } from '../../services/babyService';
import { COLORS, MOM_THEME, RADII, SHADOWS } from '../../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Bữa sáng', time: '07:30', icon: '🥣' },
  { key: 'lunch', label: 'Bữa trưa', time: '11:30', icon: '🍲' },
  { key: 'snack', label: 'Bữa xế', time: '15:30', icon: '🥑' },
  { key: 'dinner', label: 'Bữa tối', time: '18:30', icon: '🥣' },
  { key: 'supplementary_snack', label: 'Cữ phụ', time: '20:00', icon: '🍼' },
];

export default function BabyNutritionScreen() {
  const [babies, setBabies] = useState<BabyProfileDto[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<BabyProfileDto | null>(null);
  const [dailyMenu, setDailyMenu] = useState<DailyMenuDto | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMenu = async (babyId: string | number, force = false) => {
    setIsLoading(true);
    setMenuError(null);
    try {
      const res = await babyService.getDailyMenu(babyId, force);
      if ((res.isSuccess || res.success) && res.data) {
        setDailyMenu(res.data);
        return true;
      }
      setDailyMenu(null);
      setMenuError(res.message || 'Chưa thể tạo thực đơn cho bé.');
      return false;
    } catch (err: any) {
      setDailyMenu(null);
      setMenuError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          'Backend chưa tạo được thực đơn. App đang hiển thị gợi ý mẫu theo chuẩn dinh dưỡng.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadBabies = useCallback(async () => {
    try {
      const res = await babyService.getProfiles();
      if ((res.isSuccess || res.success) && Array.isArray(res.data) && res.data.length > 0) {
        setBabies(res.data);
        setSelectedBaby(res.data[0]);
        loadMenu(res.data[0].id);
      } else {
        setBabies([]);
        setSelectedBaby(null);
      }
    } catch {
      setBabies([]);
      setSelectedBaby(null);
    }
  }, []);

  useEffect(() => {
    loadBabies();
  }, [loadBabies]);

  const refreshMenu = async () => {
    if (!selectedBaby) return;
    setIsRefreshing(true);
    const ok = await loadMenu(selectedBaby.id, true);
    setIsRefreshing(false);
    Alert.alert(
      'Thực đơn dinh dưỡng',
      ok
        ? 'Đã làm mới thực đơn theo chuẩn dinh dưỡng cho bé.'
        : 'Backend chưa trả về thực đơn mới. App đang hiển thị gợi ý khoa học mẫu.'
    );
  };

  const ageMonths = selectedBaby?.ageMonths || 8;
  const tip = getNutritionTip(ageMonths);
  const totals = dailyMenu?.nutrition_totals || {};
  const goals = dailyMenu?.goals || {};

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
              <Text style={styles.eyebrow}>DINH DƯỠNG & PHÁT TRIỂN</Text>
            </View>
            <Text style={styles.title}>Bé yêu của mẹ</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshMenu}
            disabled={!selectedBaby || isRefreshing}
            activeOpacity={0.8}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={MOM_THEME.roseDark} />
            ) : (
              <RefreshCw size={19} color={MOM_THEME.roseDark} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Baby Selector Chips ── */}
        {babies.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.babyScroller}>
            {babies.map((baby) => {
              const active = selectedBaby?.id === baby.id;
              return (
                <TouchableOpacity
                  key={baby.id}
                  style={[styles.babyChip, active && styles.babyChipActive]}
                  onPress={() => {
                    setSelectedBaby(baby);
                    loadMenu(baby.id);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.babyChipEmoji}>👶</Text>
                  <Text style={[styles.babyChipText, active && styles.babyChipTextActive]}>
                    {baby.babyName || baby.name || 'Bé yêu'} · {baby.ageMonths || 0} tháng
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Chưa có hồ sơ bé yêu</Text>
            <Text style={styles.emptyText}>Mẹ có thể thêm thông tin bé ở mục Menu / Hồ sơ để nhận thực đơn cá nhân hóa nhé.</Text>
          </View>
        )}

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
                <Text style={styles.statusText}>Tiêu chuẩn WHO</Text>
              </View>
              <View style={styles.agePill}>
                <Text style={styles.agePillText}>{ageMonths} tháng tuổi</Text>
              </View>
            </View>

            <View>
              <Text style={styles.heroBabyName}>
                {selectedBaby?.babyName || selectedBaby?.name || 'Bé yêu của mẹ'}
              </Text>
              <Text style={styles.heroBabySub}>Phát triển khỏe mạnh, ăn ngon chóng lớn ✨</Text>
            </View>

            <View style={styles.statsCardRow}>
              <View style={styles.statMiniCard}>
                <Weight size={15} color={MOM_THEME.roseDark} />
                <View>
                  <Text style={styles.statMiniVal}>{selectedBaby?.currentWeightKg || 8.5} kg</Text>
                  <Text style={styles.statMiniLbl}>Cân nặng</Text>
                </View>
              </View>
              <View style={styles.statMiniCard}>
                <Ruler size={15} color={MOM_THEME.sageDark} />
                <View>
                  <Text style={styles.statMiniVal}>{selectedBaby?.currentHeightCm || 71} cm</Text>
                  <Text style={styles.statMiniLbl}>Chiều cao</Text>
                </View>
              </View>
            </View>
          </View>
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
        <View style={[styles.macroCard, SHADOWS.card]}>
          <View style={styles.macroTop}>
            <View style={styles.calorieBox}>
              <View style={styles.calorieIconWrap}>
                <Flame size={18} color="#D95368" />
              </View>
              <View>
                <Text style={styles.calorieValue}>{Math.round(totals.calories || 620)} kcal</Text>
                <Text style={styles.calorieLabel}>Mục tiêu hôm nay: {Math.round(goals.calories || 700)} kcal</Text>
              </View>
            </View>
            <View style={styles.balanceBadge}>
              <Text style={styles.balanceBadgeText}>Cân đối</Text>
            </View>
          </View>

          <View style={styles.nutrientRow}>
            <Nutrient label="Đạm (Protein)" value={`${totals.protein_g || 18}g`} color="#4A88C7" bg="#EEF5FA" />
            <Nutrient label="Chất béo" value={`${totals.fat_g || 22}g`} color={MOM_THEME.amberDark} bg="#FFF5EB" />
            <Nutrient label="Tinh bột" value={`${totals.carbs_g || 85}g`} color={MOM_THEME.sageDark} bg="#E8F2EC" />
          </View>
        </View>

        {/* ── Section: Thực đơn theo cữ ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thực đơn các cữ hôm nay</Text>
          <Text style={styles.sectionSub}>Gợi ý chuẩn định lượng theo độ tuổi</Text>
        </View>

        {menuError ? (
          <View style={styles.errorBox}>
            <Info size={15} color={MOM_THEME.amberDark} />
            <Text style={styles.errorText}>{menuError}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={MOM_THEME.roseDark} />
            <Text style={styles.loadingText}>Đang chuẩn bị thực đơn dinh dưỡng...</Text>
          </View>
        ) : (
          MEAL_SLOTS.map((slot) => {
            const meal: MealItem | undefined = dailyMenu?.meals?.[
              slot.key as keyof NonNullable<DailyMenuDto['meals']>
            ];
            return (
              <View key={slot.key} style={[styles.mealCard, SHADOWS.sm]}>
                <View style={styles.mealEmojiWrap}>
                  <Text style={{ fontSize: 20 }}>{slot.icon}</Text>
                </View>
                <View style={styles.mealCopy}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealSlot}>{slot.label}</Text>
                    <Text style={styles.mealTime}>{slot.time}</Text>
                  </View>
                  <Text style={styles.mealName}>
                    {meal?.name_vi || meal?.name_en || 'Cháo bí đỏ thịt nạc xay mịn / sữa mẹ ấm'}
                  </Text>
                  <View style={styles.mealMetaRow}>
                    <Text style={styles.mealMetaKcal}>{Math.round(meal?.total_calories || 120)} kcal</Text>
                    <Text style={styles.mealMetaDot}>·</Text>
                    <Text style={styles.mealMetaSub}>Dễ tiêu hóa, thơm ngon</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function getNutritionTip(ageMonths: number) {
  if (ageMonths < 6) {
    return {
      title: 'Sữa mẹ là nguồn dinh dưỡng vàng',
      body: 'Bé dưới 6 tháng nên bú mẹ hoàn toàn hoặc sữa công thức phù hợp. Chưa cần ăn dặm nếu bác sĩ không chỉ định.',
    };
  }
  if (ageMonths <= 8) {
    return {
      title: 'Giai đoạn bắt đầu ăn dặm',
      body: 'Ưu tiên bột mịn, cháo rây tỉ lệ 1:10, rau củ ngọt thanh và đạm dễ tiêu. Mỗi món mới mẹ cho thử 2-3 ngày nhé.',
    };
  }
  if (ageMonths <= 11) {
    return {
      title: 'Tăng dần độ thô cho bé',
      body: 'Mẹ có thể nấu cháo hạt vỡ, rau củ hấp mềm thái nhỏ, đậu hũ, cá hồi và tập cho bé bốc thức ăn an toàn.',
    };
  }
  return {
    title: 'Đa dạng 4 nhóm chất',
    body: 'Bé có thể ăn cơm nát hoặc cùng bữa với gia đình. Mẹ nêm nhạt, ít muối đường và giữ không khí ăn vui vẻ.',
  };
}

function Nutrient({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <View style={[styles.nutrient, { backgroundColor: bg }]}>
      <Text style={[styles.nutrientValue, { color }]}>{value}</Text>
      <Text style={styles.nutrientLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: MOM_THEME.roseDark,
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
    backgroundColor: MOM_THEME.roseDark,
    borderColor: MOM_THEME.roseDark,
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
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  errorText: {
    flex: 1,
    color: MOM_THEME.amberDark,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
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
    color: MOM_THEME.roseDark,
    fontSize: 11,
    fontWeight: '700',
  },
  mealName: {
    color: MOM_THEME.charcoal,
    fontSize: 14,
    fontWeight: '700',
  },
  mealMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  mealMetaKcal: {
    color: MOM_THEME.roseDark,
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
});

