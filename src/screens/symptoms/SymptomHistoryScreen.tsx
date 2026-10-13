import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';
import { EmptyState, ErrorState, LoadingView, Screen } from '../../components/ui';
import { getUrgencyMeta } from '../../components/SymptomAnalysisView';
import symptomService, { SymptomLogDto } from '../../services/symptomService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDateTime } from '../../utils/date';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';

export default function SymptomHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<SymptomLogDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await symptomService.fetchHistory();
      const list = Array.isArray(res.data) ? res.data : [];
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setItems(list);
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

  return (
    <Screen
      eyebrow="Bác sĩ AI"
      title="Lịch sử chẩn đoán"
      subtitle="Các lần mẹ đã hỏi Bác sĩ AI, mới nhất ở trên cùng."
      refreshing={refreshing}
      onRefresh={refresh}
    >
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items === null ? (
        <LoadingView />
      ) : items.length === 0 ? (
        <EmptyState
          emoji="🩺"
          title="Chưa có lần chẩn đoán nào"
          body="Khi mẹ mô tả triệu chứng ở tab AI, kết quả sẽ được lưu lại tại đây."
          actionLabel="Hỏi Bác sĩ AI"
          onAction={() => navigation.navigate('MainTabs', { screen: 'SymptomAI' })}
        />
      ) : (
        items.map((item) => {
          const badge = getUrgencyMeta(item.analysisResult);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, SHADOWS.sm]}
              onPress={() => navigation.navigate('SymptomDetail', { id: item.id })}
              activeOpacity={0.85}
            >
              <View style={styles.itemBody}>
                <View style={styles.itemTop}>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.short}</Text>
                  </View>
                  <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
                </View>
                <Text style={styles.text} numberOfLines={2}>
                  {item.textDescription || 'Triệu chứng gửi bằng hình ảnh'}
                </Text>
              </View>
              <ChevronRight size={18} color={MOM_THEME.mutedLight} />
            </TouchableOpacity>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    padding: 14,
    marginBottom: 10,
  },
  itemBody: {
    flex: 1,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  date: {
    color: MOM_THEME.mutedLight,
    fontSize: 12,
  },
  text: {
    color: MOM_THEME.charcoal,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
