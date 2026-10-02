import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Baby,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Heart,
  Sprout,
} from 'lucide-react-native';
import profileService, { MomProfileDto } from '../../services/profileService';
import featureService from '../../services/featureService';
import { COLORS, RADII, SHADOWS } from '../../theme/colors';

const stages = [
  { key: 'fertility', title: 'Chuẩn bị', icon: Sprout, color: COLORS.secondary },
  { key: 'pregnancy', title: 'Thai kỳ', icon: Heart, color: COLORS.primary },
  { key: 'postpartum', title: 'Sau sinh', icon: Baby, color: COLORS.emerald },
];

export default function JourneyScreen() {
  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [insight, setInsight] = useState('Mom Ơi sẵn sàng đồng hành cùng mẹ theo từng giai đoạn.');

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

  const currentIndex = profile?.stage === 2 || profile?.stage === 'Postpartum'
    ? 2
    : profile?.stage === 1 || profile?.stage === 'Pregnant'
      ? 1
      : 0;

  const loadWeekInsight = async () => {
    try {
      const data = await featureService.getPregnancyThisWeek();
      setInsight(
        data?.summary ||
          data?.message ||
          `Tuần ${profile?.pregnancyWeek || 14}: ưu tiên nghỉ ngơi, uống đủ nước và theo dõi dấu hiệu bất thường.`
      );
    } catch (err: any) {
      Alert.alert('Chưa tải được', err?.message || 'Backend chưa có dữ liệu tuần này.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>Lộ trình làm mẹ</Text>
          <Text style={styles.title}>Lộ trình của mẹ</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={loadWeekInsight}>
          <CalendarPlus size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.heroCard, SHADOWS.card]}>
        <Text style={styles.heroLabel}>Giai đoạn hiện tại</Text>
        <Text style={styles.heroTitle}>{stages[currentIndex].title}</Text>
        <Text style={styles.heroBody}>
          {currentIndex === 1
            ? `Tuần ${profile?.pregnancyWeek || 14}. Mốc tiếp theo: khám thai và theo dõi cân nặng.`
            : currentIndex === 2
              ? 'Tập trung phục hồi, tâm trạng sau sinh và nhật ký chăm bé.'
              : 'Theo dõi chu kỳ, ngày rụng trứng và chuẩn bị sức khỏe trước thai kỳ.'}
        </Text>
      </View>

      <View style={styles.timeline}>
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const active = index === currentIndex;
          const done = index < currentIndex;
          return (
            <View key={stage.key} style={styles.stageItem}>
              <View
                style={[
                  styles.stageDot,
                  { backgroundColor: active || done ? stage.color : COLORS.white },
                ]}
              >
                {done ? (
                  <CheckCircle2 size={18} color={COLORS.white} />
                ) : (
                  <Icon size={18} color={active ? COLORS.white : COLORS.textLight} />
                )}
              </View>
              <Text style={[styles.stageText, active && { color: stage.color }]}>{stage.title}</Text>
              {index < stages.length - 1 ? <View style={styles.stageLine} /> : null}
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Việc nên làm tiếp theo</Text>
      <ActionCard
        title="Cập nhật hồ sơ sức khỏe"
        body="Cân nặng, ngày dự sinh và triệu chứng mới sẽ giúp AI gợi ý chính xác hơn."
        color={COLORS.primary}
      />
      <ActionCard
        title="Xem gợi ý chăm sóc"
        body={insight}
        color={COLORS.secondary}
        onPress={loadWeekInsight}
      />
      <ActionCard
        title="Thêm lịch vào lịch chăm sóc"
        body="Đặt mốc khám, lịch uống vitamin hoặc nhắc theo dõi tâm trạng."
        color={COLORS.emerald}
      />
    </ScrollView>
  );
}

function ActionCard({
  title,
  body,
  color,
  onPress,
}: {
  title: string;
  body: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.actionCard, SHADOWS.sm]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.actionMark, { backgroundColor: color }]} />
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionBody}>{body}</Text>
      </View>
      <ChevronRight size={18} color={COLORS.textLight} />
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
  eyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.textDark,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.hero,
    padding: 20,
    marginBottom: 20,
  },
  heroLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroTitle: {
    color: COLORS.textDark,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  heroBody: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  stageItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stageDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 2,
  },
  stageText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  stageLine: {
    position: 'absolute',
    top: 22,
    left: '58%',
    right: '-42%',
    height: 2,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: 14,
    marginBottom: 10,
  },
  actionMark: {
    width: 4,
    height: 54,
    borderRadius: 4,
    marginRight: 12,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
  },
  actionBody: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
});
