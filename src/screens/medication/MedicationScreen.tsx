import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const DURATIONS = [
  { days: 7, label: '7 ngày' },
  { days: 30, label: '1 tháng' },
  { days: 90, label: '3 tháng' },
  { days: 180, label: '6 tháng' },
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
  const [meds, setMeds] = useState<MedicationSchedule[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 viên');
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
    setDosage('1 viên');
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
      Alert.alert('Thiếu tên thuốc', 'Mẹ nhập tên thuốc hoặc vitamin nhé (VD: Viên sắt, Canxi, Acid folic).');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Thiếu liều dùng', 'Mẹ nhập liều dùng mỗi lần (VD: 1 viên).');
      return;
    }
    if (!times.length) {
      Alert.alert('Thiếu giờ uống', 'Mẹ thêm ít nhất một giờ uống trong ngày.');
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
      Alert.alert('Chưa thêm được', getApiErrorMessage(err));
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
      Alert.alert('Chưa cập nhật được', getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (med: MedicationSchedule) => {
    Alert.alert('Xóa lịch uống thuốc', `Mẹ muốn xóa lịch "${med.medName}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setBusyId(med.id);
          try {
            await featureService.deleteMedication(med.id);
            await load();
          } catch (err) {
            Alert.alert('Chưa xóa được', getApiErrorMessage(err));
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  return (
    <Screen
      eyebrow="Nhắc nhở"
      title="Lịch uống thuốc"
      subtitle="Theo dõi vitamin, sắt, canxi và thuốc bác sĩ kê. Đánh dấu mỗi ngày khi mẹ đã uống."
      refreshing={refreshing}
      onRefresh={refresh}
    >
      {showForm ? (
        <Card>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Thêm lịch mới</Text>
            <TouchableOpacity onPress={() => setShowForm(false)} accessibilityLabel="Đóng">
              <X size={20} color={MOM_THEME.muted} />
            </TouchableOpacity>
          </View>
          <Field label="Tên thuốc / vitamin" value={medName} onChangeText={setMedName} placeholder="VD: Viên sắt" />
          <Field label="Liều mỗi lần" value={dosage} onChangeText={setDosage} placeholder="VD: 1 viên" />

          <Text style={uiStyles.label}>Giờ uống trong ngày</Text>
          <View style={[uiStyles.rowWrap, styles.timesRow]}>
            {times.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.timeChip}
                onPress={() => setTimes((prev) => prev.filter((x) => x !== t))}
                accessibilityLabel={`Bỏ giờ ${t}`}
              >
                <Text style={styles.timeChipText}>{t}</Text>
                <X size={12} color={MOM_THEME.roseDeep} />
              </TouchableOpacity>
            ))}
          </View>
          <DateField
            label="Thêm giờ uống"
            mode="time"
            value={null}
            placeholder="Chạm để chọn giờ"
            onChange={addTime}
          />

          <DateField label="Bắt đầu từ" value={startDate} onChange={setStartDate} minimumDate={addDays(startOfToday(), -30)} />
          <Text style={uiStyles.label}>Uống trong</Text>
          <View style={[uiStyles.rowWrap, styles.timesRow]}>
            {DURATIONS.map((d) => (
              <Chip key={d.days} label={d.label} selected={durationDays === d.days} onPress={() => setDurationDays(d.days)} />
            ))}
          </View>
          <Field label="Ghi chú (không bắt buộc)" value={notes} onChangeText={setNotes} placeholder="VD: uống sau ăn sáng" />
          <PrimaryButton label="Lưu lịch uống" onPress={submit} loading={saving} />
        </Card>
      ) : (
        <PrimaryButton
          label="Thêm thuốc / vitamin"
          icon={<Plus size={18} color={MOM_THEME.white} />}
          onPress={() => setShowForm(true)}
          style={styles.addButton}
        />
      )}

      <SectionTitle title="Đang theo dõi" subtitle="Trạng thái được tính cho hôm nay" />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : meds === null ? (
        <LoadingView />
      ) : meds.length === 0 ? (
        <EmptyState
          emoji="💊"
          title="Chưa có lịch uống thuốc"
          body="Thêm các loại vitamin hoặc thuốc mẹ cần uống để Mom Ơi nhắc mẹ mỗi ngày."
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
                <TouchableOpacity onPress={() => confirmDelete(med)} disabled={busy} accessibilityLabel="Xóa">
                  <Trash2 size={18} color={MOM_THEME.mutedLight} />
                </TouchableOpacity>
              </View>

              {status ? (
                <View style={[styles.statusPill, status === 'taken' ? styles.statusTaken : styles.statusSkipped]}>
                  <Text style={[styles.statusText, status === 'taken' ? styles.statusTakenText : styles.statusSkippedText]}>
                    {status === 'taken' ? '✓ Hôm nay đã uống' : 'Hôm nay đã bỏ qua'}
                  </Text>
                  <TouchableOpacity onPress={() => mark(med, status === 'taken' ? 'skipped' : 'taken')} disabled={busy}>
                    <Text style={styles.statusChange}>Đổi</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <PrimaryButton
                    label="Đã uống"
                    icon={<Check size={16} color={MOM_THEME.white} />}
                    onPress={() => mark(med, 'taken')}
                    loading={busy}
                    style={styles.flex}
                  />
                  <SecondaryButton
                    label="Bỏ qua"
                    icon={<SkipForward size={15} color={MOM_THEME.roseDeep} />}
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

const styles = StyleSheet.create({
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
    backgroundColor: MOM_THEME.pinkLight,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: MOM_THEME.pink,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  timeChipText: {
    color: MOM_THEME.roseDeep,
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
    color: MOM_THEME.roseDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
