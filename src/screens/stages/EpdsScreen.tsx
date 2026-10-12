import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, PhoneCall } from 'lucide-react-native';
import {
  Card,
  ErrorState,
  LoadingView,
  PrimaryButton,
  Screen,
  SecondaryButton,
  TierLockedCard,
  uiStyles,
} from '../../components/ui';
import featureService, { EpdsResult } from '../../services/featureService';
import { getApiErrorMessage, isTierLocked } from '../../utils/apiError';
import { EPDS_QUESTIONS, EPDS_SELF_HARM_INDEX, epdsRisk, usableResources } from '../../utils/epds';
import { MOM_THEME, RADII } from '../../theme/colors';

function SafetyBanner() {
  return (
    <View style={styles.safety}>
      <Text style={styles.safetyTitle}>Mẹ không phải một mình</Text>
      <Text style={styles.safetyText}>
        Nếu mẹ có ý nghĩ làm hại bản thân hoặc em bé, hãy nói ngay với người thân và liên hệ bác sĩ. Khi khẩn
        cấp, gọi 115 hoặc đến cơ sở y tế gần nhất.
      </Text>
      <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL('tel:115')}>
        <PhoneCall size={16} color={MOM_THEME.white} />
        <Text style={styles.callText}>Gọi cấp cứu 115</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function EpdsScreen() {
  const navigation = useNavigation();
  const [checking, setChecking] = useState(true);
  const [locked, setLocked] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(EPDS_QUESTIONS.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EpdsResult | null>(null);

  // Kiểm tra quyền trước, tránh để mẹ trả lời hết 10 câu rồi mới báo cần nâng cấp gói.
  const checkAccess = useCallback(async () => {
    try {
      await featureService.getLatestEpds();
      setLocked(false);
      setCheckError(null);
    } catch (err) {
      if (isTierLocked(err)) setLocked(true);
      else setCheckError(getApiErrorMessage(err));
    } finally {
      setChecking(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkAccess();
    }, [checkAccess])
  );

  const retryCheck = () => {
    setChecking(true);
    setCheckError(null);
    checkAccess();
  };

  const choose = (score: number) => {
    const next = [...answers];
    next[index] = score;
    setAnswers(next);
    if (index < EPDS_QUESTIONS.length - 1) {
      setTimeout(() => setIndex((i) => i + 1), 200);
    }
  };

  const submit = async () => {
    if (answers.some((a) => a === null)) return;
    setSubmitting(true);
    try {
      const res = await featureService.submitEpds(answers as number[]);
      setResult(res);
    } catch (err) {
      if (isTierLocked(err)) setLocked(true);
      else setCheckError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const header = {
    eyebrow: 'Sức khỏe tinh thần',
    title: 'Khảo sát EPDS',
    subtitle: 'Thang đo trầm cảm sau sinh Edinburgh, 10 câu. Mẹ chọn đáp án đúng nhất với 7 ngày qua.',
  };

  if (checking) {
    return (
      <Screen {...header}>
        <LoadingView />
      </Screen>
    );
  }
  if (locked) {
    return (
      <Screen {...header}>
        <TierLockedCard feature="Khảo sát EPDS" />
      </Screen>
    );
  }
  if (checkError) {
    return (
      <Screen {...header}>
        <ErrorState message={checkError} onRetry={retryCheck} />
      </Screen>
    );
  }

  if (result) {
    const selfHarm = (answers[EPDS_SELF_HARM_INDEX] ?? 0) > 0;
    const risk = epdsRisk(result.score, selfHarm || result.isUrgent);
    const resources = usableResources(result.resources);
    return (
      <Screen {...header} subtitle={undefined}>
        <View style={[styles.scoreCard, { backgroundColor: risk.bg }]}>
          <Text style={[styles.scoreLabel, { color: risk.color }]}>{risk.label}</Text>
          <Text style={[styles.score, { color: risk.color }]}>
            {result.score}
            <Text style={styles.scoreMax}> / 30 điểm</Text>
          </Text>
          <Text style={uiStyles.body}>{risk.advice}</Text>
        </View>
        {selfHarm || result.isUrgent ? <SafetyBanner /> : null}
        {result.aiMessage ? (
          <Card>
            <Text style={styles.cardTitle}>Lời nhắn từ Mom Ơi</Text>
            <Text style={uiStyles.body}>{result.aiMessage}</Text>
          </Card>
        ) : null}
        {resources.length ? (
          <Card>
            <Text style={styles.cardTitle}>Nguồn hỗ trợ</Text>
            {resources.map((r) => (
              <Text key={r} style={[uiStyles.body, styles.resource]}>
                • {r}
              </Text>
            ))}
          </Card>
        ) : null}
        <PrimaryButton label="Hoàn tất" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const question = EPDS_QUESTIONS[index];
  const allAnswered = answers.every((a) => a !== null);

  return (
    <Screen {...header}>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          Câu {index + 1} / {EPDS_QUESTIONS.length}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((index + 1) / EPDS_QUESTIONS.length) * 100}%` }]} />
      </View>

      <Card>
        <Text style={styles.question}>{question.text}</Text>
        {question.options.map((opt) => {
          const active = answers[index] === opt.score;
          return (
            <TouchableOpacity
              key={opt.label}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => choose(opt.score)}
              activeOpacity={0.85}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Card>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, index === 0 && styles.navDisabled]}
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ChevronLeft size={18} color={MOM_THEME.roseDark} />
          <Text style={styles.navText}>Câu trước</Text>
        </TouchableOpacity>
        {index < EPDS_QUESTIONS.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, answers[index] === null && styles.navDisabled]}
            onPress={() => setIndex((i) => i + 1)}
            disabled={answers[index] === null}
          >
            <Text style={styles.navText}>Câu sau</Text>
            <ChevronRight size={18} color={MOM_THEME.roseDark} />
          </TouchableOpacity>
        ) : null}
      </View>

      {index === EPDS_QUESTIONS.length - 1 ? (
        allAnswered ? (
          <PrimaryButton label="Xem kết quả" onPress={submit} loading={submitting} />
        ) : (
          <SecondaryButton
            label="Còn câu chưa trả lời"
            onPress={() => setIndex(answers.findIndex((a) => a === null))}
          />
        )
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  progressText: {
    color: MOM_THEME.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: MOM_THEME.pink,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: 6,
    backgroundColor: MOM_THEME.roseDark,
  },
  question: {
    color: MOM_THEME.charcoal,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '800',
    marginBottom: 14,
  },
  option: {
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.creamSoft,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  optionActive: {
    borderColor: MOM_THEME.roseDark,
    backgroundColor: MOM_THEME.pinkLight,
  },
  optionText: {
    color: MOM_THEME.charcoalMid,
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextActive: {
    color: MOM_THEME.roseDeep,
    fontWeight: '800',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  navDisabled: {
    opacity: 0.35,
  },
  navText: {
    color: MOM_THEME.roseDark,
    fontWeight: '800',
  },
  scoreCard: {
    borderRadius: RADII.cardLg,
    padding: 18,
    marginBottom: 14,
    gap: 6,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  score: {
    fontSize: 40,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  resource: {
    marginTop: 4,
  },
  safety: {
    backgroundColor: '#FEE4E2',
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: '#FDA29B',
    padding: 16,
    marginBottom: 14,
  },
  safetyTitle: {
    color: '#B42318',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  safetyText: {
    color: MOM_THEME.charcoalMid,
    fontSize: 14,
    lineHeight: 20,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D92D20',
    borderRadius: RADII.control,
    minHeight: 46,
    marginTop: 12,
  },
  callText: {
    color: MOM_THEME.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
