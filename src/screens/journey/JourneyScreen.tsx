import React, { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Baby,
  CalendarHeart,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Heart,
  Pill,
  RefreshCw,
  Sparkles,
  Sprout,
  UserRoundPen,
} from 'lucide-react-native';
import profileService, { getStageIndex, MomProfileDto } from '../../services/profileService';
import featureService, { PregnancyWeekInfo } from '../../services/featureService';
import { RootStackParamList } from '../../navigation/types';
import { formatDate, fromUtcDateIso } from '../../utils/date';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';

const stages = [
  { key: 'fertility', title: 'Chuẩn bị', subtitle: 'Thụ thai & dinh dưỡng', icon: Sprout, color: MOM_THEME.sageDark, bg: MOM_THEME.sageLight },
  { key: 'pregnancy', title: 'Thai kỳ', subtitle: '40 tuần hạnh phúc', icon: Heart, color: MOM_THEME.roseDark, bg: MOM_THEME.pinkLight },
  { key: 'postpartum', title: 'Sau sinh', subtitle: 'Phục hồi & chăm bé', icon: Baby, color: MOM_THEME.amberDark, bg: MOM_THEME.amberLight },
];

const STAGE_INSIGHT = [
  'Mẹ nên bổ sung acid folic 400 mcg mỗi ngày ít nhất 1 tháng trước khi mang thai, ngủ đủ giấc và ghi lại chu kỳ để biết ngày dễ thụ thai.',
  '',
  'Những tuần đầu sau sinh, mẹ ưu tiên nghỉ ngơi, ăn đủ chất và uống nhiều nước. Đừng ngại nhờ người thân hỗ trợ chăm bé để mẹ phục hồi.',
];

const trimesterOf = (week: number) => (week <= 13 ? 1 : week <= 27 ? 2 : 3);

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function JourneyScreen() {
  const navigation = useNavigation<Nav>();
  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [weekInfo, setWeekInfo] = useState<PregnancyWeekInfo | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const loadWeekInsight = useCallback(async () => {
    setLoadingInsight(true);
    try {
      setWeekInfo(await featureService.getPregnancyThisWeek());
    } catch {
      setWeekInfo(null);
    } finally {
      setLoadingInsight(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const res = await profileService.getProfile();
      const p = (res?.isSuccess || res?.success) && res.data ? res.data : null;
      setProfile(p);
      if (p && getStageIndex(p.stage) === 1) loadWeekInsight();
      else setWeekInfo(null);
    } catch {
      setProfile(null);
    }
  }, [loadWeekInsight]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const currentIndex = getStageIndex(profile?.stage);
  const currentStageInfo = stages[currentIndex];
  const week = weekInfo?.week ?? profile?.pregnancyWeek ?? null;
  const dueDate = fromUtcDateIso(profile?.deliveryDate);

  const insight =
    currentIndex === 1
      ? weekInfo
        ? [weekInfo.development, weekInfo.momTips].filter(Boolean).join('\n\n')
        : 'Mẹ cập nhật ngày kinh cuối trong hồ sơ để Mom Ơi gợi ý đúng theo tuần thai nhé.'
      : STAGE_INSIGHT[currentIndex];

  const badges: string[] =
    currentIndex === 1
      ? [
          week ? `🌱 Tam cá nguyệt ${trimesterOf(week)}` : '',
          dueDate ? `📅 Dự sinh ${formatDate(dueDate)}` : '',
        ].filter(Boolean)
      : currentIndex === 2 && dueDate
        ? [`👶 Bé sinh ngày ${formatDate(dueDate)}`]
        : [];

  const actions =
    currentIndex === 1
      ? [
          { icon: <Heart size={20} color={MOM_THEME.roseDark} />, bg: MOM_THEME.pinkLight, title: 'Theo dõi thai kỳ', body: 'Xem bé phát triển thế nào tuần này và ghi cân nặng của mẹ.', go: () => navigation.navigate('Pregnancy') },
          { icon: <ClipboardList size={20} color={MOM_THEME.sageDark} />, bg: MOM_THEME.sageLight, title: 'Ghi nhật ký sức khỏe', body: 'Giấc ngủ, bữa ăn, huyết áp và triệu chứng trong ngày.', go: () => navigation.navigate('DailyMonitoring') },
          { icon: <Pill size={20} color="#8E6BB8" />, bg: '#F3EEF8', title: 'Nhắc uống vitamin & sắt', body: 'Duy trì cữ uống đều đặn mỗi ngày để con hấp thụ trọn vẹn.', go: () => navigation.navigate('Medications') },
        ]
      : currentIndex === 2
        ? [
            { icon: <Heart size={20} color={MOM_THEME.roseDark} />, bg: MOM_THEME.pinkLight, title: 'Phục hồi sau sinh', body: 'Kế hoạch vận động theo ngày và khảo sát tâm lý EPDS.', go: () => navigation.navigate('Postpartum') },
            { icon: <Baby size={20} color={MOM_THEME.sageDark} />, bg: MOM_THEME.sageLight, title: 'Hồ sơ & thực đơn của bé', body: 'Cập nhật cân nặng, chiều cao và xem thực đơn theo tuổi.', go: () => navigation.navigate('MainTabs', { screen: 'Nutrition' }) },
            { icon: <ClipboardList size={20} color="#8E6BB8" />, bg: '#F3EEF8', title: 'Ghi nhật ký sức khỏe', body: 'Giấc ngủ, bữa ăn và tâm trạng của mẹ mỗi ngày.', go: () => navigation.navigate('DailyMonitoring') },
          ]
        : [
            { icon: <CalendarHeart size={20} color={MOM_THEME.roseDark} />, bg: MOM_THEME.pinkLight, title: 'Chu kỳ & rụng trứng', body: 'Ghi kỳ kinh để biết những ngày dễ thụ thai.', go: () => navigation.navigate('Fertility') },
            { icon: <Pill size={20} color={MOM_THEME.sageDark} />, bg: MOM_THEME.sageLight, title: 'Nhắc uống acid folic', body: 'Bổ sung acid folic đều đặn trước khi mang thai.', go: () => navigation.navigate('Medications') },
            { icon: <ClipboardList size={20} color="#8E6BB8" />, bg: '#F3EEF8', title: 'Ghi nhật ký sức khỏe', body: 'Giấc ngủ, bữa ăn và tâm trạng mỗi ngày.', go: () => navigation.navigate('DailyMonitoring') },
          ];

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
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="Cập nhật giai đoạn"
            activeOpacity={0.8}
          >
            <UserRoundPen size={20} color={MOM_THEME.roseDark} />
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
                ? week
                  ? `Tuần thai thứ ${week}`
                  : 'Mẹ đang mang thai'
                : currentIndex === 2
                  ? 'Phục hồi sau sinh & nuôi con'
                  : 'Chuẩn bị đón con yêu'}
            </Text>

            <Text style={styles.heroBody}>
              {currentIndex === 1
                ? weekInfo?.babySize
                  ? `Bé đang ${weekInfo.babySize}.`
                  : 'Theo dõi sự phát triển của bé qua từng tuần.'
                : currentIndex === 2
                  ? 'Giai đoạn thiêng liêng cần sự nghỉ ngơi, dinh dưỡng ấm nóng và thấu hiểu tâm lý mẹ.'
                  : 'Theo dõi ngày rụng trứng, giữ tinh thần thư thái và bổ sung acid folic đều đặn.'}
            </Text>

            {badges.length ? (
              <View style={styles.heroBadgeRow}>
                {badges.map((badge) => (
                  <View key={badge} style={styles.miniBadge}>
                    <Text style={styles.miniBadgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            ) : null}
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

        {/* ── Gợi ý chăm sóc (theo tuần thai nếu đang mang thai) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {currentIndex === 1 ? 'Gợi ý tuần thai này' : 'Gợi ý cho mẹ'}
          </Text>
          {currentIndex === 1 ? (
            <TouchableOpacity
              style={styles.refreshLink}
              onPress={loadWeekInsight}
              disabled={loadingInsight}
            >
              <RefreshCw size={13} color={MOM_THEME.roseDark} />
              <Text style={styles.refreshLinkText}>Làm mới</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={[styles.insightCard, SHADOWS.sm]}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIconWrap}>
              <Sparkles size={18} color={MOM_THEME.amberDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Lời nhắn gửi từ Mom Ơi</Text>
              <Text style={styles.insightWeekText}>
                {currentIndex === 1 && week ? `Theo tuần thai thứ ${week}` : `Giai đoạn ${currentStageInfo.title.toLowerCase()}`}
              </Text>
            </View>
          </View>
          <Text style={styles.insightBodyText}>{insight}</Text>
        </View>

        {/* ── Việc nên làm tiếp theo ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Việc mẹ nên làm tiếp theo</Text>
        </View>

        {actions.map((action) => (
          <ActionCard
            key={action.title}
            icon={action.icon}
            iconBg={action.bg}
            title={action.title}
            body={action.body}
            onPress={action.go}
          />
        ))}
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

