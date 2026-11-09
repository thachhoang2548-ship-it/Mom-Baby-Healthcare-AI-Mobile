import React, { useCallback, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BellRing, CheckCheck } from 'lucide-react-native';
import { EmptyState, ErrorState, LoadingView, Screen } from '../../components/ui';
import featureService, { NotificationAlert } from '../../services/featureService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDateTime } from '../../utils/date';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';
import { createThemedStyles, useAccent } from '../../theme/accent';
import { tr, useT } from '../../i18n';

const TYPE_LABELS: Record<string, { vi: string; en: string }> = {
  Symptom: { vi: 'Triệu chứng', en: 'Symptom' },
  Medication: { vi: 'Uống vitamin', en: 'Vitamins' },
  RoutineCheck: { vi: 'Nhắc định kỳ', en: 'Routine check' },
};

function severityStyle(severity: string) {
  switch (severity) {
    case 'Critical':
    case 'High':
      return { color: '#B42318', bg: '#FEE4E2', label: tr('Quan trọng', 'Important') };
    case 'Medium':
    case 'Warning':
      return { color: MOM_THEME.amberDark, bg: MOM_THEME.amberLight, label: tr('Cần chú ý', 'Needs attention') };
    case 'Positive':
      return { color: MOM_THEME.sageDark, bg: MOM_THEME.sageLight, label: tr('Tích cực', 'Good news') };
    default:
      return { color: '#4A88C7', bg: '#EEF5FA', label: tr('Thông tin', 'Info') };
  }
}

export const isUnresolved = (alert: NotificationAlert) => alert.status !== 'Resolved';

export default function NotificationsScreen() {
  const a = useAccent();
  const styles = useStyles();
  const t = useT();
  const [alerts, setAlerts] = useState<NotificationAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await featureService.getNotifications();
      setAlerts(Array.isArray(list) ? list : []);
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

  const resolve = async (alert: NotificationAlert) => {
    setBusyId(alert.id);
    try {
      await featureService.resolveNotification(alert.id);
      setAlerts((prev) => prev?.map((a) => (a.id === alert.id ? { ...a, status: 'Resolved' } : a)) ?? prev);
    } catch (err) {
      Alert.alert(t('Chưa cập nhật được', 'Could not update'), getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const pending = alerts?.filter(isUnresolved).length ?? 0;

  return (
    <Screen
      eyebrow={t('Cảnh báo & nhắc nhở', 'Alerts & reminders')}
      title={t('Thông báo', 'Notifications')}
      subtitle={
        alerts && alerts.length
          ? pending
            ? t(`Mẹ có ${pending} thông báo chưa xử lý.`, `You have ${pending} unread notification${pending > 1 ? 's' : ''}.`)
            : t('Mẹ đã xem hết các thông báo.', "You're all caught up.")
          : undefined
      }
      refreshing={refreshing}
      onRefresh={refresh}
    >
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : alerts === null ? (
        <LoadingView />
      ) : alerts.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title={t('Chưa có thông báo nào', 'No notifications yet')}
          body={t(
            'Cảnh báo sức khỏe, nhắc uống vitamin và lời khuyên từ chuyên gia sẽ hiện ở đây.',
            'Health alerts, vitamin reminders and expert tips will show up here.'
          )}
        />
      ) : (
        alerts.map((alert) => {
          const sev = severityStyle(alert.severity);
          const open = isUnresolved(alert);
          return (
            <View key={alert.id} style={[styles.item, SHADOWS.sm, !open && styles.itemResolved]}>
              <View style={[styles.icon, { backgroundColor: sev.bg }]}>
                <BellRing size={18} color={sev.color} />
              </View>
              <View style={styles.body}>
                <View style={styles.metaRow}>
                  <Text style={[styles.severity, { color: sev.color }]}>{sev.label}</Text>
                  <Text style={styles.type}>{TYPE_LABELS[alert.type] ? t(TYPE_LABELS[alert.type].vi, TYPE_LABELS[alert.type].en) : alert.type}</Text>
                </View>
                <Text style={styles.message}>{alert.message}</Text>
                <View style={styles.footer}>
                  <Text style={styles.time}>{formatDateTime(alert.createdAt)}</Text>
                  {open ? (
                    <TouchableOpacity
                      style={styles.resolveButton}
                      onPress={() => resolve(alert)}
                      disabled={busyId === alert.id}
                    >
                      <CheckCheck size={14} color={a.primary} />
                      <Text style={styles.resolveText}>{t('Đã xem', 'Mark as read')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.resolvedText}>{t('Đã xử lý', 'Read')}</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })
      )}
    </Screen>
  );
}

const useStyles = createThemedStyles((a) => ({
  item: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    padding: 14,
    marginBottom: 10,
  },
  itemResolved: {
    opacity: 0.65,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  severity: {
    fontSize: 12,
    fontWeight: '800',
  },
  type: {
    color: MOM_THEME.mutedLight,
    fontSize: 12,
  },
  message: {
    color: MOM_THEME.charcoal,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    color: MOM_THEME.mutedLight,
    fontSize: 12,
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resolveText: {
    color: a.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  resolvedText: {
    color: MOM_THEME.sageDark,
    fontSize: 12,
    fontWeight: '700',
  },
}));
