import React, { useCallback, useState } from 'react';
import {
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
import { MEDICAL_FEATURES_ENABLED } from '../../constants/features';
import { useT } from '../../i18n';
import { createThemedStyles, useAccent } from '../../theme/accent';

const stages = [
  { key: 'fertility', icon: Sprout, color: MOM_THEME.sageDark, bg: MOM_THEME.sageLight },
  { key: 'pregnancy', icon: Heart, color: MOM_THEME.roseDark, bg: MOM_THEME.pinkLight },
  { key: 'postpartum', icon: Baby, color: MOM_THEME.amberDark, bg: MOM_THEME.amberLight },
];

const trimesterOf = (week: number) => (week <= 13 ? 1 : week <= 27 ? 2 : 3);

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function JourneyScreen() {
  const a = useAccent();
  const styles = useStyles();
  const navigation = useNavigation<Nav>();
  const t = useT();

  const stageTitles = [t('Chuẩn bị', 'Trying'), t('Thai kỳ', 'Pregnancy'), t('Sau sinh', 'After birth')];
  const stageSubtitles = [
    t('Thụ thai & dinh dưỡng', 'Conception & nutrition'),
    t('40 tuần hạnh phúc', '40 happy weeks'),
    t('Phục hồi & chăm bé', 'Recovery & baby care'),
  ];
  const stageInsight = [
    t(
      'Mẹ nên bổ sung acid folic 400 mcg mỗi ngày ít nhất 1 tháng trước khi mang thai, ngủ đủ giấc và ghi lại chu kỳ để biết ngày dễ thụ thai.',
      'Take 400 mcg of folic acid daily for at least a month before getting pregnant, sleep well and log your cycle to know your fertile days.'
    ),
    '',
    t(
      'Những tuần đầu sau sinh, mẹ ưu tiên nghỉ ngơi, ăn đủ chất và uống nhiều nước. Đừng ngại nhờ người thân hỗ trợ chăm bé để mẹ phục hồi.',
      'In the first weeks after birth, put rest, good food and plenty of water first. Ask family for help with the baby so you can recover.'
    ),
  ];
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
  const currentStageTitle = stageTitles[currentIndex];
  const week = weekInfo?.week ?? profile?.pregnancyWeek ?? null;
  const dueDate = fromUtcDateIso(profile?.deliveryDate);

  // development / momTips do server trả về bằng tiếng Việt.
  const insight =
    currentIndex === 1
      ? weekInfo
        ? [weekInfo.development, weekInfo.momTips].filter(Boolean).join('\n\n')
        : t(
            'Mẹ cập nhật ngày kinh cuối trong hồ sơ để Mom Ơi gợi ý đúng theo tuần thai nhé.',
            'Add your last period date in your profile so Mom Ơi can give tips for your pregnancy week.'
          )
      : stageInsight[currentIndex];

  const badges: string[] =
    currentIndex === 1
      ? [
          week ? t(`🌱 Tam cá nguyệt ${trimesterOf(week)}`, `🌱 Trimester ${trimesterOf(week)}`) : '',
          dueDate ? t(`📅 Dự sinh ${formatDate(dueDate)}`, `📅 Due ${formatDate(dueDate)}`) : '',
        ].filter(Boolean)
      : currentIndex === 2 && dueDate
        ? [t(`👶 Bé sinh ngày ${formatDate(dueDate)}`, `👶 Born ${formatDate(dueDate)}`)]
        : [];

  const dailyLog = (body: string) => ({
    icon: <ClipboardList size={20} color={currentIndex === 1 ? MOM_THEME.sageDark : '#8E6BB8'} />,
    bg: currentIndex === 1 ? MOM_THEME.sageLight : '#F3EEF8',
    title: t('Ghi nhật ký sức khỏe', 'Daily health log'),
    body,
    go: () => navigation.navigate('DailyMonitoring'),
  });

  const actions =
    currentIndex === 1
      ? [
          {
            icon: <Heart size={20} color={a.primary} />,
            bg: a.light,
            title: t('Theo dõi thai kỳ', 'Pregnancy tracker'),
            body: t(
              'Xem bé phát triển thế nào tuần này và ghi cân nặng của mẹ.',
              'See how your baby is growing this week and log your weight.'
            ),
            go: () => navigation.navigate('Pregnancy'),
          },
          dailyLog(t('Giấc ngủ, bữa ăn, huyết áp và triệu chứng trong ngày.', 'Sleep, meals, blood pressure and how you feel today.')),
          {
            icon: <Pill size={20} color="#8E6BB8" />,
            bg: '#F3EEF8',
            title: t('Nhắc uống vitamin & sắt', 'Vitamin & iron reminders'),
            body: t('Duy trì cữ uống đều đặn mỗi ngày để con hấp thụ trọn vẹn.', 'Keep a regular daily routine.'),
            go: () => navigation.navigate('Medications'),
          },
        ]
      : currentIndex === 2
        ? [
            {
              icon: <Heart size={20} color={a.primary} />,
              bg: a.light,
              title: t('Phục hồi sau sinh', 'Postpartum recovery'),
              body: MEDICAL_FEATURES_ENABLED
                ? t('Kế hoạch vận động theo ngày và khảo sát tâm lý EPDS.', 'A day-by-day movement plan and the EPDS check-in.')
                : t('Kế hoạch vận động nhẹ và nghỉ ngơi theo từng ngày.', 'A day-by-day plan for gentle movement and rest.'),
              go: () => navigation.navigate('Postpartum'),
            },
            {
              icon: <Baby size={20} color={MOM_THEME.sageDark} />,
              bg: MOM_THEME.sageLight,
              title: t('Hồ sơ & thực đơn của bé', 'Baby profile & menu'),
              body: t(
                'Cập nhật cân nặng, chiều cao và xem thực đơn theo tuổi.',
                'Update weight and height and see menus for your baby’s age.'
              ),
              go: () => navigation.navigate('MainTabs', { screen: 'Nutrition' }),
            },
            dailyLog(t('Giấc ngủ, bữa ăn và tâm trạng của mẹ mỗi ngày.', 'Your sleep, meals and mood each day.')),
          ]
        : [
            {
              icon: <CalendarHeart size={20} color={a.primary} />,
              bg: a.light,
              title: t('Chu kỳ & rụng trứng', 'Cycle & ovulation'),
              body: t('Ghi kỳ kinh để biết những ngày dễ thụ thai.', 'Log your periods to know your fertile days.'),
              go: () => navigation.navigate('Fertility'),
            },
            {
              icon: <Pill size={20} color={MOM_THEME.sageDark} />,
              bg: MOM_THEME.sageLight,
              title: t('Nhắc uống acid folic', 'Folic acid reminders'),
              body: t('Bổ sung acid folic đều đặn trước khi mang thai.', 'Take folic acid regularly before pregnancy.'),
              go: () => navigation.navigate('Medications'),
            },
            dailyLog(t('Giấc ngủ, bữa ăn và tâm trạng mỗi ngày.', 'Sleep, meals and mood each day.')),
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
              <Text style={styles.eyebrow}>{t('HÀNH TRÌNH LÀM MẸ', 'YOUR MOTHERHOOD JOURNEY')}</Text>
            </View>
            <Text style={styles.title}>{t('Lộ trình của mẹ', 'Your journey')}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel={t('Cập nhật giai đoạn', 'Update your stage')}
            activeOpacity={0.8}
          >
            <UserRoundPen size={20} color={a.primary} />
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
              <Text style={styles.stageTagText}>
                {t('Giai đoạn', 'Stage')}: {currentStageTitle}
              </Text>
            </View>

            <Text style={styles.heroTitle}>
              {currentIndex === 1
                ? week
                  ? t(`Tuần thai thứ ${week}`, `Pregnancy week ${week}`)
                  : t('Mẹ đang mang thai', 'You are pregnant')
                : currentIndex === 2
                  ? t('Phục hồi sau sinh & nuôi con', 'Recovery & raising your baby')
                  : t('Chuẩn bị đón con yêu', 'Getting ready for your baby')}
            </Text>

            <Text style={styles.heroBody}>
              {currentIndex === 1
                ? weekInfo?.babySize
                  ? `Bé đang ${weekInfo.babySize}.`
                  : t('Theo dõi sự phát triển của bé qua từng tuần.', 'Follow your baby’s growth week by week.')
                : currentIndex === 2
                  ? t(
                      'Giai đoạn thiêng liêng cần sự nghỉ ngơi, dinh dưỡng ấm nóng và thấu hiểu tâm lý mẹ.',
                      'A precious time that needs rest, warm nourishing food and care for how you feel.'
                    )
                  : t(
                      'Theo dõi ngày rụng trứng, giữ tinh thần thư thái và bổ sung acid folic đều đặn.',
                      'Track ovulation, stay relaxed and take folic acid regularly.'
                    )}
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
          <Text style={styles.timelineCardTitle}>{t('Các chặng đường thiêng liêng', 'The three stages')}</Text>
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
                        (active || done) && { backgroundColor: a.primary },
                      ]}
                    />
                  ) : null}

                  <View
                    style={[
                      styles.stageDot,
                      done && { backgroundColor: MOM_THEME.sageDark, borderColor: MOM_THEME.sageDark },
                      active && { backgroundColor: a.primary, borderColor: a.primary },
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
                      active && { color: a.primary, fontWeight: '800' },
                      done && { color: MOM_THEME.sageDark },
                    ]}
                  >
                    {stageTitles[index]}
                  </Text>
                  <Text style={styles.stageSubText}>{stageSubtitles[index]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Gợi ý chăm sóc (theo tuần thai nếu đang mang thai) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {currentIndex === 1 ? t('Gợi ý tuần thai này', 'Tips for this week') : t('Gợi ý cho mẹ', 'Tips for you')}
          </Text>
          {currentIndex === 1 ? (
            <TouchableOpacity
              style={styles.refreshLink}
              onPress={loadWeekInsight}
              disabled={loadingInsight}
            >
              <RefreshCw size={13} color={a.primary} />
              <Text style={styles.refreshLinkText}>{t('Làm mới', 'Refresh')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={[styles.insightCard, SHADOWS.sm]}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIconWrap}>
              <Sparkles size={18} color={MOM_THEME.amberDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>{t('Lời nhắn gửi từ Mom Ơi', 'A note from Mom Ơi')}</Text>
              <Text style={styles.insightWeekText}>
                {currentIndex === 1 && week
                  ? t(`Theo tuần thai thứ ${week}`, `For pregnancy week ${week}`)
                  : t(`Giai đoạn ${currentStageTitle.toLowerCase()}`, `Stage: ${currentStageTitle}`)}
              </Text>
            </View>
          </View>
          <Text style={styles.insightBodyText}>{insight}</Text>
        </View>

        {/* ── Việc nên làm tiếp theo ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('Việc mẹ nên làm tiếp theo', 'What to do next')}</Text>
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
  const styles = useStyles();
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
    marginBottom: 20,
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
    backgroundColor: a.light,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  refreshLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: a.primary,
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
}));

