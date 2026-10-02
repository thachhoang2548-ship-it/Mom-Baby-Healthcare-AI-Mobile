import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ImageIcon,
  Info,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react-native';
import symptomService, { SymptomAnalysisResult, SymptomLogDto } from '../../services/symptomService';
import { COLORS, RADII, SHADOWS } from '../../theme/colors';

export default function SymptomCheckerScreen() {
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    base64?: string | null;
    mimeType?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SymptomLogDto | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập', 'Mẹ vui lòng cấp quyền truy cập ảnh để tải ảnh triệu chứng.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!pickerResult.canceled && pickerResult.assets?.length) {
      const asset = pickerResult.assets[0];
      setSelectedImage({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền camera', 'Mẹ vui lòng cấp quyền camera để chụp ảnh triệu chứng.');
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!cameraResult.canceled && cameraResult.assets?.length) {
      const asset = cameraResult.assets[0];
      setSelectedImage({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const submit = async () => {
    if (description.trim().length < 10) {
      Alert.alert('Cần mô tả rõ hơn', 'Mẹ nhập ít nhất 10 ký tự để AI có thêm ngữ cảnh phân tích.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    try {
      const imageUrl = selectedImage?.base64
        ? `data:${selectedImage.mimeType || 'image/jpeg'};base64,${selectedImage.base64}`
        : null;

      const res = await symptomService.submitAnalysis({
        textDescription: description.trim(),
        imageUrl,
        imageMimeType: selectedImage?.mimeType || 'image/jpeg',
      });

      if ((res.isSuccess || res.success) && res.data) {
        setResult(res.data);
      } else {
        Alert.alert('Chưa phân tích được', res.message || 'Backend chưa trả kết quả hợp lệ.');
      }
    } catch (err: any) {
      Alert.alert(
        'Lỗi phân tích',
        err?.response?.data?.message || 'Máy chủ AI đang bận. Mẹ thử lại sau nhé.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analysis: SymptomAnalysisResult | undefined = result?.analysisResult;
  const badge = getUrgencyBadge(analysis?.urgencyLevel);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Stethoscope size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Chẩn đoán AI</Text>
        <Text style={styles.subtitle}>
          Mô tả điều mẹ hoặc bé đang cảm thấy. AI chỉ đưa ra gợi ý tham khảo, không thay thế bác sĩ.
        </Text>
      </View>

      <View style={[styles.card, SHADOWS.card]}>
        <Text style={styles.label}>Mẹ hoặc bé đang thấy gì?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ví dụ: Bé nổi mẩn đỏ ở má 2 ngày, hơi sốt 37.8 độ, quấy khi ăn..."
          placeholderTextColor={COLORS.textLight}
          multiline
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        {selectedImage ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
            <TouchableOpacity style={styles.removeButton} onPress={() => setSelectedImage(null)}>
              <X size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.mediaRow}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <ImageIcon size={18} color={COLORS.secondary} />
            <Text style={styles.mediaText}>Chọn ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
            <Camera size={18} color={COLORS.secondary} />
            <Text style={styles.mediaText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isAnalyzing && styles.disabledButton]}
          onPress={submit}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Sparkles size={18} color={COLORS.white} />
              <Text style={styles.primaryText}>Phân tích cùng AI</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {result ? (
        <View style={[styles.resultCard, SHADOWS.card]}>
          <Text style={styles.resultTitle}>Kết quả tham khảo</Text>
          <View style={[styles.urgencyBox, { backgroundColor: badge.bg }]}>
            <AlertCircle size={18} color={badge.color} />
            <Text style={[styles.urgencyText, { color: badge.color }]}>{badge.label}</Text>
          </View>

          {analysis?.possibleConditions?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khả năng gợi ý</Text>
              {analysis.possibleConditions.map((condition, index) => (
                <View key={index} style={styles.condition}>
                  <Text style={styles.conditionTitle}>
                    {condition.conditionName || condition.name || 'Triệu chứng cần theo dõi'}
                  </Text>
                  {condition.advice ? <Text style={styles.conditionBody}>{condition.advice}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {analysis?.recommendations?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bước tiếp theo</Text>
              {analysis.recommendations.map((item, index) => (
                <View key={index} style={styles.recommendation}>
                  <CheckCircle2 size={15} color={COLORS.emerald} />
                  <Text style={styles.recommendationText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.disclaimer}>
            <Info size={14} color={COLORS.textMuted} />
            <Text style={styles.disclaimerText}>
              Kết quả AI chỉ nhằm hỗ trợ tham khảo. Nếu triệu chứng nặng lên, mẹ hãy liên hệ bác sĩ hoặc cơ sở y tế.
            </Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function getUrgencyBadge(urgency = '') {
  const value = urgency.toLowerCase();
  if (value.includes('khẩn') || value.includes('nguy') || value.includes('high')) {
    return { label: 'Cần khám sớm', color: COLORS.rose, bg: COLORS.roseLight };
  }
  if (value.includes('theo') || value.includes('medium')) {
    return { label: 'Cần theo dõi thêm', color: COLORS.amber, bg: COLORS.amberLight };
  }
  return { label: 'Có thể theo dõi tại nhà', color: COLORS.emerald, bg: COLORS.emeraldLight };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    color: COLORS.textDark,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.hero,
    padding: 18,
    marginBottom: 16,
  },
  label: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 116,
    borderRadius: RADII.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    padding: 12,
    color: COLORS.textDark,
    fontSize: 14,
  },
  previewWrap: {
    marginTop: 12,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  preview: {
    width: 86,
    height: 86,
    borderRadius: RADII.control,
  },
  removeButton: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  mediaButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADII.control,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  mediaText: {
    color: COLORS.secondaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: RADII.control,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.hero,
    padding: 18,
  },
  resultTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  urgencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: RADII.control,
    padding: 12,
    marginBottom: 14,
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '800',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  condition: {
    borderRadius: RADII.control,
    backgroundColor: COLORS.background,
    padding: 12,
    marginBottom: 8,
  },
  conditionTitle: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: '800',
  },
  conditionBody: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 7,
  },
  recommendationText: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: RADII.control,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  disclaimerText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
