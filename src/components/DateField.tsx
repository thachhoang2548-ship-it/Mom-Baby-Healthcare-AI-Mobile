import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { MOM_THEME, RADII } from '../theme/colors';
import { formatDate, formatTime } from '../utils/date';
import { createThemedStyles, useAccent } from '../theme/accent';
import { useT } from '../i18n';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  hint?: string;
};

/** Ô chọn ngày/giờ dùng picker hệ thống thay cho việc gõ tay "YYYY-MM-DD". */
export default function DateField({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  placeholder,
  hint,
}: Props) {
  const a = useAccent();
  const styles = useStyles();
  const t = useT();
  const [iosOpen, setIosOpen] = useState(false);
  const pickerValue = value ?? new Date();

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickerValue,
        mode,
        is24Hour: true,
        minimumDate,
        maximumDate,
        onValueChange: (_event, date) => onChange(date),
      });
      return;
    }
    setIosOpen((v) => !v);
  };

  const text = value ? (mode === 'date' ? formatDate(value) : formatTime(value)) : placeholder ?? (mode === 'date' ? t('Chọn ngày', 'Choose a date') : t('Chọn giờ', 'Choose a time'));
  const Icon = mode === 'date' ? Calendar : Clock;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={open} activeOpacity={0.8}>
        <Text style={[styles.value, !value && styles.placeholder]}>{text}</Text>
        <Icon size={17} color={a.primary} />
      </TouchableOpacity>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {Platform.OS === 'ios' && iosOpen ? (
        <View style={styles.iosPicker}>
          <DateTimePicker
            value={pickerValue}
            mode={mode}
            display={mode === 'date' ? 'inline' : 'spinner'}
            locale="vi-VN"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onValueChange={(_event, date) => onChange(date)}
          />
          <TouchableOpacity style={styles.doneButton} onPress={() => setIosOpen(false)}>
            <Text style={styles.doneText}>Xong</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = createThemedStyles((a) => ({
  field: {
    marginBottom: 12,
  },
  label: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.creamSoft,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '600',
  },
  placeholder: {
    color: MOM_THEME.mutedLight,
    fontWeight: '400',
  },
  hint: {
    color: MOM_THEME.mutedLight,
    fontSize: 12,
    marginTop: 4,
  },
  iosPicker: {
    marginTop: 8,
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    padding: 8,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  doneText: {
    color: a.primary,
    fontWeight: '800',
  },
}));
