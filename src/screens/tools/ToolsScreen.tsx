import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Activity,
  Baby,
  Bell,
  Calendar,
  CalendarHeart,
  ClipboardList,
  Headphones,
  Heart,
  HeartPulse,
  LifeBuoy,
  MessageSquare,
  Pill,
  Sparkles,
  User,
  Utensils,
} from 'lucide-react-native';
import featureService, {
  FeedbackCategory,
  PaymentHistory,
  PaymentTransaction,
} from '../../services/featureService';
import { getTierDisplayName, mapTier, useAuthStore } from '../../stores/authStore';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage } from '../../utils/apiError';
import { LockIcon } from '../../components/ui';
import { formatDate } from '../../utils/date';
import { COLORS, MOM_THEME, RADII, SHADOWS } from '../../theme/colors';

type PanelKey = 'plan' | 'feedback';

const formatResult = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'Chưa có dữ liệu.';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

// Chỉ hiện giao dịch đã có tiền thật. Đơn Pending phần lớn là đơn bỏ dở trên web
// (backend không tự hủy), Failed chỉ gây nhiễu; cả hai vẫn xem được trên web.
const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  Completed: { label: 'Thành công', color: MOM_THEME.sageDark },
  Refunded: { label: 'Đã hoàn tiền', color: MOM_THEME.muted },
};

const formatVnd = (amount: number) =>
  `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;

/** Mốc thời gian thật từ server -> dd/MM/yyyy theo giờ máy. */
const formatTimestamp = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : formatDate(d);
};

const FALLBACK_FEEDBACK: FeedbackCategory[] = [
  { value: 'Bug', label: 'Lỗi chức năng' },
  { value: 'Payment', label: 'Thanh toán / gói' },
  { value: 'Content', label: 'Nội dung chăm sóc' },
  { value: 'Idea', label: 'Ý tưởng mới' },
];

export default function ToolsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tier = useAuthStore((s) => s.tier);
  const isFree = tier === 'Free';
  const setTier = useAuthStore((s) => s.setTier);
  const [active, setActive] = useState<PanelKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [plan, setPlan] = useState<PaymentHistory | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState('');
  const [feedbackCategories, setFeedbackCategories] = useState<FeedbackCategory[]>(FALLBACK_FEEDBACK);
  const [feedbackCategory, setFeedbackCategory] = useState('Bug');

  useEffect(() => {
    featureService
      .getFeedbackOptions()
      .then((res) => {
        if (res?.categories?.length) setFeedbackCategories(res.categories);
      })
      .catch(() => undefined);
  }, []);

  const healthItems = [
    { label: 'Hồ sơ mẹ', icon: User, color: MOM_THEME.roseDark, go: () => navigation.navigate('Profile') },
    { label: 'Nhật ký hằng ngày', icon: ClipboardList, color: MOM_THEME.sageDark, go: () => navigation.navigate('DailyMonitoring') },
    { label: 'Lịch chăm sóc', icon: CalendarHeart, color: MOM_THEME.sageDark, go: () => navigation.navigate('CareCalendar') },
    { label: 'Lịch uống thuốc', icon: Pill, color: '#8E6BB8', go: () => navigation.navigate('Medications') },
    { label: 'Thông báo', icon: Bell, color: MOM_THEME.amberDark, go: () => navigation.navigate('Notifications') },
    { label: 'Lịch sử Trợ lý AI', icon: HeartPulse, color: MOM_THEME.roseDark, go: () => navigation.navigate('SymptomHistory') },
    { label: 'Món ăn AI', icon: Utensils, color: MOM_THEME.amberDark, go: () => navigation.navigate('Recipes') },
  ];

  const stageItems = [
    { label: 'Rụng trứng', icon: Calendar, color: MOM_THEME.roseDark, go: () => navigation.navigate('Fertility') },
    { label: 'Thai kỳ', icon: Heart, color: MOM_THEME.roseDark, go: () => navigation.navigate('Pregnancy') },
    { label: 'Hậu sản', icon: Activity, color: MOM_THEME.sageDark, go: () => navigation.navigate('Postpartum') },
    {
      label: 'Bé yêu',
      icon: Baby,
      color: MOM_THEME.sageDark,
      tierLocked: true,
      go: () => navigation.navigate('MainTabs', { screen: 'Nutrition' }),
    },
  ];

  const panelItems: { key: PanelKey; label: string; icon: typeof User; color: string }[] = [
    { key: 'plan', label: 'Gói của mẹ', icon: Sparkles, color: MOM_THEME.amberDark },
    { key: 'feedback', label: 'Góp ý', icon: MessageSquare, color: '#4A88C7' },
  ];

  // Gói lấy lại từ server mỗi lần mở: mẹ có thể vừa nâng cấp trên web,
  // còn gói trong store chỉ được cập nhật lúc đăng nhập.
  const loadPlan = async () => {
    setPlanLoading(true);
    setPlanError(null);
    try {
      const data = await featureService.getPaymentHistory();
      setPlan(data);
      if (data?.currentTier) await setTier(mapTier(data.currentTier));
    } catch (err) {
      setPlanError(getApiErrorMessage(err, 'Không tải được thông tin gói. Mẹ thử lại sau nhé.'));
    } finally {
      setPlanLoading(false);
    }
  };

  const openPanel = (key: PanelKey) => {
    const opening = active !== key;
    setActive(opening ? key : null);
    setResult(null);
    if (opening && key === 'plan') loadPlan();
  };

  const run = async (task: () => Promise<unknown>, success?: string) => {
    setLoading(true);
    try {
      const data = await task();
      setResult(success ?? formatResult(data));
    } catch (err) {
      const message = getApiErrorMessage(err, 'Không thể hoàn tất tác vụ.');
      setResult(message);
      Alert.alert('Không thành công', message);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = () => {
    if (feedback.trim().length < 10) {
      Alert.alert('Nội dung quá ngắn', 'Mẹ viết thêm một chút (ít nhất 10 ký tự) để đội ngũ hiểu rõ hơn nhé.');
      return;
    }
    run(async () => {
      await featureService.sendFeedback({
        category: feedbackCategory,
        message: feedback.trim(),
        page: 'mobile/menu',
      });
      setFeedback('');
    }, 'Cảm ơn mẹ! Góp ý đã được gửi tới đội ngũ Mom Ơi.');
  };

  const renderPlanPanel = () => {
    const expiresAt = tier !== 'Free' ? formatTimestamp(plan?.tierExpiresAt) : '';
    const transactions = (plan?.transactions ?? []).filter((t) => t.status in PAYMENT_STATUS_LABELS);

    return (
      <Panel title="Gói của mẹ" subtitle="Quyền lợi của gói tự áp dụng khi mẹ đăng nhập Mom Ơi.">
        <View style={styles.currentPlan}>
          <Text style={styles.currentPlanLabel}>Gói hiện tại</Text>
          <Text style={styles.currentPlanName}>{getTierDisplayName(tier)}</Text>
          {expiresAt ? <Text style={styles.currentPlanMeta}>Hiệu lực đến {expiresAt}</Text> : null}
        </View>

        <Text style={styles.sectionLabel}>Lịch sử giao dịch</Text>
        {planLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={MOM_THEME.roseDark} size="small" />
            <Text style={styles.loadingText}>Đang tải thông tin gói...</Text>
          </View>
        ) : planError ? (
          <>
            <Text style={styles.emptyText}>{planError}</Text>
            <SecondaryButton label="Thử lại" onPress={loadPlan} />
          </>
        ) : transactions.length ? (
          transactions.map((t) => <TransactionRow key={t.id} transaction={t} />)
        ) : (
          <Text style={styles.emptyText}>Mẹ chưa có giao dịch nào.</Text>
        )}
      </Panel>
    );
  };

  const renderPanel = () => {
    switch (active) {
      case 'plan':
        return renderPlanPanel();
      case 'feedback':
        return (
          <Panel title="Góp ý" subtitle="Mẹ gặp lỗi hoặc có ý tưởng? Đội ngũ Mom Ơi luôn lắng nghe.">
            <View style={styles.chipRow}>
              {feedbackCategories.map((c) => {
                const selected = feedbackCategory === c.value;
                return (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setFeedbackCategory(c.value)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Mẹ muốn góp ý gì cho Mom Ơi?"
              placeholderTextColor={COLORS.textLight}
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
            <PrimaryButton label="Gửi góp ý" onPress={submitFeedback} />
          </Panel>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={MOM_THEME.cream} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.eyebrowWrap}>
            <Text style={styles.eyebrow}>HỆ SINH THÁI TIỆN ÍCH</Text>
          </View>
          <Text style={styles.title}>Chức năng Mom Ơi</Text>
          <Text style={styles.subtitle}>
            Trọn bộ công cụ theo dõi chu kỳ, sức khỏe thai kỳ và chăm sóc bé yêu 🌸
          </Text>
        </View>

        <Text style={styles.groupTitle}>Sức khỏe của mẹ</Text>
        <View style={styles.menuGrid}>
          {healthItems.map((item) => (
            <MenuTile key={item.label} label={item.label} icon={item.icon} color={item.color} onPress={item.go} />
          ))}
        </View>

        <Text style={styles.groupTitle}>Theo giai đoạn</Text>
        <View style={styles.menuGrid}>
          {stageItems.map((item) => (
            <MenuTile
              key={item.label}
              label={item.label}
              icon={item.icon}
              color={item.color}
              locked={item.tierLocked && isFree}
              onPress={item.go}
            />
          ))}
        </View>

        <Text style={styles.groupTitle}>Tiện ích khác</Text>
        <View style={styles.menuGrid}>
          <MenuTile
            label="Khẩn cấp"
            icon={LifeBuoy}
            color="#D95368"
            onPress={() => navigation.navigate('Emergency')}
          />
          <MenuTile
            label="Thư giãn"
            icon={Headphones}
            color="#8E6BB8"
            onPress={() => navigation.navigate('Relax')}
          />
          {panelItems.map((item) => (
            <MenuTile
              key={item.key}
              label={item.label}
              icon={item.icon}
              color={item.color}
              selected={active === item.key}
              onPress={() => openPanel(item.key)}
            />
          ))}
        </View>

        {renderPanel()}

        {active && (loading || result) ? (
          <View style={[styles.resultCard, SHADOWS.card]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Kết quả</Text>
            </View>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={MOM_THEME.roseDark} size="small" />
                <Text style={styles.loadingText}>Đang xử lý dữ liệu cùng server...</Text>
              </View>
            ) : (
              <Text style={styles.resultText}>{result}</Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function MenuTile({
  label,
  icon: Icon,
  color,
  selected,
  locked,
  onPress,
}: {
  label: string;
  icon: typeof User;
  color: string;
  selected?: boolean;
  locked?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, selected && styles.menuItemActive]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      <View style={[styles.menuIconWrap, selected && { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
        <Icon size={18} color={selected ? MOM_THEME.white : color} />
      </View>
      <Text style={[styles.menuText, selected && styles.menuTextActive]}>{label}</Text>
      {locked ? <LockIcon size={14} color={selected ? MOM_THEME.white : MOM_THEME.mutedLight} /> : null}
    </TouchableOpacity>
  );
}

function Panel({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <View style={[styles.panel, SHADOWS.card]}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelSubtitle}>{subtitle}</Text>
      {children}
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress} activeOpacity={0.86}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}


function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.secondaryButton} onPress={onPress} activeOpacity={0.86}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function TransactionRow({ transaction: t }: { transaction: PaymentTransaction }) {
  const status = PAYMENT_STATUS_LABELS[t.status];
  const date = formatTimestamp(t.paidAt || t.createdAt);
  return (
    <View style={styles.transaction}>
      <View style={styles.transactionTop}>
        <Text style={styles.transactionName}>
          {getTierDisplayName(mapTier(t.tier))} · {t.durationMonths} tháng
        </Text>
        <Text style={[styles.transactionStatus, { color: status.color }]}>{status.label}</Text>
      </View>
      <Text style={styles.transactionMeta}>
        {formatVnd(t.amount)}
        {date ? ` · ${date}` : ''}
      </Text>
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
  header: {
    marginBottom: 18,
  },
  eyebrowWrap: {
    marginBottom: 2,
  },
  eyebrow: {
    color: MOM_THEME.roseDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: MOM_THEME.charcoal,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: MOM_THEME.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  groupTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.cream,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: MOM_THEME.roseDark,
    borderColor: MOM_THEME.roseDark,
  },
  chipText: {
    color: MOM_THEME.charcoalMid,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: MOM_THEME.white,
  },
  menuItem: {
    width: '48.6%',
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: MOM_THEME.white,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  menuItemActive: {
    backgroundColor: MOM_THEME.roseDark,
    borderColor: MOM_THEME.roseDark,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: MOM_THEME.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    color: MOM_THEME.charcoal,
    fontSize: 12,
    fontWeight: '700',
  },
  menuTextActive: {
    color: MOM_THEME.white,
  },
  panel: {
    backgroundColor: MOM_THEME.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  panelTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  panelSubtitle: {
    color: MOM_THEME.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: MOM_THEME.charcoalMid,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.cream,
    paddingHorizontal: 14,
    color: MOM_THEME.charcoal,
    fontSize: 13,
  },
  textArea: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.cream,
    padding: 12,
    color: MOM_THEME.charcoal,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: MOM_THEME.roseDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: MOM_THEME.white,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: MOM_THEME.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: MOM_THEME.roseDark,
    fontSize: 13,
    fontWeight: '700',
  },
  currentPlan: {
    borderRadius: 16,
    backgroundColor: MOM_THEME.cream,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    padding: 14,
    marginBottom: 16,
  },
  currentPlanLabel: {
    color: MOM_THEME.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  currentPlanName: {
    color: MOM_THEME.roseDark,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  currentPlanMeta: {
    color: MOM_THEME.charcoalMid,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionLabel: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: MOM_THEME.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  transaction: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    padding: 12,
    marginBottom: 8,
  },
  transactionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  transactionName: {
    flex: 1,
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '800',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  transactionMeta: {
    color: MOM_THEME.muted,
    fontSize: 12,
    marginTop: 3,
  },
  resultCard: {
    backgroundColor: MOM_THEME.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
  resultBadge: {
    backgroundColor: MOM_THEME.sageLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.pill,
  },
  resultBadgeText: {
    color: MOM_THEME.sageDark,
    fontSize: 10,
    fontWeight: '700',
  },
  resultText: {
    color: MOM_THEME.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: MOM_THEME.muted,
    fontSize: 13,
    fontWeight: '600',
  },
});
