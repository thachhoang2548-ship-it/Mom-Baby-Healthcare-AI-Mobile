import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, CheckCircle2, Utensils } from 'lucide-react-native';
import { Card, Field, PrimaryButton, TierLockedCard, uiStyles } from './ui';
import featureService, { FoodLogResult } from '../services/featureService';
import { useIsFreeTier } from '../stores/authStore';
import { getApiErrorMessage, isTierLocked } from '../utils/apiError';
import { MOM_THEME, RADII } from '../theme/colors';

const FEATURE_NAME = 'Ghi bữa ăn & cảnh báo món cần tránh';

/**
 * Ghi các món mẹ vừa ăn; server kiểm tra món cần tránh khi mang thai (luật BR02)
 * và gợi ý món thay thế. Chỉ hiện đúng kết quả server trả về, không tự cộng số liệu.
 */
export default function FoodLogCard() {
  const isFree = useIsFreeTier();
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<FoodLogResult | null>(null);

  if (isFree || locked) return <TierLockedCard feature={FEATURE_NAME} />;

  const submit = async () => {
    const foods = input
      .split(/[,;\n]/)
      .map((f) => f.trim())
      .filter(Boolean);
    if (!foods.length) {
      setError('Mẹ nhập ít nhất một món, các món cách nhau bằng dấu phẩy.');
      return;
    }
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      setResult(await featureService.logPregnancyFood(foods));
      setInput('');
    } catch (err) {
      if (isTierLocked(err)) setLocked(true);
      else setError(getApiErrorMessage(err, 'Chưa lưu được bữa ăn. Mẹ thử lại nhé.'));
    } finally {
      setSaving(false);
    }
  };

  const alert = result?.alerts?.[0];

  return (
    <Card>
      <Field
        label="Mẹ vừa ăn gì?"
        value={input}
        onChangeText={(text) => {
          setInput(text);
          if (error) setError(null);
        }}
        placeholder="VD: cơm, canh bí, cá kho"
        hint="Các món cách nhau bằng dấu phẩy."
        error={error ?? undefined}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <PrimaryButton
        label="Ghi bữa ăn"
        icon={<Utensils size={16} color={MOM_THEME.white} />}
        onPress={submit}
        loading={saving}
      />

      {result && alert ? (
        <View style={[styles.result, styles.warning]}>
          <View style={styles.resultHead}>
            <AlertTriangle size={18} color={DANGER} />
            <Text style={[styles.resultTitle, { color: DANGER }]}>{alert.titleVi}</Text>
          </View>
          {alert.messageVi ? <Text style={uiStyles.body}>{alert.messageVi}</Text> : null}
          {result.safeAlternatives?.length ? (
            <>
              <Text style={styles.altLabel}>Mẹ có thể thay bằng</Text>
              {result.safeAlternatives.map((food) => (
                <Text key={food} style={styles.alt}>
                  • {food}
                </Text>
              ))}
            </>
          ) : null}
        </View>
      ) : null}

      {result && !alert ? (
        <View style={[styles.result, styles.ok]}>
          <View style={styles.resultHead}>
            <CheckCircle2 size={18} color={MOM_THEME.sageDark} />
            <Text style={[styles.resultTitle, { color: MOM_THEME.sageDark }]}>Đã ghi bữa ăn</Text>
          </View>
          <Text style={uiStyles.body}>Không thấy món nào cần tránh trong thai kỳ.</Text>
        </View>
      ) : null}
    </Card>
  );
}

const DANGER = '#C8102E';

const styles = StyleSheet.create({
  result: {
    borderRadius: RADII.control,
    padding: 14,
    marginTop: 14,
    gap: 6,
  },
  warning: {
    backgroundColor: '#FDECEF',
  },
  ok: {
    backgroundColor: MOM_THEME.sageLight,
  },
  resultHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  altLabel: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  alt: {
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    lineHeight: 20,
  },
});
