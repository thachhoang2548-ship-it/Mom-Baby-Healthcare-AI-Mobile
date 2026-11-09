import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AudioPlayer, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Play } from 'lucide-react-native';
import { Card, EmptyState, ErrorState, LoadingView, Screen, SectionTitle, uiStyles } from '../../components/ui';
import featureService, { RelaxLibrary, RelaxTrack } from '../../services/featureService';
import { API_BASE_URL } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { MOM_THEME, RADII } from '../../theme/colors';
import { useT } from '../../i18n';

const TONES: Record<string, { accent: string; soft: string }> = {
  pink: { accent: MOM_THEME.roseDark, soft: MOM_THEME.pinkLight },
  violet: { accent: '#8E6BB8', soft: MOM_THEME.lavenderLight },
  emerald: { accent: MOM_THEME.sageDark, soft: MOM_THEME.sageLight },
};
const DEFAULT_TONE = TONES.pink;

const toAbsolute = (url: string) => (url.startsWith('/') ? `${API_BASE_URL}${url}` : url);

/**
 * Khi rời màn hình (unmount), useAudioPlayer giải phóng player native trước khi cleanup
 * của useFocusEffect chạy; gọi pause lúc đó ném NotFoundException. Player đã giải phóng
 * thì nhạc cũng đã dừng, nên bỏ qua lỗi.
 */
const safePause = (player: AudioPlayer) => {
  try {
    player.pause();
  } catch {
    // Player đã được giải phóng.
  }
};

const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export default function RelaxScreen() {
  const t = useT();
  const [library, setLibrary] = useState<RelaxLibrary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<RelaxTrack | null>(null);
  // Thời gian còn lại của buổi nghe; hết thì tự dừng như hẹn giờ ngủ.
  const [remaining, setRemaining] = useState(0);

  const player = useAudioPlayer(null, { updateInterval: 1000 });
  const status = useAudioPlayerStatus(player);

  const load = useCallback(async () => {
    try {
      setLibrary(await featureService.getRelaxTracks());
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    }).catch(() => undefined);
  }, []);

  // Rời màn hình thì dừng nhạc: app không phát nền.
  useFocusEffect(
    useCallback(() => {
      load();
      return () => safePause(player);
    }, [load, player])
  );

  // Bài ngắn hơn thời lượng buổi nghe thì phát lại từ đầu cho tới khi hết giờ.
  useEffect(() => {
    if (status.didJustFinish && remaining > 0) {
      player.seekTo(0).then(() => player.play()).catch(() => undefined);
    }
  }, [status.didJustFinish, remaining, player]);

  useEffect(() => {
    if (!status.playing) return;
    const timer = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [status.playing]);

  useEffect(() => {
    if (remaining === 0 && player.playing) player.pause();
  }, [remaining, player]);

  const toggle = (track: RelaxTrack) => {
    if (!track.audioUrl) return;

    if (current?.id === track.id) {
      if (status.playing) {
        player.pause();
      } else {
        if (remaining === 0) setRemaining(track.durationMinutes * 60);
        player.play();
      }
      return;
    }

    player.replace({ uri: toAbsolute(track.audioUrl) });
    setCurrent(track);
    setRemaining(track.durationMinutes * 60);
    player.play();
  };

  const tracks = library?.tracks ?? [];
  const hasAudio = tracks.some((track) => track.audioUrl);

  return (
    <Screen
      eyebrow={t('Một phút cho riêng mẹ', 'A minute for you')}
      title={t('Thư giãn', 'Relax')}
      subtitle={t(
        library?.description ?? 'Âm thanh nhẹ giúp mẹ nghỉ ngơi, không thay thế trị liệu y khoa.',
        'Gentle sounds to help you rest. Not a replacement for medical care.'
      )}
    >
      {!library && !error ? <LoadingView /> : null}
      {error && !library ? <ErrorState message={error} onRetry={load} /> : null}

      {library && !hasAudio ? (
        <EmptyState
          emoji="🎧"
          title={t('Nhạc thư giãn đang được cập nhật', 'Relaxing sounds are on the way')}
          body={t('Trong lúc chờ, mẹ thử bài thở bên dưới nhé.', 'Meanwhile, try the breathing exercise below.')}
        />
      ) : null}

      {hasAudio
        ? tracks.map((track) => {
            const tone = TONES[track.color] ?? DEFAULT_TONE;
            const isCurrent = current?.id === track.id;
            const isPlaying = isCurrent && status.playing;
            const isLoading = isCurrent && status.isBuffering && !status.playing;
            const disabled = !track.audioUrl;
            const Icon = isPlaying ? Pause : Play;

            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.track, isCurrent && { borderColor: tone.accent }, disabled && styles.trackDisabled]}
                onPress={() => toggle(track)}
                disabled={disabled}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`${isPlaying ? t('Tạm dừng', 'Pause') : t('Phát', 'Play')} ${track.title}`}
              >
                <View style={[styles.playButton, { backgroundColor: disabled ? MOM_THEME.beige : tone.accent }]}>
                  {isLoading ? (
                    <ActivityIndicator color={MOM_THEME.white} size="small" />
                  ) : (
                    <Icon size={20} color={MOM_THEME.white} fill={MOM_THEME.white} />
                  )}
                </View>
                <View style={styles.trackBody}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={uiStyles.muted}>{track.description}</Text>
                  <View style={styles.trackMeta}>
                    <Text style={[styles.badge, { color: tone.accent, backgroundColor: tone.soft }]}>
                      {track.modeLabel}
                    </Text>
                    <Text style={styles.time}>
                      {disabled
                        ? t('Chưa có âm thanh', 'No audio yet')
                        : isCurrent
                          ? t(`Còn ${formatClock(remaining)}`, `${formatClock(remaining)} left`)
                          : t(`${track.durationMinutes} phút`, `${track.durationMinutes} min`)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        : null}

      <SectionTitle
        title={t('Thở 4 - 2 - 6', '4-2-6 breathing')}
        subtitle={t('Không cần tai nghe, làm được ở bất cứ đâu.', 'No headphones needed. Do it anywhere.')}
      />
      <Card>
        <Text style={uiStyles.body}>
          {t(
            'Hít vào bằng mũi 4 giây, giữ 2 giây, thở ra chậm bằng miệng 6 giây. Lặp lại 5 lần, vai thả lỏng.',
            'Breathe in through your nose for 4 seconds, hold for 2, then breathe out slowly through your mouth for 6. Repeat 5 times with relaxed shoulders.'
          )}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1.5,
    borderColor: MOM_THEME.borderSoft,
    padding: 14,
    marginBottom: 10,
  },
  trackDisabled: {
    opacity: 0.6,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBody: {
    flex: 1,
    gap: 3,
  },
  trackTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    borderRadius: RADII.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  time: {
    color: MOM_THEME.charcoalMid,
    fontSize: 12,
    fontWeight: '700',
  },
});
