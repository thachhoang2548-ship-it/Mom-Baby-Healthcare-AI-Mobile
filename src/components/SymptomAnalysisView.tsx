import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, CheckCircle2, PhoneCall, ShieldCheck, Stethoscope, Utensils } from 'lucide-react-native';
import { SymptomAnalysisResult } from '../services/symptomService';
import { MOM_THEME, RADII } from '../theme/colors';
import { normalizeUrgency, URGENCY_META } from '../utils/urgency';

export function getUrgencyMeta(analysis?: SymptomAnalysisResult) {
  if (!analysis?.aiAvailable) return URGENCY_META.unknown;
  return URGENCY_META[normalizeUrgency(analysis.urgencyLevel)];
}

/** Hiển thị kết quả phân tích AI, dùng chung cho màn Bác sĩ AI và Chi tiết lịch sử. */
export default function SymptomAnalysisView({ analysis }: { analysis?: SymptomAnalysisResult }) {
  const badge = getUrgencyMeta(analysis);
  const isCritical = badge === URGENCY_META.critical;
  const conditions = analysis?.aiAvailable ? analysis.possibleConditions ?? [] : [];

  return (
    <View>
      <View style={[styles.urgencyBox, { backgroundColor: badge.bg }]}>
        <AlertCircle size={20} color={badge.color} />
        <View style={styles.flex}>
          <Text style={[styles.urgencyText, { color: badge.color }]}>{badge.label}</Text>
          <Text style={styles.urgencySubText}>{badge.sub}</Text>
          {analysis?.aiAvailable && analysis.urgencyReason ? (
            <Text style={styles.urgencyReason}>{analysis.urgencyReason}</Text>
          ) : null}
          {isCritical ? (
            <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL('tel:115')}>
              <PhoneCall size={16} color={MOM_THEME.white} />
              <Text style={styles.callText}>Gọi cấp cứu 115</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {analysis?.aiAvailable && analysis.shouldSeeDoctor ? (
        <View style={styles.doctorRow}>
          <Stethoscope size={16} color="#D95368" />
          <Text style={styles.doctorText}>
            Nên đi khám{analysis.specialistType ? ` chuyên khoa ${analysis.specialistType}` : ''}.
          </Text>
        </View>
      ) : null}

      {conditions.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các khả năng mẹ cần lưu ý</Text>
          {conditions.map((condition, index) => (
            <View key={index} style={styles.conditionCard}>
              <View style={styles.conditionHeader}>
                <Text style={styles.conditionTitle}>
                  {condition.name || condition.conditionName || 'Dấu hiệu sức khỏe'}
                </Text>
                {condition.probability ? (
                  <Text style={styles.probability}>{String(condition.probability)}</Text>
                ) : null}
              </View>
              {condition.description || condition.advice ? (
                <Text style={styles.conditionBody}>{condition.description || condition.advice}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {analysis?.aiAvailable && analysis.recommendations?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hướng xử lý đề xuất</Text>
          {analysis.recommendations.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <CheckCircle2 size={15} color={MOM_THEME.sageDark} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {analysis?.aiAvailable && analysis.dietarySuggestions?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý ăn uống</Text>
          {analysis.dietarySuggestions.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <Utensils size={14} color={MOM_THEME.amberDark} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.disclaimer}>
        <ShieldCheck size={16} color={MOM_THEME.amberDark} />
        <Text style={styles.disclaimerText}>
          {analysis?.aiAvailable && analysis.disclaimer
            ? analysis.disclaimer
            : 'Phân tích AI chỉ mang tính tham khảo. Nếu có dấu hiệu sốt cao liên tục, co giật, khó thở, ra máu bất thường hoặc thai máy giảm, mẹ hãy đến cơ sở y tế gần nhất.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  urgencyBox: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: RADII.control,
    padding: 14,
    marginBottom: 12,
  },
  urgencyText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  urgencySubText: {
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    lineHeight: 19,
  },
  urgencyReason: {
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontStyle: 'italic',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D92D20',
    borderRadius: RADII.control,
    minHeight: 44,
    marginTop: 10,
  },
  callText: {
    color: MOM_THEME.white,
    fontSize: 14,
    fontWeight: '800',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEF',
    borderRadius: RADII.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  doctorText: {
    flex: 1,
    color: '#B4344A',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  conditionCard: {
    backgroundColor: MOM_THEME.creamSoft,
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    padding: 12,
    marginBottom: 8,
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  conditionTitle: {
    flex: 1,
    color: MOM_THEME.charcoal,
    fontSize: 14,
    fontWeight: '800',
  },
  probability: {
    color: MOM_THEME.roseDark,
    fontSize: 11,
    fontWeight: '700',
  },
  conditionBody: {
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  listRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listText: {
    flex: 1,
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    lineHeight: 19,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: MOM_THEME.amberLight,
    borderRadius: RADII.control,
    padding: 12,
  },
  disclaimerText: {
    flex: 1,
    color: MOM_THEME.charcoalMid,
    fontSize: 12,
    lineHeight: 18,
  },
});
