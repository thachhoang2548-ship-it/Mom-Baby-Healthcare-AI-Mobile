import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, RefreshCw } from 'lucide-react-native';
import { MOM_THEME, RADII, SHADOWS } from '../theme/colors';

type ScreenProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  showBack?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

/** Khung chung cho các màn hình được đẩy lên trên tab: nút quay lại, tiêu đề, kéo để tải lại. */
export function Screen({
  title,
  subtitle,
  eyebrow,
  right,
  showBack = true,
  refreshing = false,
  onRefresh,
  children,
}: ScreenProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={MOM_THEME.cream} />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={MOM_THEME.roseDark}
              colors={[MOM_THEME.roseDark]}
            />
          ) : undefined
        }
      >
        <View style={styles.header}>
          {showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Quay lại"
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color={MOM_THEME.charcoal} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.flex}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
          </View>
          {right}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </View>
  );
}

export function Card({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, SHADOWS.card, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.flex}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, onPress, loading, disabled, icon, style }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.primaryButton, inactive && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.86}
    >
      {loading ? (
        <ActivityIndicator color={MOM_THEME.white} size="small" />
      ) : (
        <>
          {icon}
          <Text style={styles.primaryButtonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress, loading, disabled, icon, style }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.secondaryButton, inactive && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.86}
    >
      {loading ? (
        <ActivityIndicator color={MOM_THEME.roseDark} size="small" />
      ) : (
        <>
          {icon}
          <Text style={styles.secondaryButtonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Field({
  label,
  hint,
  error,
  style,
  ...inputProps
}: TextInputProps & { label: string; hint?: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, inputProps.multiline && styles.inputMultiline, error ? styles.inputError : null, style]}
        placeholderTextColor={MOM_THEME.mutedLight}
        textAlignVertical={inputProps.multiline ? 'top' : 'center'}
        {...inputProps}
      />
      {error ? (
        <Text style={styles.fieldError}>{error}</Text>
      ) : hint ? (
        <Text style={styles.fieldHint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityState={{ selected: !!selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: MOM_THEME.beige, true: MOM_THEME.rose }}
        thumbColor={value ? MOM_THEME.roseDark : MOM_THEME.white}
      />
    </View>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function LoadingView({ text = 'Đang tải dữ liệu...' }: { text?: string }) {
  return (
    <View style={styles.stateBox}>
      <ActivityIndicator color={MOM_THEME.roseDark} />
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
}

export function EmptyState({
  emoji = '🌸',
  title,
  body,
  actionLabel,
  onAction,
}: {
  emoji?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[styles.stateBox, styles.stateCard]}>
      <Text style={styles.stateEmoji}>{emoji}</Text>
      <Text style={styles.stateTitle}>{title}</Text>
      {body ? <Text style={styles.stateText}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.stateAction} />
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.stateBox, styles.stateCard]}>
      <Text style={styles.stateEmoji}>⚠️</Text>
      <Text style={styles.stateTitle}>Chưa tải được dữ liệu</Text>
      <Text style={styles.stateText}>{message}</Text>
      {onRetry ? (
        <SecondaryButton
          label="Thử lại"
          onPress={onRetry}
          icon={<RefreshCw size={15} color={MOM_THEME.roseDark} />}
          style={styles.stateAction}
        />
      ) : null}
    </View>
  );
}

/** Backend trả 403 khi tài khoản chưa có gói đủ quyền; hiển thị rõ thay vì số liệu mẫu. */
export function TierLockedCard({
  feature,
  tierName = 'Mẹ Hiện Đại',
}: {
  feature: string;
  tierName?: string;
}) {
  return (
    <View style={[styles.stateBox, styles.stateCard, styles.lockedCard]}>
      <View style={styles.lockIcon}>
        <Lock size={20} color={MOM_THEME.amberDark} />
      </View>
      <Text style={styles.stateTitle}>{feature} dành cho gói {tierName}</Text>
      <Text style={styles.stateText}>
        Tài khoản của mẹ đang dùng gói miễn phí. Mẹ có thể xem các gói tại Menu → Gói dịch vụ.
      </Text>
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muted: {
    color: MOM_THEME.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  body: {
    color: MOM_THEME.charcoalMid,
    fontSize: 14,
    lineHeight: 21,
  },
  label: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: MOM_THEME.cream,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MOM_THEME.white,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: MOM_THEME.roseDark,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: MOM_THEME.charcoal,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: MOM_THEME.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  card: {
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: MOM_THEME.muted,
    fontSize: 12,
    marginTop: 2,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: RADII.control,
    backgroundColor: MOM_THEME.roseDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  primaryButtonText: {
    color: MOM_THEME.white,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: RADII.control,
    backgroundColor: MOM_THEME.pinkLight,
    borderWidth: 1,
    borderColor: MOM_THEME.pink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: MOM_THEME.roseDeep,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.creamSoft,
    color: MOM_THEME.charcoal,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 96,
  },
  inputError: {
    borderColor: '#D95368',
  },
  fieldHint: {
    color: MOM_THEME.mutedLight,
    fontSize: 12,
    marginTop: 4,
  },
  fieldError: {
    color: '#D95368',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  chip: {
    minHeight: 38,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.white,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: MOM_THEME.roseDark,
    borderColor: MOM_THEME.roseDark,
  },
  chipText: {
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: MOM_THEME.white,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
    marginBottom: 6,
  },
  toggleLabel: {
    flex: 1,
    color: MOM_THEME.charcoal,
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MOM_THEME.borderSoft,
  },
  infoLabel: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '700',
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
    gap: 6,
  },
  stateCard: {
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    marginBottom: 14,
  },
  lockedCard: {
    backgroundColor: MOM_THEME.amberLight,
    borderColor: '#F5DCC4',
  },
  lockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MOM_THEME.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stateEmoji: {
    fontSize: 30,
  },
  stateTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateText: {
    color: MOM_THEME.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  stateAction: {
    alignSelf: 'stretch',
    marginTop: 10,
  },
});
