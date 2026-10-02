import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
  Info,
  RefreshCw,
  Ruler,
  Utensils,
  Weight,
} from 'lucide-react-native';
import babyService, { BabyProfileDto, DailyMenuDto, MealItem } from '../../services/babyService';
import { COLORS, RADII, SHADOWS } from '../../theme/colors';

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Bữa sáng', time: '07:30' },
  { key: 'lunch', label: 'Bữa trưa', time: '11:30' },
  { key: 'snack', label: 'Bữa xế', time: '15:30' },
  { key: 'dinner', label: 'Bữa tối', time: '18:30' },
  { key: 'supplementary_snack', label: 'Cữ phụ', time: '20:00' },
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
          'Backend chưa tạo được thực đơn. App đang hiển thị gợi ý mẫu.'
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
      'Thực đơn AI',
      ok
        ? 'Đã làm mới thực đơn cho bé.'
        : 'Backend chưa trả về thực đơn hợp lệ. App đang hiển thị gợi ý mẫu.'
    );
  };

  const ageMonths = selectedBaby?.ageMonths || 8;
  const tip = getNutritionTip(ageMonths);
  const totals = dailyMenu?.nutrition_totals || {};
  const goals = dailyMenu?.goals || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>Bé yêu</Text>
          <Text style={styles.title}>Dinh dưỡng & tăng trưởng</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshMenu}
          disabled={!selectedBaby || isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <RefreshCw size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {babies.length ? (
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
              >
                <Baby size={16} color={active ? COLORS.white : COLORS.primary} />
                <Text style={[styles.babyChipText, active && styles.babyChipTextActive]}>
                  {baby.babyName || baby.name || 'Bé yêu'} · {baby.ageMonths || 0} tháng
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Chưa có hồ sơ bé</Text>
          <Text style={styles.emptyText}>Mẹ tạo hồ sơ bé trên web hoặc mục Hồ Sơ Mẹ để nhận thực đơn phù hợp.</Text>
        </View>
      )}

      {selectedBaby ? (
        <View style={[styles.heroCard, SHADOWS.card]}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroLabel}>Hồ sơ hiện tại</Text>
              <Text style={styles.heroTitle}>{selectedBaby.babyName || selectedBaby.name || 'Bé yêu'}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Award size={14} color={COLORS.emerald} />
              <Text style={styles.statusText}>Theo dõi WHO</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <Metric icon={<Weight size={18} color={COLORS.primary} />} label="Cân nặng" value={`${selectedBaby.currentWeightKg || 0} kg`} />
            <Metric icon={<Ruler size={18} color={COLORS.secondary} />} label="Chiều cao" value={`${selectedBaby.currentHeightCm || 0} cm`} />
          </View>
        </View>
      ) : null}

      <View style={[styles.tipCard, SHADOWS.sm]}>
        <View style={styles.tipHeader}>
          <Utensils size={18} color={COLORS.amber} />
          <Text style={styles.tipTitle}>{tip.title}</Text>
        </View>
        <Text style={styles.tipBody}>{tip.body}</Text>
      </View>

      <View style={[styles.macroCard, SHADOWS.card]}>
        <View style={styles.macroTop}>
          <View style={styles.calorieBox}>
            <Flame size={20} color={COLORS.rose} />
            <View>
              <Text style={styles.calorieValue}>{Math.round(totals.calories || 620)} kcal</Text>
              <Text style={styles.calorieLabel}>Mục tiêu: {Math.round(goals.calories || 700)} kcal</Text>
            </View>
          </View>
          <Text style={styles.macroBadge}>Cân đối</Text>
        </View>

        <View style={styles.nutrientRow}>
          <Nutrient label="Đạm" value={`${totals.protein_g || 18}g`} color={COLORS.blue} />
          <Nutrient label="Béo" value={`${totals.fat_g || 22}g`} color={COLORS.amber} />
          <Nutrient label="Tinh bột" value={`${totals.carbs_g || 85}g`} color={COLORS.emerald} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lịch bữa ăn hôm nay</Text>

      {menuError ? (
        <View style={styles.errorBox}>
          <Info size={15} color={COLORS.amber} />
          <Text style={styles.errorText}>{menuError}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang lập thực đơn AI...</Text>
        </View>
      ) : (
        MEAL_SLOTS.map((slot) => {
          const meal: MealItem | undefined = dailyMenu?.meals?.[
            slot.key as keyof NonNullable<DailyMenuDto['meals']>
          ];
          return (
            <View key={slot.key} style={[styles.mealCard, SHADOWS.sm]}>
              <View style={styles.mealIcon}>
                <Utensils size={20} color={COLORS.primary} />
              </View>
              <View style={styles.mealCopy}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealSlot}>{slot.label}</Text>
                  <Text style={styles.mealTime}>{slot.time}</Text>
                </View>
                <Text style={styles.mealName}>
                  {meal?.name_vi || meal?.name_en || 'Cháo dinh dưỡng rau củ / sữa theo cữ'}
                </Text>
                <Text style={styles.mealMeta}>{Math.round(meal?.total_calories || 120)} kcal</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textLight} />
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function getNutritionTip(ageMonths: number) {
  if (ageMonths < 6) {
    return {
      title: 'Sữa mẹ là ưu tiên',
      body: 'Bé dưới 6 tháng nên bú mẹ hoặc sữa công thức phù hợp. Chưa cần ăn dặm nếu bác sĩ không chỉ định.',
    };
  }
  if (ageMonths <= 8) {
    return {
      title: 'Bắt đầu ăn dặm',
      body: 'Ưu tiên bột mịn, cháo loãng, rau củ ngọt và đạm mềm. Mỗi món mới nên theo dõi 2-3 ngày.',
    };
  }
  if (ageMonths <= 11) {
    return {
      title: 'Tăng dần độ thô',
      body: 'Có thể dùng cháo hạt vỡ, rau củ mềm, đậu hũ, cá và thức ăn bốc tay an toàn.',
    };
  }
  return {
    title: 'Cơm nát và bữa gia đình',
    body: 'Đa dạng 4 nhóm chất, giảm muối đường và theo dõi dị ứng khi thêm thực phẩm mới.',
  };
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      {icon}
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Nutrient({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.nutrient}>
      <Text style={[styles.nutrientValue, { color }]}>{value}</Text>
      <Text style={styles.nutrientLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.textDark,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyScroller: {
    marginBottom: 14,
  },
  babyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 40,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    marginRight: 8,
  },
  babyChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  babyChipText: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: '800',
  },
  babyChipTextActive: {
    color: COLORS.white,
  },
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: 16,
    marginBottom: 14,
  },
  emptyTitle: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.hero,
    padding: 18,
    marginBottom: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  heroTitle: {
    color: COLORS.textDark,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    marginTop: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.emeraldLight,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: COLORS.emerald,
    fontSize: 11,
    fontWeight: '800',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    flex: 1,
    borderRadius: RADII.card,
    backgroundColor: COLORS.background,
    padding: 12,
  },
  metricValue: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  tipCard: {
    backgroundColor: COLORS.amberLight,
    borderRadius: RADII.card,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFE6AA',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  tipTitle: {
    color: '#9A5C00',
    fontSize: 14,
    fontWeight: '800',
  },
  tipBody: {
    color: '#855100',
    fontSize: 12,
    lineHeight: 18,
  },
  macroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.hero,
    padding: 18,
    marginBottom: 18,
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
    gap: 9,
  },
  calorieValue: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: '800',
  },
  calorieLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  macroBadge: {
    color: COLORS.emerald,
    backgroundColor: COLORS.emeraldLight,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '800',
  },
  nutrientRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nutrient: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADII.control,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  nutrientLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.amberLight,
    borderRadius: RADII.control,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE6AA',
  },
  errorText: {
    flex: 1,
    color: '#855100',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 28,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '700',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: 14,
    marginBottom: 10,
  },
  mealIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  mealTime: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  mealName: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
  mealMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
});
