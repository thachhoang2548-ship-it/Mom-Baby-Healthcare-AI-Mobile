import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, History, ImageIcon, Sparkles, Stethoscope, X } from 'lucide-react-native';
import symptomService, { SymptomLogDto } from '../../services/symptomService';
import SymptomAnalysisView from '../../components/SymptomAnalysisView';
import { RootStackParamList } from '../../navigation/types';
import { getApiErrorMessage } from '../../utils/apiError';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';

const quickSymptoms = [
  'Ốm nghén mệt mỏi',
  'Đau thắt lưng dưới',
  'Bé sốt nhẹ 37.8°C',
  'Bé nổi mẩn đỏ ở má',
  'Thai máy ít hơn',
  'Ợ chua, khó tiêu',
];

export default function SymptomCheckerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
      Alert.alert('Cần quyền truy cập', 'Mẹ vui lòng cấp quyền truy cập thư viện ảnh để tải ảnh triệu chứng.');
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
      Alert.alert('Cần quyền camera', 'Mẹ vui lòng cấp quyền máy ảnh để chụp ảnh triệu chứng nhé.');
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
    if (description.trim().length < 8) {
      Alert.alert('Mô tả thêm một chút', 'Mẹ nhập rõ hơn về biểu hiện (khoảng 8 ký tự trở lên) để AI hiểu đúng ngữ cảnh nhé.');
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
        Alert.alert('Chưa phân tích được', res.message || 'Hệ thống AI đang phản hồi chậm, mẹ thử lại một lát nữa nhé.');
      }
    } catch (err) {
      Alert.alert(
        'Thông báo',
        getApiErrorMessage(err, 'Máy chủ AI đang bận. Mẹ kiểm tra kết nối mạng và thử lại nhé.')
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={MOM_THEME.cream} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('SymptomHistory')}
            activeOpacity={0.8}
          >
            <History size={15} color={MOM_THEME.roseDark} />
            <Text style={styles.historyButtonText}>Lịch sử</Text>
          </TouchableOpacity>
          <View style={styles.headerIconWrap}>
            <Stethoscope size={24} color={MOM_THEME.roseDark} />
          </View>
          <View style={styles.headerEyebrowWrap}>
            <Text style={styles.headerEyebrow}>TRỢ LÝ SỨC KHỎE THÔNG MINH</Text>
          </View>
          <Text style={styles.title}>Hỏi bác sĩ AI</Text>
          <Text style={styles.subtitle}>
            Chia sẻ cảm giác hoặc biểu hiện lạ mẹ và bé đang gặp phải để nhận tư vấn y khoa tham khảo kịp thời 🌸
          </Text>
        </View>

        {/* ── Quick Symptom Suggestions ── */}
        <View style={styles.quickWrap}>
          <Text style={styles.quickTitle}>Gợi ý nhanh:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            {quickSymptoms.map((sym, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                onPress={() => setDescription((prev) => (prev ? `${prev}, ${sym}` : sym))}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>{sym}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Main Input Card ── */}
        <View style={[styles.card, SHADOWS.card]}>
          <View style={styles.cardHeader}>
            <Text style={styles.label}>Mẹ hoặc bé đang gặp vấn đề gì?</Text>
            <Text style={styles.charCount}>{description.length} ký tự</Text>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Ví dụ: Em bé bị nổi nốt đỏ li ti quanh cổ, sốt 38 độ từ chiều nay, bú ít hơn mọi ngày..."
            placeholderTextColor={MOM_THEME.mutedLight}
            multiline
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* Photo Preview */}
          {selectedImage ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
              <TouchableOpacity style={styles.removeButton} onPress={() => setSelectedImage(null)}>
                <X size={13} color={MOM_THEME.white} />
              </TouchableOpacity>
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>Đã đính kèm ảnh</Text>
              </View>
            </View>
          ) : null}

          {/* Media Pickers */}
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaButton} onPress={pickImage} activeOpacity={0.8}>
              <ImageIcon size={17} color={MOM_THEME.sageDark} />
              <Text style={styles.mediaText}>Chọn từ thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto} activeOpacity={0.8}>
              <Camera size={17} color={MOM_THEME.sageDark} />
              <Text style={styles.mediaText}>Chụp ảnh triệu chứng</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isAnalyzing && styles.disabledButton]}
            onPress={submit}
            disabled={isAnalyzing}
            activeOpacity={0.88}
          >
            {isAnalyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color={MOM_THEME.white} size="small" />
                <Text style={styles.primaryText}>AI đang phân tích triệu chứng...</Text>
              </View>
            ) : (
              <>
                <Sparkles size={18} color={MOM_THEME.white} />
                <Text style={styles.primaryText}>Tư vấn cùng AI ngay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Result Card ── */}
        {result ? (
          <View style={[styles.resultCard, SHADOWS.card]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Đánh giá sơ bộ</Text>
              <View style={styles.aiTag}>
                <Sparkles size={12} color={MOM_THEME.white} />
                <Text style={styles.aiTagText}>Mom Ơi AI Medical</Text>
              </View>
            </View>

            <SymptomAnalysisView analysis={result.analysisResult} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MOM_THEME.cream,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  historyButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: RADII.pill,
    backgroundColor: MOM_THEME.white,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    zIndex: 1,
  },
  historyButtonText: {
    color: MOM_THEME.roseDark,
    fontSize: 12,
    fontWeight: '700',
  },
  headerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: MOM_THEME.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: MOM_THEME.pink,
  },
  headerEyebrowWrap: {
    marginBottom: 3,
  },
  headerEyebrow: {
    color: MOM_THEME.roseDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: MOM_THEME.charcoal,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: MOM_THEME.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 10,
  },
  quickWrap: {
    marginBottom: 16,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: MOM_THEME.charcoalMid,
    marginBottom: 8,
  },
  quickScroll: {
    flexDirection: 'row',
  },
  quickChip: {
    backgroundColor: MOM_THEME.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    marginRight: 8,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  quickChipText: {
    fontSize: 12,
    color: MOM_THEME.charcoal,
    fontWeight: '600',
  },
  card: {
    backgroundColor: MOM_THEME.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: MOM_THEME.charcoal,
    fontSize: 14,
    fontWeight: '800',
  },
  charCount: {
    fontSize: 11,
    color: MOM_THEME.mutedLight,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
    backgroundColor: MOM_THEME.cream,
    padding: 14,
    color: MOM_THEME.charcoal,
    fontSize: 14,
    lineHeight: 20,
  },
  previewWrap: {
    marginTop: 12,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  preview: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D95368',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  previewBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  mediaButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: MOM_THEME.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  mediaText: {
    color: MOM_THEME.sageDark,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: MOM_THEME.roseDark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryText: {
    color: MOM_THEME.white,
    fontSize: 14,
    fontWeight: '800',
  },
  resultCard: {
    backgroundColor: MOM_THEME.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 18,
    fontWeight: '800',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MOM_THEME.roseDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  aiTagText: {
    color: MOM_THEME.white,
    fontSize: 10,
    fontWeight: '700',
  },
  urgencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '800',
  },
  urgencySubText: {
    fontSize: 11,
    color: MOM_THEME.charcoalMid,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  conditionCard: {
    borderRadius: 16,
    backgroundColor: MOM_THEME.cream,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: MOM_THEME.border,
  },
  conditionTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '800',
  },
  conditionBody: {
    color: MOM_THEME.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  recIconWrap: {
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    color: MOM_THEME.charcoalMid,
    fontSize: 13,
    lineHeight: 19,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#F7E7D0',
    padding: 12,
    marginTop: 4,
  },
  disclaimerText: {
    flex: 1,
    color: MOM_THEME.charcoalMid,
    fontSize: 11,
    lineHeight: 16,
  },
});

