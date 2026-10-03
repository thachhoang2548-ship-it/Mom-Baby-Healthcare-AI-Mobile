import React, { useCallback, useEffect, useState } from 'react';
import {
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
  Activity,
  Baby,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Heart,
  Info,
  RefreshCw,
  Sparkles,
  Sprout,
  Stethoscope,
} from 'lucide-react-native';
import profileService, { MomProfileDto } from '../../services/profileService';
import featureService from '../../services/featureService';
import { COLORS, MOM_THEME, RADII, SHADOWS } from '../../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

const stages = [
  { key: 'fertility', title: 'Chuẩn bị', subtitle: 'Thụ thai & dinh dưỡng', icon: Sprout, color: MOM_THEME.sageDark, bg: MOM_THEME.sageLight },
  { key: 'pregnancy', title: 'Thai kỳ', subtitle: '40 tuần hạnh phúc', icon: Heart, color: MOM_THEME.roseDark, bg: MOM_THEME.pinkLight },
  { key: 'postpartum', title: 'Sau sinh', subtitle: 'Phục hồi & chăm bé', icon: Baby, color: MOM_THEME.amberDark, bg: MOM_THEME.amberLight },
];

export default function JourneyScreen() {
  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [insight, setInsight] = useState('Mom Ơi sẵn sàng đồng hành cùng mẹ theo từng giai đoạn thai kỳ.');
  const [loadingInsight, setLoadingInsight] = useState(false);

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
    setLoadingInsight(true);
    try {
      const data = await featureService.getPregnancyThisWeek();
      setInsight(
        data?.summary ||
          data?.message ||
          `Tuần ${profile?.pregnancyWeek || 14}: Mẹ chú ý uống đủ 2 lít nước mỗi ngày, ăn nhiều rau xanh, và dành 20 phút đi dạo nhẹ nhàng nhé.`
      );
    } catch (err: any) {
      setInsight(`Tuần ${profile?.pregnancyWeek || 14}: Chăm sóc cơ thể nhẹ nhàng, bổ sung đầy đủ vitamin và nghỉ ngơi khi thấy mệt mẹ nhé.`);
    } finally {
      setLoadingInsight(false);
    }
  };

  const currentStageInfo = stages[currentIndex];

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
              <Text style={styles.eyebrow}>HÀNH TRÌNH LÀM MẸ</Text>
            </View>
            <Text style={styles.title}>Lộ trình của mẹ</Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={loadWeekInsight}
            activeOpacity={0.8}
          >
            <CalendarPlus size={20} color={MOM_THEME.roseDark} />
          </TouchableOpacity>
        </View>

        {/* ── Hero Milestone Card with Real Visual ── */}
        <View style={[styles.heroCard, SHADOWS.card]}>
          <Image
            source={require('../../../assets/images/hero_mom.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.stageTag}>
              <Sparkles size={13} color={MOM_THEME.white} />
              <Text style={styles.stageTagText}>Giai đoạn: {currentStageInfo.title}</Text>
            </View>

            <Text style={styles.heroTitle}>
              {currentIndex === 1
                ? `Tuần thai thứ ${profile?.pregnancyWeek || 14}`
                : currentIndex === 2
                  ? 'Phục hồi sau sinh & nuôi con'
                  : 'Chuẩn bị đón con yêu'}
            </Text>

            <Text style={styles.heroBody}>
              {currentIndex === 1
                ? 'Em bé đang phát triển các giác quan. Cột mốc sắp tới: Khám thai định kỳ & xét nghiệm sàng lọc.'
                : currentIndex === 2
                  ? 'Giai đoạn thiêng liêng cần sự nghỉ ngơi, dinh dưỡng ấm nóng và thấu hiểu tâm lý mẹ.'
                  : 'Theo dõi ngày rụng trứng, giữ tinh thần thư thái và bổ sung acid folic đều đặn.'}
            </Text>

            <View style={styles.heroBadgeRow}>
              <View style={styles.miniBadge}>
                <Text style={styles.miniBadgeText}>🌱 Tam cá nguyệt 2</Text>
              </View>
              <View style={[styles.miniBadge, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Text style={styles.miniBadgeText}>🌸 Sức khỏe ổn định</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Journey Stepper / Timeline ── */}
        <View style={[styles.timelineCard, SHADOWS.sm]}>
          <Text style={styles.timelineCardTitle}>Các chặng đường thiêng liêng</Text>
          <View style={styles.timeline}>
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const active = index === currentIndex;
              const done = index < currentIndex;
              return (
                <View key={stage.key} style={styles.stageItem}>
                  {index < stages.length - 1 ? (
                    <View
                      style={[
                        styles.stageLine,
                        (active || done) && { backgroundColor: MOM_THEME.roseDark },
                      ]}
                    />
                  ) : null}

                  <View
                    style={[
                      styles.stageDot,
                      done && { backgroundColor: MOM_THEME.sageDark, borderColor: MOM_THEME.sageDark },
                      active && { backgroundColor: MOM_THEME.roseDark, borderColor: MOM_THEME.roseDark },
                      !done && !active && { backgroundColor: MOM_THEME.cream, borderColor: MOM_THEME.border },
                    ]}
                  >
                    {done ? (
                      <CheckCircle2 size={20} color={MOM_THEME.white} />
                    ) : (
                      <Icon size={18} color={active ? MOM_THEME.white : MOM_THEME.mutedLight} />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.stageText,
                      active && { color: MOM_THEME.roseDark, fontWeight: '800' },
                      done && { color: MOM_THEME.sageDark },
                    ]}
                  >
                    {stage.title}
                  </Text>
                  <Text style={styles.stageSubText}>{stage.subtitle}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Gợi ý chăm sóc tuần này (AI Advice) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gợi ý tuần thai này</Text>
          <TouchableOpacity
            style={styles.refreshLink}
            onPress={loadWeekInsight}
            disabled={loadingInsight}
          >
            <RefreshCw size={13} color={MOM_THEME.roseDark} />
            <Text style={styles.refreshLinkText}>Làm mới</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.insightCard, SHADOWS.sm]}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIconWrap}>
              <Sparkles size={18} color={MOM_THEME.amberDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Lời nhắn gửi từ Mom Ơi AI</Text>
              <Text style={styles.insightWeekText}>Cá nhân hóa theo tuần thai của mẹ</Text>
            </View>
          </View>
          <Text style={styles.insightBodyText}>{insight}</Text>
        </View>

        {/* ── Việc nên làm tiếp theo ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Việc mẹ nên làm tiếp theo</Text>
        </View>

        <ActionCard
          icon={<Heart size={20} color={MOM_THEME.roseDark} />}
          iconBg={MOM_THEME.pinkLight}
          title="Cập nhật chỉ số sức khỏe"
          body="Ghi nhận cân nặng, huyết áp và triệu chứng mới để app theo dõi sát sao hơn."
        />

        <ActionCard
          icon={<Stethoscope size={20} color={MOM_THEME.sageDark} />}
          iconBg={MOM_THEME.sageLight}
          title="Đặt mốc khám thai định kỳ"
          body="Khám siêu âm hình thái học & kiểm tra các mốc quan trọng tiếp theo."
        />

        <ActionCard
          icon={<Calendar size={20} color="#8E6BB8" />}
          iconBg="#F3EEF8"
          title="Nhắc uống vitamin & sắt"
          body="Duy trì cữ uống đều đặn mỗi sáng sau khi ăn để con hấp thụ trọn vẹn."
        />
      </ScrollView>
    </View>
  );
}

function ActionCard({
  icon,
  iconBg,
  title,
  body,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, SHADOWS.sm]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionBody}>{body}</Text>
      </View>
      <View style={styles.actionArrow}>
        <ChevronRight size={16} color={MOM_THEME.mutedLight} />
      </View>
    </TouchableOpacity>
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
    marginBottom: 20,
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
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MOM_THEME.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  heroCard: {
    height: 230,
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
    backgroundColor: 'rgba(44, 33, 24, 0.46)',
  },
  heroContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  stageTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(201, 122, 149, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADII.pill,
  },
  stageTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: MOM_THEME.white,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MOM_THEME.white,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroBody: {
    fontSize: 13,
    color: '#FBF8F5',
    lineHeight: 18,
    marginTop: 2,
    fontWeight: '500',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  miniBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: MOM_THEME.charcoal,
  },
  timelineCard: {
    backgroundColor: MOM_THEME.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    marginBottom: 24,
  },
  timelineCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: MOM_THEME.charcoal,
    marginBottom: 18,
    textAlign: 'center',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
    borderWidth: 2,
    zIndex: 2,
    marginBottom: 8,
  },
  stageText: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  stageSubText: {
    color: MOM_THEME.mutedLight,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  stageLine: {
    position: 'absolute',
    top: 22,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: MOM_THEME.border,
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 18,
    fontWeight: '800',
  },
  refreshLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MOM_THEME.pinkLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  refreshLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: MOM_THEME.roseDark,
  },
  insightCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F7E7D0',
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  insightIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFE8D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: MOM_THEME.amberDark,
  },
  insightWeekText: {
    fontSize: 11,
    color: MOM_THEME.muted,
    marginTop: 1,
  },
  insightBodyText: {
    fontSize: 13,
    color: MOM_THEME.charcoalMid,
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MOM_THEME.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    marginBottom: 12,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  actionBody: {
    color: MOM_THEME.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  actionArrow: {
    marginLeft: 8,
  },
});

