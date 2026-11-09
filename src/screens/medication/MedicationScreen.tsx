import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Check, Pill, Plus, SkipForward, Trash2, X } from 'lucide-react-native';
import {
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Field,
  LoadingView,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
  uiStyles,
} from '../../components/ui';
import DateField from '../../components/DateField';
import featureService, { MedicationSchedule } from '../../services/featureService';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  addDays,
  formatTime,
  formatUtcDate,
  fromUtcDateIso,
  startOfToday,
  toUtcDateIso,
} from '../../utils/date';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';
import { createThemedStyles, useAccent } from '../../theme/accent';
import { tr, useT } from '../../i18n';

const DURATIONS = [
  { days: 7, label: '7 ngày', labelEn: '7 days' },
  { days: 30, label: '1 tháng', labelEn: '1 month' },
  { days: 90, label: '3 tháng', labelEn: '3 months' },
  { days: 180, label: '6 tháng', labelEn: '6 months' },
];

const sameDay = (a: Date | null, b: Date) =>
  !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Trạng thái hôm nay của một lịch uống thuốc (backend ghi theo ngày, không theo từng giờ). */
function todayStatus(med: MedicationSchedule): 'taken' | 'skipped' | null {
  const today = startOfToday();
  const log = med.adherenceLogs?.find((l) => sameDay(fromUtcDateIso(l.date), today));
  if (!log) return null;
  return log.status.toLowerCase() === 'skipped' ? 'skipped' : 'taken';
}

export default function MedicationScreen() {
  const a = useAccent();
  const styles = useStyles();
  const t = useT();
  const [meds, setMeds] = useState<MedicationSchedule[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState(() => tr('1 viên', '1 tablet'));
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [startDate, setStartDate] = useState<Date>(startOfToday());
  const [durationDays, setDurationDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await featureService.getMedications();
      setMeds(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const resetForm = () => {
    setMedName('');
    setDosage(t('1 viên', '1 tablet'));
    setTimes(['08:00']);
    setStartDate(startOfToday());
    setDurationDays(30);
    setNotes('');
  };

  const addTime = (date: Date) => {
    const value = formatTime(date);
    setTimes((prev) => (prev.includes(value) ? prev : [...prev, value].sort()));
  };

  const submit = async () => {
    if (!medName.trim()) {
      Alert.alert(
        t('Thiếu tên vitamin', 'Missing name'),
        t(
          'Mẹ nhập tên vitamin hoặc chất bổ sung nhé (VD: Viên sắt, Canxi, Acid folic).',
          'Enter the vitamin or supplement name (e.g. Iron, Calcium, Folic acid).'
        )
      );
      return;
    }
    if (!dosage.trim()) {
      Alert.alert(t('Thiếu liều dùng', 'Missing dose'), t('Mẹ nhập liều dùng mỗi lần (VD: 1 viên).', 'Enter the dose each time (e.g. 1 tablet).'));
      return;
    }
    if (!times.length) {
      Alert.alert(t('Thiếu giờ uống', 'Missing time'), t('Mẹ thêm ít nhất một giờ uống trong ngày.', 'Add at least one time of day.'));
      return;
    }
    setSaving(true);
    try {
      await featureService.addMedication({
        medName: medName.trim(),
        dosage: dosage.trim(),
        times,
        startDate: toUtcDateIso(startDate),
        endDate: toUtcDateIso(addDays(startDate, durationDays)),
        notes: notes.trim() || undefined,
      });
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      Alert.alert(t('Chưa thêm được', 'Could not add'), getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const mark = async (med: MedicationSchedule, status: 'taken' | 'skipped') => {
    setBusyId(med.id);
    try {
      await featureService.logAdherence(med.id, toUtcDateIso(startOfToday()), status);
      await load();
    } catch (err) {
      Alert.alert(t('Chưa cập nhật được', 'Could not update'), getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (med: MedicationSchedule) => {
    Alert.alert(t('Xóa lịch uống vitamin', 'Delete schedule'), t(`Mẹ muốn xóa lịch "${med.medName}"?`, `Delete "${med.medName}"?`), [
      { text: t('Hủy', 'Cancel'), style: 'cancel' },
      {
        text: t('Xóa', 'Delete'),
        style: 'destructive',
        onPress: async () => {
          setBusyId(med.id);
          try {
            await featureService.deleteMedication(med.id);
            await load();
          } catch (err) {
            Alert.alert(t('Chưa xóa được', 'Could not delete'), getApiErrorMessage(err));
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  return (
    <Screen
      eyebrow={t('Nhắc nhở', 'Reminders')}
      title={t('Lịch uống vitamin', 'Vitamin schedule')}
      subtitle={t(
        'Theo dõi vitamin, sắt, canxi và các chất bổ sung. Đánh dấu mỗi ngày khi mẹ đã uống.',
        'Track vitamins, iron, calcium and other supplements. Tick them off each day.'
      )}
      refreshing={refreshing}
      onRefresh={refresh}
    >
      {showForm ? (
        <Card>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{t('Thêm lịch mới', 'New schedule')}</Text>
            <TouchableOpacity onPress={() => setShowForm(false)} accessibilityLabel={t('Đóng', 'Close')}>
              <X size={20} color={MOM_THEME.muted} />
            </TouchableOpacity>
          </View>
          <Field
            label={t('Tên vitamin / chất bổ sung', 'Vitamin / supplement')}
            value={medName}
            onChangeText={setMedName}
            placeholder={t('VD: Viên sắt', 'e.g. Iron')}
          />
          <Field
            label={t('Liều mỗi lần', 'Dose each time')}
            value={dosage}
            onChangeText={setDosage}
            placeholder={t('VD: 1 viên', 'e.g. 1 tablet')}
          />

          <Text style={uiStyles.label}>{t('Giờ uống trong ngày', 'Times of day')}</Text>
          <View style={[uiStyles.rowWrap, styles.timesRow]}>
            {times.map((time) => (
              <TouchableOpacity
                key={time}
                style={styles.timeChip}
                onPress={() => setTimes((prev) => prev.filter((x) => x !== time))}
                accessibilityLabel={t(`Bỏ giờ ${time}`, `Remove ${time}`)}
              >
                <Text style={styles.timeChipText}>{time}</Text>
                <X size={12} color={a.primaryDark} />
              </TouchableOpacity>
            ))}
          </View>
          <DateField
            label={t('Thêm giờ uống', 'Add a time')}
            mode="time"
            value={null}
            placeholder={t('Chạm để chọn giờ', 'Tap to choose a time')}
            onChange={addTime}
          />

          <DateField label={t('Bắt đầu từ', 'Start date')} value={startDate} onChange={setStartDate} minimumDate={addDays(startOfToday(), -30)} />
          <Text style={uiStyles.label}>{t('Uống trong', 'For')}</Text>
          <View style={[uiStyles.rowWrap, styles.timesRow]}>
            {DURATIONS.map((d) => (
              <Chip key={d.days} label={t(d.label, d.labelEn)} selected={durationDays === d.days} onPress={() => setDurationDays(d.days)} />
            ))}
          </View>
          <Field
            label={t('Ghi chú (không bắt buộc)', 'Note (optional)')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('VD: uống sau ăn sáng', 'e.g. after breakfast')}
          />
          <PrimaryButton label={t('Lưu lịch uống', 'Save schedule')} onPress={submit} loading={saving} />
        </Card>
      ) : (
        <PrimaryButton
          label={t('Thêm vitamin', 'Add a vitamin')}
          icon={<Plus size={18} color={MOM_THEME.white} />}
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        />
      )}

      <SectionTitle
        title={t('Đang theo dõi', 'Tracking')}
        subtitle={t('Trạng thái được tính cho hôm nay', 'Status is for today')}
      />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : meds === null ? (
        <LoadingView />
      ) : meds.length === 0 ? (
        <EmptyState
          emoji="💊"
          title={t('Chưa có lịch uống vitamin', 'No vitamin schedules yet')}
          body={t(
            'Thêm các loại vitamin, sắt, canxi mẹ cần uống để Mom Ơi nhắc mẹ mỗi ngày.',
            'Add the vitamins, iron or calcium you take and Mom Ơi will remind you every day.'
          )}
        />
      ) : (
        meds.map((med) => {
          const status = todayStatus(med);
          const busy = busyId === med.id;
          return (
            <View key={med.id} style={[styles.medCard, SHADOWS.sm]}>
              <View style={styles.medTop}>
                <View style={styles.medIcon}>
                  <Pill size={18} color="#8E6BB8" />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.medName}>{med.medName}</Text>
                  <Text style={styles.medMeta}>
                    {med.dosage} · {med.times.join(', ')}
                  </Text>
                  <Text style={styles.medDates}>
                    {formatUtcDate(med.startDate)} → {formatUtcDate(med.endDate)}
                  </Text>
                  {med.notes ? <Text style={styles.medNotes}>{med.notes}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => confirmDelete(med)} disabled={busy} accessibilityLabel={t('Xóa', 'Delete')}>
                  <Trash2 size={18} color={MOM_THEME.mutedLight} />
                </TouchableOpacity>
              </View>

              {status ? (
                <View style={[styles.statusPill, status === 'taken' ? styles.statusTaken : styles.statusSkipped]}>
                  <Text style={[styles.statusText, status === 'taken' ? styles.statusTakenText : styles.statusSkippedText]}>
                    {status === 'taken' ? t('✓ Hôm nay đã uống', '✓ Taken today') : t('Hôm nay đã bỏ qua', 'Skipped today')}
                  </Text>
                  <TouchableOpacity onPress={() => mark(med, status === 'taken' ? 'skipped' : 'taken')} disabled={busy}>
                    <Text style={styles.statusChange}>{t('Đổi', 'Change')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <PrimaryButton
                    label={t('Đã uống', 'Taken')}
                    icon={<Check size={16} color={MOM_THEME.white} />}
                    onPress={() => mark(med, 'taken')}
                    loading={busy}
                    style={styles.flex}
                  />
                  <SecondaryButton
                    label={t('Bỏ qua', 'Skip')}
                    icon={<SkipForward size={15} color={a.primaryDark} />}
                    onPress={() => mark(med, 'skipped')}
                    disabled={busy}
                    style={[styles.flex, styles.skipButton]}
                  />
                </View>
              )}
            </View>
          );
        })
      )}
    </Screen>
  );
}

const useStyles = createThemedStyles((a) => ({
  flex: {
    flex: 1,
  },
  addButton: {
    marginBottom: 12,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  formTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 16,
    fontWeight: '800',
  },
  timesRow: {
    marginBottom: 12,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: a.light,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: a.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  timeChipText: {
    color: a.primaryDark,
    fontWeight: '800',
  },
  medCard: {
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    padding: 14,
    marginBottom: 12,
  },
  medTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  medIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MOM_THEME.lavenderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    color: MOM_THEME.charcoal,
    fontSize: 16,
    fontWeight: '800',
  },
  medMeta: {
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    marginTop: 2,
  },
  medDates: {
    color: MOM_THEME.mutedLight,
    fontSize: 12,
    marginTop: 2,
  },
  medNotes: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  skipButton: {
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADII.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusTaken: {
    backgroundColor: MOM_THEME.sageLight,
  },
  statusSkipped: {
    backgroundColor: MOM_THEME.beigeLight,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusTakenText: {
    color: MOM_THEME.sageDark,
  },
  statusSkippedText: {
    color: MOM_THEME.muted,
  },
  statusChange: {
    color: a.primary,
    fontSize: 12,
    fontWeight: '700',
  },
}));
