import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Activity,
  Baby,
  Bell,
  Calendar,
  Headphones,
  Heart,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Pill,
  ReceiptText,
  Sparkles,
  User,
  Utensils,
} from 'lucide-react-native';
import featureService, { TIERS_DATA } from '../../services/featureService';
import { getTierDisplayName, useAuthStore } from '../../stores/authStore';
import { COLORS, RADII, SHADOWS } from '../../theme/colors';

type MenuKey =
  | 'dashboard'
  | 'fertility'
  | 'pregnancy'
  | 'postpartum'
  | 'baby'
  | 'upgrade'
  | 'calendar'
  | 'emergency'
  | 'feedback'
  | 'relax'
  | 'subscription'
  | 'profile'
  | 'recipes'
  | 'notifications'
  | 'medication'
  | 'symptoms'
  | 'monitoring';

const today = new Date().toISOString().slice(0, 10);

const formatResult = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'Chưa có dữ liệu.';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

export default function ToolsScreen() {
  const { user, tier } = useAuthStore();
  const [active, setActive] = useState<MenuKey>('dashboard');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('Chọn một chức năng để xem dữ liệu hoặc đồng bộ với backend.');

  const [periodStart, setPeriodStart] = useState(today);
  const [cycleLength, setCycleLength] = useState('28');
  const [ivfStart, setIvfStart] = useState(today);
  const [weightKg, setWeightKg] = useState('');
  const [epdsCsv, setEpdsCsv] = useState('0,0,0,0,0,0,0,0,0,0');
  const [medicineName, setMedicineName] = useState('');
  const [medicineTime, setMedicineTime] = useState('08:00');
  const [waterCups, setWaterCups] = useState('6');
  const [mood, setMood] = useState('Bình an');
  const [feedback, setFeedback] = useState('');
  const [dietType, setDietType] = useState('Thường');
  const [allergies, setAllergies] = useState('Không');
  const [ingredients, setIngredients] = useState('');

  const menuItems = useMemo(
    () => [
      { key: 'dashboard' as const, label: 'Tổng quan', icon: LayoutDashboard, color: COLORS.primary },
      { key: 'fertility' as const, label: 'Rụng trứng', icon: Calendar, color: COLORS.primary },
      { key: 'pregnancy' as const, label: 'Thai kỳ', icon: Heart, color: COLORS.secondary },
      { key: 'postpartum' as const, label: 'Hậu sản', icon: Activity, color: COLORS.primary },
      { key: 'baby' as const, label: 'Bé yêu', icon: Baby, color: COLORS.emerald },
      { key: 'upgrade' as const, label: 'Gói dịch vụ', icon: Sparkles, color: COLORS.amber },
      { key: 'calendar' as const, label: 'Lịch chăm sóc', icon: Calendar, color: COLORS.primary },
      { key: 'emergency' as const, label: 'Khẩn cấp', icon: LifeBuoy, color: COLORS.rose },
      { key: 'feedback' as const, label: 'Hỗ trợ', icon: MessageSquare, color: COLORS.blue },
      { key: 'relax' as const, label: 'Thư giãn', icon: Headphones, color: COLORS.secondary },
      { key: 'subscription' as const, label: 'Lịch sử gói', icon: ReceiptText, color: COLORS.emerald },
      { key: 'profile' as const, label: 'Hồ sơ mẹ', icon: User, color: COLORS.primary },
      { key: 'recipes' as const, label: 'Món ăn', icon: Utensils, color: COLORS.amber },
      { key: 'notifications' as const, label: 'Thông báo', icon: Bell, color: COLORS.amber },
      { key: 'medication' as const, label: 'Lịch uống thuốc', icon: Pill, color: COLORS.secondary },
      { key: 'symptoms' as const, label: 'Lịch sử AI', icon: HeartPulse, color: COLORS.emerald },
      { key: 'monitoring' as const, label: 'Theo dõi ngày', icon: HeartPulse, color: COLORS.emerald },
    ],
    []
  );

  const run = async (task: () => Promise<unknown>, success?: string) => {
    setLoading(true);
    try {
      const data = await task();
      setResult(`${success ? `${success}\n\n` : ''}${formatResult(data)}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể hoàn tất tác vụ.';
      setResult(message);
      Alert.alert('Không thành công', message);
    } finally {
      setLoading(false);
    }
  };

  const submitEpds = () => {
    const answers = epdsCsv
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    if (answers.length !== 10) {
      Alert.alert('EPDS cần 10 câu', 'Nhập đủ 10 điểm, ngăn cách bằng dấu phẩy.');
      return;
    }
    run(() => featureService.submitEpds(answers), 'Đã gửi đánh giá EPDS.');
  };

  const submitMedication = () => {
    if (!medicineName.trim()) {
      Alert.alert('Thiếu tên thuốc', 'Nhập tên thuốc hoặc vitamin.');
      return;
    }
    run(
      () =>
        featureService.addMedication({
          name: medicineName.trim(),
          dosage: '1 viên',
          scheduleTime: medicineTime,
          notes: 'Tạo từ app mobile',
        }),
      'Đã thêm lịch uống thuốc.'
    );
  };

  const submitMonitoring = () => {
    run(
      () =>
        featureService.createDailyMonitoring({
          waterCups: Number(waterCups) || 0,
          mood,
          recordedAt: new Date().toISOString(),
        }),
      'Đã ghi nhận sức khỏe hôm nay.'
    );
  };

  const submitFeedback = () => {
    if (feedback.trim().length < 5) {
      Alert.alert('Thiếu nội dung', 'Nhập phản hồi ngắn cho đội ngũ Mom Ơi.');
      return;
    }
    run(
      () => featureService.sendFeedback({ message: feedback.trim(), rating: 5, source: 'mobile' }),
      'Đã gửi phản hồi.'
    );
  };

  const renderPanel = () => {
    switch (active) {
      case 'dashboard':
        return (
          <Panel title="Tổng quan" subtitle="Tương ứng route /dashboard trên website.">
            <InfoRow label="Tài khoản" value={user?.fullName || user?.email || 'Mẹ yêu'} />
            <InfoRow label="Gói hiện tại" value={getTierDisplayName(tier)} />
            <InfoRow label="Gợi ý" value="Dùng các mục bên dưới để truy cập đúng chức năng như trên website." />
          </Panel>
        );
      case 'fertility':
        return (
          <Panel title="Rụng trứng" subtitle="Tương ứng route /fertility và IVF timeline.">
            <Field label="Ngày bắt đầu kỳ kinh (YYYY-MM-DD)" value={periodStart} onChangeText={setPeriodStart} />
            <Field label="Độ dài chu kỳ" value={cycleLength} onChangeText={setCycleLength} keyboardType="numeric" />
            <PrimaryButton
              label="Lưu chu kỳ"
              onPress={() => run(() => featureService.logCycle(periodStart, Number(cycleLength) || 28), 'Đã lưu chu kỳ.')}
            />
            <Field label="Ngày bắt đầu IVF" value={ivfStart} onChangeText={setIvfStart} />
            <SecondaryButton label="Tạo IVF timeline" onPress={() => run(() => featureService.createIvfTimeline(ivfStart))} />
            <SecondaryButton label="Rụng trứng hôm nay" onPress={() => run(() => featureService.getOvulationToday())} />
          </Panel>
        );
      case 'pregnancy':
        return (
          <Panel title="Thai kỳ" subtitle="Tương ứng /pregnancy, /pregnancy/meals, /pregnancy/exercises.">
            <Field label="Cân nặng hiện tại (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" />
            <PrimaryButton
              label="Ghi cân nặng"
              onPress={() => run(() => featureService.logPregnancyWeight(Number(weightKg) || 0), 'Đã ghi cân nặng.')}
            />
            <SecondaryButton label="Thông tin tuần này" onPress={() => run(() => featureService.getPregnancyThisWeek())} />
            <SecondaryButton label="Thực đơn thai kỳ" onPress={() => run(() => featureService.getPregnancyMealPlan())} />
            <SecondaryButton label="Bài tập an toàn" onPress={() => run(() => featureService.getExercisePlan())} />
          </Panel>
        );
      case 'postpartum':
        return (
          <Panel title="Hậu sản" subtitle="Tương ứng /postpartum và /postpartum/epds.">
            <Field label="10 điểm EPDS, cách nhau bằng dấu phẩy" value={epdsCsv} onChangeText={setEpdsCsv} />
            <PrimaryButton label="Gửi EPDS" onPress={submitEpds} />
            <SecondaryButton label="EPDS gần nhất" onPress={() => run(() => featureService.getLatestEpds())} />
            <SecondaryButton label="Kế hoạch phục hồi" onPress={() => run(() => featureService.getRecoveryPlan())} />
          </Panel>
        );
      case 'baby':
        return (
          <Panel title="Bé yêu" subtitle="Tương ứng /baby-nutrition, /menu, /growth, create/edit baby.">
            <InfoRow label="Trong app" value="Tab Bé yêu đang chứa hồ sơ bé, tăng trưởng và thực đơn dinh dưỡng." />
            <InfoRow label="Lưu ý" value="Nếu API daily menu trả 400, kiểm tra hồ sơ bé đủ ngày sinh, cân nặng, chiều cao." />
          </Panel>
        );
      case 'upgrade':
        return (
          <Panel title="Gói dịch vụ" subtitle="Tương ứng /upgrade và /payment.">
            <Plan name={TIERS_DATA.MomHienDai.name} price={TIERS_DATA.MomHienDai.monthlyPrice} />
            <Plan name={TIERS_DATA.SuperMomVip.name} price={TIERS_DATA.SuperMomVip.monthlyPrice} />
            <PrimaryButton
              label="Tạo thanh toán Super Mom VIP"
              onPress={() => run(() => featureService.createPayment('SuperMomVip', 1), 'Đã tạo yêu cầu thanh toán.')}
            />
          </Panel>
        );
      case 'calendar':
        return (
          <Panel title="Lịch chăm sóc" subtitle="Tương ứng /care-calendar.">
            <InfoRow label="Chức năng" value="Theo dõi lịch khám, vitamin, nhắc chăm sóc và mốc quan trọng." />
          </Panel>
        );
      case 'emergency':
        return (
          <Panel title="Khẩn cấp" subtitle="Tương ứng /emergency.">
            <Warning text="Nếu đau nhiều, ra máu, sốt cao, khó thở hoặc thai máy giảm rõ rệt, hãy đến cơ sở y tế ngay." />
            <Warning text="Với bé: bỏ bú, tím tái, co giật, sốt cao kéo dài hoặc li bì là dấu hiệu cần khám ngay." />
          </Panel>
        );
      case 'feedback':
        return (
          <Panel title="Hỗ trợ" subtitle="Tương ứng /feedback.">
            <TextInput
              style={styles.textArea}
              placeholder="Mẹ muốn góp ý gì cho Mom Ơi?"
              placeholderTextColor={COLORS.textLight}
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
            <PrimaryButton label="Gửi phản hồi" onPress={submitFeedback} />
          </Panel>
        );
      case 'relax':
        return (
          <Panel title="Thư giãn" subtitle="Tương ứng /relax.">
            <InfoRow label="Bài tập 1 phút" value="Hít vào 4 giây, giữ 2 giây, thở ra 6 giây. Lặp lại 5 lần." />
          </Panel>
        );
      case 'subscription':
        return (
          <Panel title="Lịch sử gói" subtitle="Tương ứng /subscription-history.">
            <PrimaryButton label="Tải lịch sử thanh toán" onPress={() => run(() => featureService.getPaymentHistory())} />
          </Panel>
        );
      case 'profile':
        return (
          <Panel title="Hồ sơ mẹ" subtitle="Tương ứng /profile.">
            <InfoRow label="Tên" value={user?.fullName || 'Chưa cập nhật'} />
            <InfoRow label="Email" value={user?.email || 'Chưa cập nhật'} />
            <InfoRow label="Gói dịch vụ" value={getTierDisplayName(tier)} />
          </Panel>
        );
      case 'recipes':
        return (
          <Panel title="Món ăn" subtitle="Tương ứng /diet-recipes.">
            <Field label="Chế độ ăn" value={dietType} onChangeText={setDietType} />
            <Field label="Dị ứng" value={allergies} onChangeText={setAllergies} />
            <Field label="Nguyên liệu có sẵn" value={ingredients} onChangeText={setIngredients} />
            <PrimaryButton
              label="Tạo món ăn AI"
              onPress={() =>
                run(() =>
                  featureService.generateRecipes({
                    dietType,
                    allergies,
                    maxCookTime: 30,
                    availableIngredients: ingredients,
                  })
                )
              }
            />
            <SecondaryButton label="Món ăn của tôi" onPress={() => run(() => featureService.getMyRecipes())} />
          </Panel>
        );
      case 'notifications':
        return (
          <Panel title="Thông báo" subtitle="Tương ứng /notifications.">
            <PrimaryButton label="Tải thông báo" onPress={() => run(() => featureService.getNotifications())} />
          </Panel>
        );
      case 'medication':
        return (
          <Panel title="Lịch uống thuốc" subtitle="Tương ứng /scheduler.">
            <Field label="Tên thuốc / vitamin" value={medicineName} onChangeText={setMedicineName} />
            <Field label="Giờ uống" value={medicineTime} onChangeText={setMedicineTime} />
            <PrimaryButton label="Thêm lịch uống" onPress={submitMedication} />
            <SecondaryButton label="Tải danh sách thuốc" onPress={() => run(() => featureService.getMedications())} />
          </Panel>
        );
      case 'symptoms':
        return (
          <Panel title="Lịch sử AI" subtitle="Tương ứng /symptoms/history. Tab AI dùng cho /symptoms và /symptom-entry.">
            <PrimaryButton label="Tải lịch sử triệu chứng" onPress={() => run(() => featureService.getSymptomHistory())} />
          </Panel>
        );
      case 'monitoring':
        return (
          <Panel title="Theo dõi ngày" subtitle="Tương ứng /daily-monitoring.">
            <Field label="Số cốc nước" value={waterCups} onChangeText={setWaterCups} keyboardType="numeric" />
            <Field label="Tâm trạng" value={mood} onChangeText={setMood} />
            <PrimaryButton label="Lưu hôm nay" onPress={submitMonitoring} />
            <SecondaryButton label="Xem bản ghi hôm nay" onPress={() => run(() => featureService.getTodayMonitoring())} />
          </Panel>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Menu website</Text>
        <Text style={styles.title}>Chức năng Mom Ơi</Text>
        <Text style={styles.subtitle}>Các mục bên dưới được lấy theo route trong src/App.jsx của web.</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const selected = active === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem, selected && styles.menuItemActive]}
              onPress={() => setActive(item.key)}
              activeOpacity={0.86}
            >
              <Icon size={18} color={selected ? COLORS.white : item.color} />
              <Text style={[styles.menuText, selected && styles.menuTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {renderPanel()}

      <View style={[styles.resultCard, SHADOWS.card]}>
        <Text style={styles.resultTitle}>Kết quả API</Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        ) : (
          <Text style={styles.resultText}>{result}</Text>
        )}
      </View>
    </ScrollView>
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

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={COLORS.textLight}
      />
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Plan({ name, price }: { name: string; price: string }) {
  return (
    <View style={styles.plan}>
      <Text style={styles.planName}>{name}</Text>
      <Text style={styles.planPrice}>{price} / tháng</Text>
    </View>
  );
}

function Warning({ text }: { text: string }) {
  return (
    <View style={styles.warning}>
      <LifeBuoy size={17} color={COLORS.rose} />
      <Text style={styles.warningText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  header: { marginBottom: 16 },
  eyebrow: { color: COLORS.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: COLORS.textDark, fontSize: 26, lineHeight: 32, fontWeight: '800' },
  subtitle: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  menuItem: {
    width: '48.8%',
    minHeight: 52,
    borderRadius: RADII.card,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  menuItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  menuText: { flex: 1, color: COLORS.textDark, fontSize: 12, fontWeight: '800' },
  menuTextActive: { color: COLORS.white },
  panel: { backgroundColor: COLORS.white, borderRadius: RADII.hero, padding: 18, marginBottom: 16 },
  panelTitle: { color: COLORS.textDark, fontSize: 20, lineHeight: 26, fontWeight: '800' },
  panelSubtitle: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 14 },
  field: { marginBottom: 10 },
  fieldLabel: { color: COLORS.textDark, fontSize: 12, fontWeight: '800', marginBottom: 6 },
  input: {
    minHeight: 46,
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    color: COLORS.textDark,
    fontSize: 14,
  },
  textArea: {
    minHeight: 96,
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    padding: 12,
    color: COLORS.textDark,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: RADII.control,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  secondaryButton: {
    minHeight: 44,
    borderRadius: RADII.control,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  infoRow: {
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    padding: 12,
    marginBottom: 8,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  infoValue: { color: COLORS.textDark, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  plan: {
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    padding: 12,
    marginBottom: 8,
  },
  planName: { color: COLORS.textDark, fontSize: 14, fontWeight: '800' },
  planPrice: { color: COLORS.primary, fontSize: 13, fontWeight: '800', marginTop: 3 },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: RADII.control,
    backgroundColor: COLORS.roseLight,
    borderWidth: 1,
    borderColor: '#FFD1D7',
    padding: 12,
    marginBottom: 8,
  },
  warningText: { flex: 1, color: COLORS.rose, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  resultCard: { backgroundColor: COLORS.white, borderRadius: RADII.card, padding: 16 },
  resultTitle: { color: COLORS.textDark, fontSize: 15, fontWeight: '800', marginBottom: 8 },
  resultText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
});
