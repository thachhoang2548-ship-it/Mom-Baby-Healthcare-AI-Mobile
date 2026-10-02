import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Activity,
  Baby,
  Bell,
  ChevronRight,
  Droplet,
  HeartPulse,
  Moon,
  Plus,
  Sparkles,
  Utensils,
} from 'lucide-react-native';
import { MainTabParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import profileService, { MomProfileDto } from '../../services/profileService';
import { COLORS, RADII, SHADOWS } from '../../theme/colors';

const moods = ['Bình an', 'Vui vẻ', 'Hơi mệt', 'Lo lắng'];

export default function DashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [waterCups, setWaterCups] = useState(4);
  const [mood, setMood] = useState('Bình an');

  const loadProfile = useCallback(async () => {
    try {
      const res = await profileService.getProfile();
      if ((res?.isSuccess || res?.success) && res.data) {
        setProfile(res.data);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const stageTitle =
    profile?.stage === 1 || profile?.stage === 'Pregnant'
      ? 'Thai kỳ'
      : profile?.stage === 2 || profile?.stage === 'Postpartum'
        ? 'Hậu sản'
        : 'Chuẩn bị mang thai';

  const stageValue =
    profile?.stage === 1 || profile?.stage === 'Pregnant'
      ? `Tuần ${profile?.pregnancyWeek || 14}`
      : profile?.stage === 2 || profile?.stage === 'Postpartum'
        ? 'Tập trung phục hồi'
        : 'Theo dõi chu kỳ';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Chào {user?.fullName || 'mẹ'},</Text>
          <Text style={styles.title}>Hôm nay mẹ thế nào?</Text>
        </View>
        <TouchableOpacity style={styles.notifyButton} activeOpacity={0.8}>
          <Bell size={20} color={COLORS.textDark} />
          <View style={styles.notifyDot} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.heroCard, SHADOWS.card]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Journey')}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <Sparkles size={13} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>Lộ trình cá nhân hóa</Text>
          </View>
          <ChevronRight size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.heroLabel}>{stageTitle}</Text>
        <Text style={styles.heroTitle}>{stageValue}</Text>
        <Text style={styles.heroBody}>
          Trọng tâm hôm nay: uống đủ nước, vận động nhẹ và kiểm tra triệu chứng nếu mẹ hoặc bé thấy bất thường.
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Ưu tiên hôm nay</Text>
      <View style={styles.priorityRow}>
        <MetricCard icon={<Droplet size={18} color={COLORS.blue} />} label="Nước" value={`${waterCups}/10`} />
        <MetricCard icon={<Moon size={18} color={COLORS.secondary} />} label="Nghỉ ngơi" value="Mục tiêu 7h" />
        <MetricCard icon={<HeartPulse size={18} color={COLORS.emerald} />} label="Tâm trạng" value={mood} />
      </View>

      <View style={styles.shortcutGrid}>
        <ShortcutCard
          title="Chẩn đoán AI"
          body="Hỏi an toàn"
          icon={<Activity size={22} color={COLORS.rose} />}
          onPress={() => navigation.navigate('SymptomAI')}
        />
        <ShortcutCard
          title="Bé yêu"
          body="Tăng trưởng và dinh dưỡng"
          icon={<Baby size={22} color={COLORS.secondary} />}
          onPress={() => navigation.navigate('Nutrition')}
        />
        <ShortcutCard
          title="Gợi ý bữa ăn"
          body="Lên kế hoạch hôm nay"
          icon={<Utensils size={22} color={COLORS.amber} />}
          onPress={() => navigation.navigate('Nutrition')}
        />
      </View>

      <View style={[styles.checkInCard, SHADOWS.card]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Ghi nhận hôm nay</Text>
            <Text style={styles.cardSub}>Những tín hiệu nhỏ giúp app cá nhân hóa chăm sóc cho mẹ.</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              waterCups < 12
                ? setWaterCups((value) => value + 1)
                : Alert.alert('Tuyệt vời', 'Mẹ đã đạt mục tiêu uống nước hôm nay.')
            }
          >
            <Plus size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.waterTrack}>
          {Array.from({ length: 10 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.waterSegment,
                index < waterCups && { backgroundColor: COLORS.blue },
              ]}
            />
          ))}
        </View>

        <View style={styles.moodRow}>
          {moods.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.moodChip, mood === item && styles.moodChipActive]}
              onPress={() => setMood(item)}
            >
              <Text style={[styles.moodText, mood === item && styles.moodTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightIcon}>
          <Sparkles size={18} color={COLORS.primary} />
        </View>
        <View style={styles.insightCopy}>
          <Text style={styles.insightTitle}>Gợi ý từ AI</Text>
          <Text style={styles.insightBody}>
            Gợi ý AI chỉ có tính tham khảo. Nếu đau nhiều, ra máu, sốt cao hoặc thai máy ít hơn bình thường, mẹ nên
            liên hệ cơ sở y tế ngay.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={[styles.metricCard, SHADOWS.sm]}>
      {icon}
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ShortcutCard({
  title,
  body,
  icon,
  onPress,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.shortcutCard, SHADOWS.sm]} onPress={onPress} activeOpacity={0.86}>
      <View style={styles.shortcutIcon}>{icon}</View>
      <Text style={styles.shortcutTitle}>{title}</Text>
      <Text style={styles.shortcutBody}>{body}</Text>
    </TouchableOpacity>
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
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  greeting: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  title: {
    color: COLORS.textDark,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  notifyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  notifyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.rose,
    position: 'absolute',
    top: 10,
    right: 11,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.hero,
    padding: 20,
    marginBottom: 24,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  heroLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: COLORS.textDark,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  heroBody: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: 12,
    minHeight: 98,
  },
  metricValue: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  shortcutGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: 12,
    minHeight: 116,
  },
  shortcutIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shortcutTitle: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '800',
  },
  shortcutBody: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  checkInCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.hero,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  cardSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterTrack: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
  },
  waterSegment: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.borderLight,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    minHeight: 36,
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moodChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  moodText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  moodTextActive: {
    color: COLORS.white,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADII.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightCopy: {
    flex: 1,
  },
  insightTitle: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  insightBody: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
