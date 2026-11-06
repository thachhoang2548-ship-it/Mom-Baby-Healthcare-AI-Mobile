import React, { useCallback, useState } from 'react';
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
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Activity,
  Baby,
  Bell,
  Calendar,
  ChevronRight,
  ClipboardList,
  Droplet,
  Heart,
  HeartPulse,
  LogOut,
  Moon,
  Plus,
  Sparkles,
  Pill,
  UserRound,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import profileService, { getStageIndex, MomProfileDto } from '../../services/profileService';
import featureService, { PregnancyWeekInfo } from '../../services/featureService';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  cupsFromLiters,
  DAILY_CUP_GOAL,
  LITERS_PER_CUP,
  MOOD_OPTIONS,
} from '../../utils/monitoring';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';
import { MEDICAL_FEATURES_ENABLED } from '../../constants/features';
import { useT } from '../../i18n';

const { width: SCREEN_W } = Dimensions.get('window');

const STAGE_ROUTE = { 0: 'Fertility', 1: 'Pregnancy', 2: 'Postpartum' } as const;

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthStore();
  const t = useT();
  const [profile, setProfile] = useState<MomProfileDto | null>(null);
  const [weekInfo, setWeekInfo] = useState<PregnancyWeekInfo | null>(null);
  const [waterCups, setWaterCups] = useState(0);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [pendingAlerts, setPendingAlerts] = useState(0);

  const goTab = (screen: 'Journey' | 'Nutrition' | 'SymptomAI') =>
    navigation.navigate('MainTabs', { screen });

  const handleLogout = () => {
    Alert.alert(
      t('Đăng xuất', 'Sign out'),
      t('Mẹ có chắc muốn đăng xuất khỏi Mom Ơi không?', 'Do you want to sign out of Mom Ơi?'),
      [
        { text: t('Hủy', 'Cancel'), style: 'cancel' },
        {
          text: t('Đăng xuất', 'Sign out'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'GuestHome' }],
              })
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const loadAll = useCallback(async () => {
    const [profileRes, todayRes, alertsRes] = await Promise.allSettled([
      profileService.getProfile(),
      featureService.getTodayMonitoring(),
      featureService.getNotifications(),
    ]);

    const p = profileRes.status === 'fulfilled' ? profileRes.value.data ?? null : null;
    setProfile(p);

    if (todayRes.status === 'fulfilled') {
      const log = todayRes.value?.data;
      setWaterCups(cupsFromLiters(log?.waterLiters));
      setMoodScore(log?.moodScore ?? null);
      setSleepHours(log?.sleepHours ?? null);
    }

    if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
      setPendingAlerts(alertsRes.value.filter((a) => a.status !== 'Resolved').length);
    }

    if (p && getStageIndex(p.stage) === 1) {
      featureService
        .getPregnancyThisWeek()
        .then(setWeekInfo)
        .catch(() => setWeekInfo(null));
    } else {
      setWeekInfo(null);
    }
  }, []);

  // Tải lại mỗi khi quay về tab, để thấy ngay thay đổi từ hồ sơ / nhật ký.
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const addWater = async () => {
    if (waterCups >= 20) {
      Alert.alert(t('Tuyệt vời!', 'Great job!'), t('Mẹ đã uống rất nhiều nước hôm nay rồi.', 'You have had plenty of water today.'));
      return;
    }
    const next = waterCups + 1;
    setWaterCups(next);
    try {
      await featureService.saveDailyMonitoring({ waterLiters: next * LITERS_PER_CUP });
    } catch (err) {
      setWaterCups(next - 1);
      Alert.alert(t('Chưa lưu được', 'Not saved'), getApiErrorMessage(err));
    }
  };

  const chooseMood = async (score: number) => {
    const previous = moodScore;
    setMoodScore(score);
    try {
      await featureService.saveDailyMonitoring({
        moodScore: score,
        moodNote: MOOD_OPTIONS.find((m) => m.score === score)?.label,
      });
    } catch (err) {
      setMoodScore(previous);
      Alert.alert(t('Chưa lưu được', 'Not saved'), getApiErrorMessage(err));
    }
  };

  const stage = getStageIndex(profile?.stage);
  const isPregnant = stage === 1;
  const isPostpartum = stage === 2;
  const week = weekInfo?.week ?? profile?.pregnancyWeek ?? null;
  const needsSetup =
    !!profile && !profile.lastPeriodDate && !profile.deliveryDate && !profile.height && !profile.weight;
  const mood = MOOD_OPTIONS.find((m) => m.score === moodScore);
  const moodLabel = (m: (typeof MOOD_OPTIONS)[number]) => t(m.label, m.labelEn);
  const shortcut = {
    route: STAGE_ROUTE[stage],
    title: [
      t('Chu kỳ & rụng trứng', 'Cycle & ovulation'),
      t('Theo dõi thai kỳ', 'Pregnancy tracker'),
      t('Phục hồi sau sinh', 'Postpartum recovery'),
    ][stage],
    sub: [
      t('Dự đoán ngày dễ thụ thai', 'Predict your fertile days'),
      t('Tuần thai & cân nặng mẹ', 'Pregnancy week & your weight'),
      MEDICAL_FEATURES_ENABLED
        ? t('Vận động & khảo sát EPDS', 'Exercise & EPDS check-in')
        : t('Vận động nhẹ & nghỉ ngơi', 'Gentle movement & rest'),
    ][stage],
  };

  const stageTitle = isPregnant
    ? t('Thai kỳ hạnh phúc', 'Happy pregnancy')
    : isPostpartum
      ? t('Chăm sóc hậu sản', 'Postpartum care')
      : t('Chuẩn bị làm mẹ', 'Getting ready');

  const stageValue = isPregnant
    ? week
      ? t(`Tuần thứ ${week}`, `Week ${week}`)
      : t('Cập nhật tuần thai', 'Add your pregnancy week')
    : isPostpartum
      ? t('Phục hồi & chăm bé', 'Recovery & baby care')
      : t('Theo dõi chu kỳ', 'Track your cycle');

  // babySize / development do server trả về bằng tiếng Việt.
  const stageNote = isPregnant
    ? weekInfo?.babySize
      ? `Bé đang ${weekInfo.babySize}. ${weekInfo.development || ''}`
      : t(
          'Mẹ nhập ngày kinh cuối trong hồ sơ để Mom Ơi tính tuần thai nhé.',
          'Add your last period date in your profile so Mom Ơi can work out your pregnancy week.'
        )
    : isPostpartum
      ? t(
          'Mẹ nhớ dành thời gian nghỉ ngơi, uống canh ấm và ôm ấp bé yêu nhé.',
          'Take time to rest, have warm soups and enjoy cuddles with your baby.'
        )
      : t(
          'Thời điểm vàng để bổ sung acid folic và giữ tinh thần luôn thư thái.',
          'A great time to take folic acid and keep your mind at ease.'
        );

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
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🌸</Text>
            </View>
            <View>
              <Text style={styles.greeting}>{t('Xin chào mẹ,', 'Hello,')}</Text>
              <Text style={styles.userName}>{user?.fullName || t('Mẹ yêu', 'Mom')}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel={t('Thông báo', 'Notifications')}
              activeOpacity={0.8}
            >
              <Bell size={19} color={MOM_THEME.charcoalMid} />
              {pendingAlerts > 0 ? <View style={styles.notifyDot} /> : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.logoutBtn]}
              onPress={handleLogout}
              accessibilityLabel={t('Đăng xuất', 'Sign out')}
              activeOpacity={0.8}
            >
              <LogOut size={17} color={MOM_THEME.roseDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Gợi ý hoàn thiện hồ sơ cho người dùng mới ── */}
        {needsSetup ? (
          <TouchableOpacity
            style={[styles.setupCard, SHADOWS.sm]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.88}
          >
            <View style={styles.setupIcon}>
              <UserRound size={20} color={MOM_THEME.roseDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.setupTitle}>{t('Hoàn thiện hồ sơ của mẹ', 'Complete your profile')}</Text>
              <Text style={styles.setupBody}>
                {t(
                  'Chọn giai đoạn (chuẩn bị / mang thai / sau sinh) để Mom Ơi cá nhân hóa lộ trình.',
                  'Pick your stage (trying / pregnant / after birth) so Mom Ơi can personalize your journey.'
                )}
              </Text>
            </View>
            <ChevronRight size={18} color={MOM_THEME.roseDark} />
          </TouchableOpacity>
        ) : null}

        {/* ── Hero Milestone Card with Real Visual ── */}
        <TouchableOpacity
          style={[styles.heroCard, SHADOWS.card]}
          activeOpacity={0.93}
          onPress={() => goTab('Journey')}
        >
          <Image
            source={require('../../../assets/images/pregnancy.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.heroPill}>
              <Sparkles size={13} color={MOM_THEME.white} />
              <Text style={styles.heroPillText}>{stageTitle}</Text>
            </View>

            <Text style={styles.heroMainTitle}>{stageValue}</Text>
            <Text style={styles.heroDescription} numberOfLines={2}>
              {stageNote}
            </Text>

            <View style={styles.heroFooter}>
              <Text style={styles.heroFooterText}>{t('Xem lộ trình của mẹ', 'See your journey')}</Text>
              <View style={styles.heroFooterArrow}>
                <ChevronRight size={14} color={MOM_THEME.roseDark} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Section: Ưu tiên hôm nay ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('Chăm sóc hôm nay', 'Today’s care')}</Text>
          <Text style={styles.sectionSubtitle}>{t('Mẹ nhớ lắng nghe cơ thể mình nhé', 'Listen to your body')}</Text>
        </View>

        <View style={styles.priorityRow}>
          {/* Water card */}
          <View style={[styles.priorityCard, { backgroundColor: '#F0F6FB' }]}>
            <View style={[styles.priorityIconCircle, { backgroundColor: '#DCEBFA' }]}>
              <Droplet size={18} color="#4A88C7" />
            </View>
            <Text style={styles.priorityVal}>
              {waterCups}/{DAILY_CUP_GOAL} {t('ly', 'cups')}
            </Text>
            <Text style={styles.priorityLbl}>{t('Uống nước', 'Water')}</Text>
            <TouchableOpacity style={styles.quickAddWater} onPress={addWater}>
              <Plus size={13} color="#4A88C7" />
              <Text style={styles.quickAddWaterText}>{t('+1 ly', '+1 cup')}</Text>
            </TouchableOpacity>
          </View>

          {/* Sleep / Rest card */}
          <TouchableOpacity
            style={[styles.priorityCard, { backgroundColor: '#F6F2FB' }]}
            onPress={() => navigation.navigate('DailyMonitoring')}
            activeOpacity={0.85}
          >
            <View style={[styles.priorityIconCircle, { backgroundColor: '#EADFF8' }]}>
              <Moon size={18} color="#8E6BB8" />
            </View>
            <Text style={styles.priorityVal}>
              {sleepHours !== null ? t(`${sleepHours} giờ`, `${sleepHours} h`) : '—'}
            </Text>
            <Text style={styles.priorityLbl}>{t('Giấc ngủ', 'Sleep')}</Text>
            <View style={styles.priorityStatusPill}>
              <Text style={styles.priorityStatusText}>
                {sleepHours !== null ? t('Đã ghi', 'Logged') : t('Ghi nhận', 'Log it')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Mood card */}
          <View style={[styles.priorityCard, { backgroundColor: '#FCF2F4' }]}>
            <View style={[styles.priorityIconCircle, { backgroundColor: '#F9DCE3' }]}>
              <HeartPulse size={18} color={MOM_THEME.roseDark} />
            </View>
            <Text style={styles.priorityVal}>{mood ? mood.emoji : '—'}</Text>
            <Text style={styles.priorityLbl}>{t('Tâm trạng', 'Mood')}</Text>
            <View style={[styles.priorityStatusPill, { backgroundColor: '#F9DCE3' }]}>
              <Text style={[styles.priorityStatusText, { color: MOM_THEME.roseDark }]}>
                {mood ? moodLabel(mood) : t('Chưa chọn', 'Not set')}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Quick Tools Grid ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('Tiện ích cùng mẹ', 'Quick tools')}</Text>
          <Text style={styles.sectionSubtitle}>{t('Lối tắt mẹ hay dùng', 'Shortcuts you use most')}</Text>
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={[styles.gridCard, SHADOWS.sm]}
            onPress={() => goTab('SymptomAI')}
            activeOpacity={0.88}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: '#FDECEF' }]}>
              <Activity size={22} color={MOM_THEME.roseDark} />
            </View>
            <Text style={styles.gridCardTitle}>{t('Hỏi Mom Ơi AI', 'Ask Mom Ơi AI')}</Text>
            <Text style={styles.gridCardSub}>{t('Gợi ý chăm sóc mẹ và bé', 'Care tips for mom and baby')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, SHADOWS.sm]}
            onPress={() => goTab('Nutrition')}
            activeOpacity={0.88}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: '#E8F2EC' }]}>
              <Baby size={22} color={MOM_THEME.sageDark} />
            </View>
            <Text style={styles.gridCardTitle}>{t('Bé yêu', 'Baby')}</Text>
            <Text style={styles.gridCardSub}>{t('Hồ sơ bé & thực đơn ăn dặm', 'Baby profile & weaning menu')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, SHADOWS.sm]}
            onPress={() => navigation.navigate('Medications')}
            activeOpacity={0.88}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: '#FFF4EB' }]}>
              <Pill size={22} color={MOM_THEME.amberDark} />
            </View>
            <Text style={styles.gridCardTitle}>{t('Lịch uống vitamin', 'Vitamin schedule')}</Text>
            <Text style={styles.gridCardSub}>{t('Vitamin, sắt, canxi mỗi ngày', 'Daily vitamins, iron, calcium')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, SHADOWS.sm]}
            onPress={() => navigation.navigate(shortcut.route)}
            activeOpacity={0.88}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: '#F3EEF8' }]}>
              <Calendar size={22} color="#8E6BB8" />
            </View>
            <Text style={styles.gridCardTitle}>{shortcut.title}</Text>
            <Text style={styles.gridCardSub}>{shortcut.sub}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Daily Check-in Card ── */}
        <View style={[styles.checkInCard, SHADOWS.card]}>
          <View style={styles.checkInHeader}>
            <View>
              <Text style={styles.checkInTitle}>{t('Ghi nhận trong ngày', 'Daily check-in')}</Text>
              <Text style={styles.checkInSub}>
                {t('Tín hiệu nhỏ giúp Mom Ơi hiểu mẹ hơn mỗi ngày', 'Small signals help Mom Ơi understand you better')}
              </Text>
            </View>
            <View style={styles.checkInHeart}>
              <Heart size={18} color={MOM_THEME.roseDark} fill={MOM_THEME.roseDark} />
            </View>
          </View>

          {/* Water progress */}
          <View style={styles.waterHeader}>
            <Text style={styles.waterLabel}>
              {t('Mục tiêu nước', 'Water goal')}: {waterCups}/{DAILY_CUP_GOAL} {t('ly', 'cups')}
            </Text>
            <TouchableOpacity style={styles.waterAddBtn} onPress={addWater}>
              <Plus size={14} color={MOM_THEME.white} />
              <Text style={styles.waterAddBtnText}>{t('Thêm ly', 'Add a cup')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.waterTrack}>
            {Array.from({ length: DAILY_CUP_GOAL }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.waterSegment,
                  index < waterCups && styles.waterSegmentActive,
                ]}
              />
            ))}
          </View>

          {/* Mood Selector */}
          <Text style={styles.moodSectionTitle}>{t('Mẹ đang cảm thấy thế nào?', 'How are you feeling?')}</Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((item) => {
              const active = moodScore === item.score;
              return (
                <TouchableOpacity
                  key={item.score}
                  style={[styles.moodChip, active && styles.moodChipActive]}
                  onPress={() => chooseMood(item.score)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moodEmoji}>{item.emoji}</Text>
                  <Text style={[styles.moodText, active && styles.moodTextActive]}>
                    {moodLabel(item)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.fullLogLink}
            onPress={() => navigation.navigate('DailyMonitoring')}
            activeOpacity={0.8}
          >
            <ClipboardList size={15} color={MOM_THEME.roseDark} />
            <Text style={styles.fullLogText}>
              {t('Ghi nhật ký đầy đủ (giấc ngủ, bữa ăn, huyết áp...)', 'Full daily log (sleep, meals, blood pressure...)')}
            </Text>
            <ChevronRight size={15} color={MOM_THEME.roseDark} />
          </TouchableOpacity>
        </View>

        {/* ── Compassionate AI Note ── */}
        <View style={styles.warmNoteCard}>
          <View style={styles.warmNoteIcon}>
            <Sparkles size={20} color={MOM_THEME.amberDark} />
          </View>
          <View style={styles.warmNoteContent}>
            <Text style={styles.warmNoteTitle}>{t('Lời nhắn gửi mẹ yêu 💛', 'A note for you 💛')}</Text>
            <Text style={styles.warmNoteBody}>
              {t(
                'Hôm nay hãy dành cho bản thân ít phút thở sâu và nghe một bản nhạc êm dịu nhé. Nếu thấy bất kỳ cơn đau bất thường, ra máu hay thai máy giảm, mẹ hãy liên hệ bác sĩ ngay.',
                'Take a few minutes today to breathe deeply and listen to calm music. If you notice unusual pain, bleeding or fewer baby movements, contact your doctor right away.'
              )}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: MOM_THEME.pink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MOM_THEME.white,
  },
  avatarText: {
    fontSize: 22,
  },
  greeting: {
    fontSize: 13,
    color: MOM_THEME.muted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: MOM_THEME.charcoal,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MOM_THEME.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    position: 'relative',
  },
  logoutBtn: {
    backgroundColor: MOM_THEME.pinkLight,
    borderColor: MOM_THEME.pink,
  },
  notifyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: MOM_THEME.roseDark,
    position: 'absolute',
    top: 9,
    right: 10,
  },
  heroCard: {
    height: 190,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
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
    backgroundColor: 'rgba(44, 33, 24, 0.42)',
  },
  heroContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  heroPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(201, 122, 149, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADII.pill,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: MOM_THEME.white,
    letterSpacing: 0.2,
  },
  heroMainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MOM_THEME.white,
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroDescription: {
    fontSize: 13,
    color: '#FBF8F5',
    lineHeight: 18,
    marginTop: 2,
    fontWeight: '500',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 8,
  },
  heroFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: MOM_THEME.charcoal,
  },
  heroFooterArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: MOM_THEME.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: MOM_THEME.charcoal,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: MOM_THEME.muted,
    marginTop: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  priorityCard: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  priorityIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  priorityVal: {
    fontSize: 14,
    fontWeight: '800',
    color: MOM_THEME.charcoal,
    textAlign: 'center',
  },
  priorityLbl: {
    fontSize: 11,
    color: MOM_THEME.muted,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 8,
  },
  quickAddWater: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  quickAddWaterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A88C7',
  },
  priorityStatusPill: {
    backgroundColor: '#EADFF8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E6BB8',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: (SCREEN_W - 52) / 2,
    backgroundColor: MOM_THEME.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: MOM_THEME.charcoal,
    marginBottom: 4,
  },
  gridCardSub: {
    fontSize: 11,
    color: MOM_THEME.muted,
    lineHeight: 15,
  },
  checkInCard: {
    backgroundColor: MOM_THEME.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    marginBottom: 20,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: MOM_THEME.charcoal,
  },
  checkInSub: {
    fontSize: 12,
    color: MOM_THEME.muted,
    marginTop: 2,
  },
  checkInHeart: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MOM_THEME.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  waterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: MOM_THEME.charcoal,
  },
  waterAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4A88C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  waterAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MOM_THEME.white,
  },
  waterTrack: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 18,
  },
  waterSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAE6DF',
  },
  waterSegmentActive: {
    backgroundColor: '#4A88C7',
  },
  moodSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: MOM_THEME.charcoal,
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    backgroundColor: MOM_THEME.cream,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  moodChipActive: {
    backgroundColor: MOM_THEME.roseDark,
    borderColor: MOM_THEME.roseDark,
  },
  moodEmoji: {
    fontSize: 13,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    color: MOM_THEME.charcoalMid,
  },
  moodTextActive: {
    color: MOM_THEME.white,
  },
  warmNoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F7E7D0',
    gap: 12,
  },
  warmNoteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE9D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warmNoteContent: {
    flex: 1,
  },
  warmNoteTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: MOM_THEME.amberDark,
    marginBottom: 4,
  },
  warmNoteBody: {
    fontSize: 12,
    color: MOM_THEME.charcoalMid,
    lineHeight: 18,
  },
  setupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: MOM_THEME.pinkLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MOM_THEME.pink,
    padding: 14,
    marginBottom: 16,
  },
  setupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MOM_THEME.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: MOM_THEME.roseDeep,
  },
  setupBody: {
    fontSize: 12,
    lineHeight: 17,
    color: MOM_THEME.charcoalMid,
    marginTop: 2,
  },
  fullLogLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: MOM_THEME.borderSoft,
  },
  fullLogText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: MOM_THEME.roseDark,
  },
});

