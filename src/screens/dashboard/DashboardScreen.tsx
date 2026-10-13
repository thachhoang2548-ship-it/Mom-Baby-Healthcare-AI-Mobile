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

const { width: SCREEN_W } = Dimensions.get('window');

const STAGE_SHORTCUT = {
  0: { title: 'Chu kỳ & rụng trứng', sub: 'Dự đoán ngày dễ thụ thai', route: 'Fertility' },
  1: { title: 'Theo dõi thai kỳ', sub: 'Tuần thai & cân nặng mẹ', route: 'Pregnancy' },
  2: { title: 'Phục hồi sau sinh', sub: 'Vận động & khảo sát EPDS', route: 'Postpartum' },
} as const;

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthStore();
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
      'Đăng xuất',
      'Mẹ có chắc muốn đăng xuất khỏi Mom Ơi không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
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
      Alert.alert('Tuyệt vời!', 'Mẹ đã uống rất nhiều nước hôm nay rồi.');
      return;
    }
    const next = waterCups + 1;
    setWaterCups(next);
    try {
      await featureService.saveDailyMonitoring({ waterLiters: next * LITERS_PER_CUP });
    } catch (err) {
      setWaterCups(next - 1);
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
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
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
    }
  };

  const stage = getStageIndex(profile?.stage);
  const isPregnant = stage === 1;
  const isPostpartum = stage === 2;
  const week = weekInfo?.week ?? profile?.pregnancyWeek ?? null;
  const needsSetup =
    !!profile && !profile.lastPeriodDate && !profile.deliveryDate && !profile.height && !profile.weight;
  const mood = MOOD_OPTIONS.find((m) => m.score === moodScore);
  const shortcut = STAGE_SHORTCUT[stage];

  const stageTitle = isPregnant
    ? 'Thai kỳ hạnh phúc'
    : isPostpartum
      ? 'Chăm sóc hậu sản'
      : 'Chuẩn bị làm mẹ';

  const stageValue = isPregnant
    ? week
      ? `Tuần thứ ${week}`
      : 'Cập nhật tuần thai'
    : isPostpartum
      ? 'Phục hồi & chăm bé'
      : 'Theo dõi chu kỳ';

  const stageNote = isPregnant
    ? weekInfo?.babySize
      ? `Bé đang ${weekInfo.babySize}. ${weekInfo.development || ''}`
      : 'Mẹ nhập ngày kinh cuối trong hồ sơ để Mom Ơi tính tuần thai nhé.'
    : isPostpartum
      ? 'Mẹ nhớ dành thời gian nghỉ ngơi, uống canh ấm và ôm ấp bé yêu nhé.'
      : 'Thời điểm vàng để bổ sung acid folic và giữ tinh thần luôn thư thái.';

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
              <Text style={styles.greeting}>Xin chào mẹ,</Text>
              <Text style={styles.userName}>{user?.fullName || 'Mẹ yêu'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel="Thông báo"
              activeOpacity={0.8}
            >
              <Bell size={19} color={MOM_THEME.charcoalMid} />
              {pendingAlerts > 0 ? <View style={styles.notifyDot} /> : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.logoutBtn]}
              onPress={handleLogout}
              accessibilityLabel="Đăng xuất"
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
              <Text style={styles.setupTitle}>Hoàn thiện hồ sơ của mẹ</Text>
              <Text style={styles.setupBody}>
                Chọn giai đoạn (chuẩn bị / mang thai / sau sinh) để Mom Ơi cá nhân hóa lộ trình.
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
              <Text style={styles.heroFooterText}>Xem lộ trình của mẹ</Text>
              <View style={styles.heroFooterArrow}>
                <ChevronRight size={14} color={MOM_THEME.roseDark} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Section: Ưu tiên hôm nay ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chăm sóc hôm nay</Text>
          <Text style={styles.sectionSubtitle}>Mẹ nhớ lắng nghe cơ thể mình nhé</Text>
        </View>

        <View style={styles.priorityRow}>
          {/* Water card */}
          <View style={[styles.priorityCard, { backgroundColor: '#F0F6FB' }]}>
            <View style={[styles.priorityIconCircle, { backgroundColor: '#DCEBFA' }]}>
              <Droplet size={18} color="#4A88C7" />
            </View>
            <Text style={styles.priorityVal}>
              {waterCups}/{DAILY_CUP_GOAL} ly
            </Text>
            <Text style={styles.priorityLbl}>Uống nước</Text>
            <TouchableOpacity style={styles.quickAddWater} onPress={addWater}>
              <Plus size={13} color="#4A88C7" />
              <Text style={styles.quickAddWaterText}>+1 ly</Text>
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
            <Text style={styles.priorityVal}>{sleepHours !== null ? `${sleepHours} giờ` : '—'}</Text>
            <Text style={styles.priorityLbl}>Giấc ngủ</Text>
            <View style={styles.priorityStatusPill}>
              <Text style={styles.priorityStatusText}>{sleepHours !== null ? 'Đã ghi' : 'Ghi nhận'}</Text>
            </View>
          </TouchableOpacity>

          {/* Mood card */}
          <View style={[styles.priorityCard, { backgroundColor: '#FCF2F4' }]}>
            <View style={[styles.priorityIconCircle, { backgroundColor: '#F9DCE3' }]}>
              <HeartPulse size={18} color={MOM_THEME.roseDark} />
            </View>
            <Text style={styles.priorityVal}>{mood ? mood.emoji : '—'}</Text>
            <Text style={styles.priorityLbl}>Tâm trạng</Text>
            <View style={[styles.priorityStatusPill, { backgroundColor: '#F9DCE3' }]}>
              <Text style={[styles.priorityStatusText, { color: MOM_THEME.roseDark }]}>
                {mood ? mood.label : 'Chưa chọn'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Quick Tools Grid ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tiện ích cùng mẹ</Text>
          <Text style={styles.sectionSubtitle}>Trợ lý sức khỏe thông minh</Text>
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
            <Text style={styles.gridCardTitle}>Bác sĩ AI</Text>
            <Text style={styles.gridCardSub}>Hỏi an tâm mọi biểu hiện lạ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, SHADOWS.sm]}
            onPress={() => goTab('Nutrition')}
            activeOpacity={0.88}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: '#E8F2EC' }]}>
              <Baby size={22} color={MOM_THEME.sageDark} />
            </View>
            <Text style={styles.gridCardTitle}>Bé yêu</Text>
            <Text style={styles.gridCardSub}>Hồ sơ bé & thực đơn ăn dặm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, SHADOWS.sm]}
            onPress={() => navigation.navigate('Medications')}
            activeOpacity={0.88}
          >
            <View style={[styles.gridIconWrap, { backgroundColor: '#FFF4EB' }]}>
              <Pill size={22} color={MOM_THEME.amberDark} />
            </View>
            <Text style={styles.gridCardTitle}>Lịch uống thuốc</Text>
            <Text style={styles.gridCardSub}>Vitamin, sắt, canxi mỗi ngày</Text>
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
              <Text style={styles.checkInTitle}>Ghi nhận trong ngày</Text>
              <Text style={styles.checkInSub}>Tín hiệu nhỏ giúp Mom Ơi hiểu mẹ hơn mỗi ngày</Text>
            </View>
            <View style={styles.checkInHeart}>
              <Heart size={18} color={MOM_THEME.roseDark} fill={MOM_THEME.roseDark} />
            </View>
          </View>

          {/* Water progress */}
          <View style={styles.waterHeader}>
            <Text style={styles.waterLabel}>
              Mục tiêu nước: {waterCups}/{DAILY_CUP_GOAL} ly
            </Text>
            <TouchableOpacity style={styles.waterAddBtn} onPress={addWater}>
              <Plus size={14} color={MOM_THEME.white} />
              <Text style={styles.waterAddBtnText}>Thêm ly</Text>
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
          <Text style={styles.moodSectionTitle}>Mẹ đang cảm thấy thế nào?</Text>
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
                    {item.label}
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
            <Text style={styles.fullLogText}>Ghi nhật ký đầy đủ (giấc ngủ, bữa ăn, huyết áp...)</Text>
            <ChevronRight size={15} color={MOM_THEME.roseDark} />
          </TouchableOpacity>
        </View>

        {/* ── Compassionate AI Note ── */}
        <View style={styles.warmNoteCard}>
          <View style={styles.warmNoteIcon}>
            <Sparkles size={20} color={MOM_THEME.amberDark} />
          </View>
          <View style={styles.warmNoteContent}>
            <Text style={styles.warmNoteTitle}>Lời nhắn gửi mẹ yêu 💛</Text>
            <Text style={styles.warmNoteBody}>
              Hôm nay hãy dành cho bản thân ít phút thở sâu và nghe một bản nhạc êm dịu nhé. Nếu thấy bất kỳ cơn đau bất thường, ra máu hay thai máy giảm, mẹ hãy liên hệ bác sĩ ngay.
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

