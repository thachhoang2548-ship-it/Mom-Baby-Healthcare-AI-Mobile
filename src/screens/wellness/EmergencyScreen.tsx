import React, { useCallback, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AlertTriangle, PhoneCall } from 'lucide-react-native';
import { Card, Screen, SectionTitle, uiStyles } from '../../components/ui';
import featureService, { EmergencyGuide } from '../../services/featureService';
import { MOM_THEME, RADII } from '../../theme/colors';

const EMERGENCY_NUMBER = '115';
const DANGER = '#C8102E';
const DANGER_SOFT = '#FDECEF';

// Màn khẩn cấp phải dùng được khi mất mạng: hiện sẵn bản này (cùng nội dung với
// /api/wellness/emergency-guide), có mạng thì thay bằng bản từ server.
const OFFLINE_GUIDE: EmergencyGuide = {
  headline: 'Trợ giúp khẩn cấp',
  notice: 'Khi có nguy hiểm tức thời, hãy gọi cấp cứu hoặc đến cơ sở y tế gần nhất.',
  redFlags: [
    'Ra máu nhiều, đau bụng dữ dội hoặc co giật.',
    'Khó thở, đau ngực, ngất xỉu hoặc sốt cao liên tục.',
    'Sau sinh có ý nghĩ làm hại bản thân hoặc em bé.',
    'Bé bỏ bú, tím tái, sốt cao, li bì hoặc vàng da tăng nhanh.',
  ],
  actions: [
    'Gọi người thân ở gần và không ở một mình nếu triệu chứng đang nặng lên.',
    'Chuẩn bị giấy tờ khám, sổ thai/sổ bé, thuốc đang dùng và thời điểm triệu chứng bắt đầu.',
    'Liên hệ bác sĩ hoặc cơ sở y tế gần nhất để được hướng dẫn trực tiếp.',
  ],
  disclaimer:
    'Mom Ơi chỉ hỗ trợ theo dõi và gợi ý chăm sóc. Với triệu chứng cấp cứu, quyết định y tế cần đến từ bác sĩ hoặc nhân viên y tế.',
};

// Dấu hiệu app đã cảnh báo từ trước nhưng API chưa có; luôn ghép thêm để không mất.
const APP_RED_FLAGS = [
  'Đang mang thai mà thai máy giảm rõ rệt hoặc không còn thấy thai máy.',
  'Bé co giật hoặc sốt cao kéo dài.',
];

const callEmergency = () => {
  Linking.openURL(`tel:${EMERGENCY_NUMBER}`).catch(() =>
    Alert.alert('Không mở được trình gọi', `Mẹ hãy bấm gọi ${EMERGENCY_NUMBER} trực tiếp trên điện thoại.`)
  );
};

export default function EmergencyScreen() {
  const [guide, setGuide] = useState<EmergencyGuide>(OFFLINE_GUIDE);

  useFocusEffect(
    useCallback(() => {
      featureService
        .getEmergencyGuide()
        .then((data) => {
          if (data?.redFlags?.length) setGuide(data);
        })
        .catch(() => undefined);
    }, [])
  );

  const redFlags = [...guide.redFlags, ...APP_RED_FLAGS.filter((f) => !guide.redFlags.includes(f))];

  return (
    <Screen title={guide.headline} subtitle={guide.notice}>
      <TouchableOpacity
        style={styles.call}
        onPress={callEmergency}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Gọi cấp cứu ${EMERGENCY_NUMBER}`}
      >
        <PhoneCall size={26} color={MOM_THEME.white} />
        <View>
          <Text style={styles.callNumber}>Gọi {EMERGENCY_NUMBER}</Text>
          <Text style={styles.callHint}>Cấp cứu y tế, miễn phí, 24/7</Text>
        </View>
      </TouchableOpacity>

      <SectionTitle title="Đến cơ sở y tế ngay nếu có" />
      <View style={styles.flags}>
        {redFlags.map((flag) => (
          <View key={flag} style={styles.flag}>
            <AlertTriangle size={18} color={DANGER} />
            <Text style={styles.flagText}>{flag}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title="Trong lúc chờ" />
      <Card>
        {guide.actions.map((action, index) => (
          <View key={action} style={[styles.step, index > 0 && styles.stepDivider]}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={[uiStyles.body, styles.stepText]}>{action}</Text>
          </View>
        ))}
      </Card>

      <Text style={[uiStyles.muted, styles.disclaimer]}>{guide.disclaimer}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  call: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: DANGER,
    borderRadius: RADII.cardLg,
    paddingHorizontal: 22,
    paddingVertical: 20,
    marginBottom: 24,
  },
  callNumber: {
    color: MOM_THEME.white,
    fontSize: 26,
    fontWeight: '800',
  },
  callHint: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  flags: {
    gap: 8,
    marginBottom: 24,
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: DANGER_SOFT,
    borderRadius: RADII.control,
    padding: 14,
  },
  flagText: {
    flex: 1,
    color: MOM_THEME.charcoal,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  stepDivider: {
    borderTopWidth: 1,
    borderTopColor: MOM_THEME.borderSoft,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: MOM_THEME.pinkLight,
    color: MOM_THEME.roseDeep,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
  },
  disclaimer: {
    marginTop: 16,
    lineHeight: 18,
  },
});
