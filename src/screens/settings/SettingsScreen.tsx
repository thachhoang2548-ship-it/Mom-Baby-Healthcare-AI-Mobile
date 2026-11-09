import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import { Check } from 'lucide-react-native';
import { Card, InfoRow, Screen, SectionTitle, uiStyles } from '../../components/ui';
import { Lang, useLanguageStore, useT } from '../../i18n';
import { useAccent } from '../../theme/accent';
import { MOM_THEME } from '../../theme/colors';

const LANGUAGES: { lang: Lang; label: string; hint: string }[] = [
  { lang: 'vi', label: 'Tiếng Việt', hint: 'Vietnamese' },
  { lang: 'en', label: 'English', hint: 'Tiếng Anh' },
];

export default function SettingsScreen() {
  const t = useT();
  const a = useAccent();
  const lang = useLanguageStore((s) => s.lang);
  const setLang = useLanguageStore((s) => s.setLang);
  const version = Constants.expoConfig?.version;

  return (
    <Screen eyebrow={t('Tài khoản', 'Account')} title={t('Cài đặt', 'Settings')}>
      <SectionTitle title={t('Ngôn ngữ', 'Language')} />
      <Card>
        <View accessibilityRole="radiogroup">
          {LANGUAGES.map((opt, index) => {
            const active = opt.lang === lang;
            return (
              <TouchableOpacity
                key={opt.lang}
                style={[styles.option, index > 0 && styles.optionBorder]}
                onPress={() => setLang(opt.lang)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                activeOpacity={0.8}
              >
                <View style={styles.flex}>
                  <Text style={[styles.optionLabel, active && { color: a.primaryDark }]}>{opt.label}</Text>
                  <Text style={uiStyles.muted}>{opt.hint}</Text>
                </View>
                {active ? <Check size={20} color={a.primary} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[uiStyles.muted, styles.note]}>
          {t(
            'Nội dung do server và trợ lý AI tạo (thực đơn, gợi ý tuần thai, câu trả lời AI) hiện vẫn bằng tiếng Việt.',
            'Content created by the server and the AI assistant (menus, weekly tips, AI answers) is still in Vietnamese.'
          )}
        </Text>
      </Card>

      {version ? (
        <>
          <SectionTitle title={t('Về ứng dụng', 'About')} />
          <Card>
            <InfoRow label={t('Phiên bản', 'Version')} value={version} />
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 8,
  },
  optionBorder: {
    borderTopWidth: 1,
    borderTopColor: MOM_THEME.borderSoft,
  },
  optionLabel: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    marginTop: 10,
  },
});
