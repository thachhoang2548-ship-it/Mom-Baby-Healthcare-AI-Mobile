import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { Card, ErrorState, LoadingView, Screen } from '../../components/ui';
import SymptomAnalysisView from '../../components/SymptomAnalysisView';
import symptomService, { SymptomLogDto } from '../../services/symptomService';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDateTime } from '../../utils/date';
import { MOM_THEME, RADII } from '../../theme/colors';

export default function SymptomDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'SymptomDetail'>>();
  const [log, setLog] = useState<SymptomLogDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await symptomService.fetchById(params.id);
      if ((res.isSuccess || res.success) && res.data) {
        setLog(res.data);
        setError(null);
      } else {
        setError(res.message || 'Không tìm thấy lần phân tích này.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen eyebrow="Trợ lý sức khỏe AI" title="Chi tiết phân tích">
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !log ? (
        <LoadingView />
      ) : (
        <>
          <Card>
            <Text style={styles.date}>{formatDateTime(log.createdAt)}</Text>
            <Text style={styles.label}>Mẹ đã mô tả</Text>
            <Text style={styles.description}>{log.textDescription || '—'}</Text>
            {log.imageUrl ? (
              <Image source={{ uri: log.imageUrl }} style={styles.image} resizeMode="cover" />
            ) : null}
          </Card>
          <Card>
            <SymptomAnalysisView analysis={log.analysisResult} />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  date: {
    color: MOM_THEME.mutedLight,
    fontSize: 12,
    marginBottom: 8,
  },
  label: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: RADII.control,
    marginTop: 12,
  },
});
