import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, LoadingView, Screen, uiStyles } from '../../components/ui';
import featureService, { CareCalendar } from '../../services/featureService';
import { getStageIndex, StageIndex } from '../../services/profileService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage } from '../../utils/apiError';
import { MOM_THEME, RADII } from '../../theme/colors';

const STAGES: Record<StageIndex, { label: string; accent: string; soft: string }> = {
  0: { label: 'Chuẩn bị mang thai', accent: MOM_THEME.amberDark, soft: MOM_THEME.amberLight },
  1: { label: 'Đang mang thai', accent: MOM_THEME.roseDark, soft: MOM_THEME.pinkLight },
  2: { label: 'Sau sinh', accent: MOM_THEME.sageDark, soft: MOM_THEME.sageLight },
};

export default function CareCalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [calendar, setCalendar] = useState<CareCalendar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setCalendar(await featureService.getCareCalendar());
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

  const stage = STAGES[getStageIndex(calendar?.stage)];
  const items = calendar ? [...calendar.items].sort((a, b) => a.priority - b.priority) : [];
  const week = calendar?.stage === 'Pregnant' ? calendar.pregnancyWeek : null;

  return (
    <Screen
      eyebrow="Chăm sóc mỗi ngày"
      title="Lịch chăm sóc"
      subtitle="Những việc nên làm sắp tới, theo giai đoạn mẹ đã chọn trong hồ sơ."
      refreshing={refreshing}
      onRefresh={refresh}
    >
      {!calendar && !error ? <LoadingView /> : null}
      {error && !calendar ? <ErrorState message={error} onRetry={load} /> : null}

      {calendar ? (
        <>
          <View style={[styles.stage, { backgroundColor: stage.soft }]}>
            <View style={styles.flex}>
              <Text style={[styles.stageLabel, { color: stage.accent }]}>{stage.label}</Text>
              {week ? <Text style={styles.stageMeta}>Tuần thai thứ {week}</Text> : null}
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              accessibilityRole="button"
              activeOpacity={0.8}
            >
              <Text style={[styles.stageLink, { color: stage.accent }]}>Đổi giai đoạn</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => {
            const first = index === 0;
            return (
              <View key={`${item.priority}-${item.title}`} style={styles.item}>
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.dot,
                      { borderColor: stage.accent },
                      first && { backgroundColor: stage.accent },
                    ]}
                  />
                  {index < items.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={[styles.card, first && { borderColor: stage.accent }]}>
                  <Text style={[styles.time, { color: stage.accent }]}>{item.time}</Text>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={uiStyles.body}>{item.description}</Text>
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
  flex: {
    flex: 1,
  },
  stage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADII.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  stageLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  stageMeta: {
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    marginTop: 2,
  },
  stageLink: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
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
    borderWidth: 2,
    backgroundColor: MOM_THEME.white,
    marginTop: 18,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: MOM_THEME.border,
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
  time: {
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
});
