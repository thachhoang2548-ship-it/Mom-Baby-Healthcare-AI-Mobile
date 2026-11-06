import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Lang, useLanguageStore } from '../i18n';
import { MOM_THEME } from '../theme/colors';

const OPTIONS: { lang: Lang; label: string; a11y: string }[] = [
  { lang: 'vi', label: 'VI', a11y: 'Tiếng Việt' },
  { lang: 'en', label: 'EN', a11y: 'English' },
];

/** Nút chuyển Tiếng Việt / English; lựa chọn được lưu lại cho lần mở sau. */
export default function LanguageToggle() {
  const lang = useLanguageStore((s) => s.lang);
  const setLang = useLanguageStore((s) => s.setLang);

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      {OPTIONS.map((opt) => {
        const active = opt.lang === lang;
        return (
          <TouchableOpacity
            key={opt.lang}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => setLang(opt.lang)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.a11y}
            activeOpacity={0.8}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.white,
    padding: 2,
  },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  optionActive: {
    backgroundColor: MOM_THEME.roseDark,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: MOM_THEME.muted,
  },
  textActive: {
    color: MOM_THEME.white,
  },
});
