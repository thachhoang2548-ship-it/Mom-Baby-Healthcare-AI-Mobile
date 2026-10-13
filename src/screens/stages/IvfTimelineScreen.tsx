import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Chip, PrimaryButton, Screen, SectionTitle, TierLockedCard, uiStyles } from '../../components/ui';
import DateField from '../../components/DateField';
import featureService, { IvfMilestone } from '../../services/featureService';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { addDays, daysBetween, formatUtcDate, fromUtcDateIso, startOfToday, toUtcDateIso } from '../../utils/date';
import { MOM_THEME, RADII } from '../../theme/colors';

const PROTOCOLS: { id: 'long' | 'short'; label: string; desc: string }[] = [
  { id: 'long', label: 'Phác đồ dài', desc: 'Ức chế buồng trứng trước khi kích thích (khoảng 1 tháng)' },
  { id: 'short', label: 'Phác đồ ngắn', desc: 'Kích thích ngay từ đầu chu kỳ (antagonist)' },
];

export default function IvfTimelineScreen() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [protocol, setProtocol] = useState<'long' | 'short'>('long');
  const [timeline, setTimeline] = useState<IvfMilestone[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const create = async () => {
    if (!startDate) {
      setError('Mẹ chọn ngày bắt đầu theo lịch bác sĩ hẹn nhé.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await featureService.createIvfTimeline(toUtcDateIso(startDate), protocol);
      setTimeline(Array.isArray(data) ? data : []);
    } catch (err) {
      if (isTierLocked(err)) setLocked(true);
      else setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const today = startOfToday();

  return (
    <Screen
      eyebrow="Chuẩn bị mang thai"
      title="Lịch trình IVF"
      subtitle="Ước tính các mốc chính của một chu kỳ IVF. Lịch thật luôn theo chỉ định của bác sĩ điều trị."
    >
      {locked ? <TierLockedCard feature="Lịch trình IVF" /> : null}

      <Card>
        <DateField
          label="Ngày bắt đầu điều trị"
          value={startDate}
          onChange={setStartDate}
          minimumDate={addDays(today, -60)}
          maximumDate={addDays(today, 365)}
        />
        <Text style={uiStyles.label}>Phác đồ</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {PROTOCOLS.map((p) => (
            <Chip key={p.id} label={p.label} selected={protocol === p.id} onPress={() => setProtocol(p.id)} />
          ))}
        </View>
        <Text style={[uiStyles.muted, styles.gap]}>{PROTOCOLS.find((p) => p.id === protocol)?.desc}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Xem lịch trình" onPress={create} loading={loading} disabled={locked} />
      </Card>

      {timeline?.length ? (
        <>
          <SectionTitle title="Các mốc dự kiến" />
          {timeline.map((m, index) => {
            const date = fromUtcDateIso(m.date);
            const diff = date ? daysBetween(today, date) : null;
            const past = diff !== null && diff < 0;
            return (
              <View key={m.dayNumber} style={styles.item}>
                <View style={styles.rail}>
                  <View style={[styles.dot, past && styles.dotPast]} />
                  {index < timeline.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={[styles.card, past && styles.cardPast]}>
                  <View style={styles.cardHead}>
                    <Text style={styles.day}>Ngày {m.dayNumber}</Text>
                    <Text style={styles.date}>
                      {formatUtcDate(m.date)}
                      {diff !== null && diff >= 0 ? ` · ${diff === 0 ? 'hôm nay' : `còn ${diff} ngày`}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.title}>{m.title}</Text>
                  <Text style={uiStyles.body}>{m.description}</Text>
                </View>
              </View>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: {
    marginBottom: 12,
  },
  error: {
    color: '#D95368',
    fontSize: 13,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
  },
  rail: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: MOM_THEME.roseDark,
    marginTop: 18,
  },
  dotPast: {
    backgroundColor: MOM_THEME.mutedLight,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: MOM_THEME.pink,
  },
  card: {
    flex: 1,
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  cardPast: {
    opacity: 0.6,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  day: {
    color: MOM_THEME.roseDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  date: {
    color: MOM_THEME.muted,
    fontSize: 12,
  },
  title: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
});
