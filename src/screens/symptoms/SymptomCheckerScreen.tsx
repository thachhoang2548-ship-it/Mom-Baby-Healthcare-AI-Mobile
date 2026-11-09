import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
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
import { useLanguageStore, useT } from '../../i18n';
import { createThemedStyles, useAccent } from '../../theme/accent';

const quickSymptoms = [
  { vi: 'Ốm nghén mệt mỏi', en: 'Morning sickness, tired' },
  { vi: 'Đau thắt lưng dưới', en: 'Lower back pain' },
  { vi: 'Bé sốt nhẹ 37.8°C', en: 'Baby has a mild fever, 37.8°C' },
  { vi: 'Bé nổi mẩn đỏ ở má', en: 'Red rash on baby’s cheeks' },
  { vi: 'Thai máy ít hơn', en: 'Baby moving less' },
  { vi: 'Ợ chua, khó tiêu', en: 'Heartburn, indigestion' },
];

export default function SymptomCheckerScreen() {
  const a = useAccent();
  const styles = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const t = useT();
  const isEnglish = useLanguageStore((s) => s.lang === 'en');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    base64?: string | null;
    mimeType?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SymptomLogDto | null>(null);

  // Khi bàn phím mở lúc mẹ đang gõ: cuộn để thấy cả ô nhập lẫn nút "Nhận gợi ý" (góp ý #59, #96).
  const scrollRef = useRef<ScrollView>(null);
  const cardY = useRef(0);
  const typing = useRef(false);
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (typing.current) scrollRef.current?.scrollTo({ y: Math.max(0, cardY.current - 12), animated: true });
    });
    return () => sub.remove();
  }, []);

  const pickImage = async () => {
    // Trình chọn ảnh hệ thống không cần xin quyền thư viện (theo tài liệu expo-image-picker SDK 57).
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
      Alert.alert(
        t('Cần quyền camera', 'Camera access needed'),
        t('Mẹ vui lòng cấp quyền máy ảnh để chụp ảnh triệu chứng nhé.', 'Please allow camera access to take a photo.')
      );
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
      Alert.alert(
        t('Mô tả thêm một chút', 'Add a bit more detail'),
        t(
          'Mẹ nhập rõ hơn về biểu hiện (khoảng 8 ký tự trở lên) để AI hiểu đúng ngữ cảnh nhé.',
          'Describe what is happening in a little more detail (8 characters or more) so the AI understands.'
        )
      );
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
        Alert.alert(
          t('Chưa phân tích được', 'No suggestion yet'),
          res.message || t('Hệ thống AI đang phản hồi chậm, mẹ thử lại một lát nữa nhé.', 'The AI is slow right now. Please try again shortly.')
        );
      }
    } catch (err) {
      Alert.alert(
        t('Chưa gửi được', 'Could not send'),
        getApiErrorMessage(
          err,
          t('Máy chủ AI đang bận. Mẹ kiểm tra kết nối mạng và thử lại nhé.', 'The AI server is busy. Check your connection and try again.')
        )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={MOM_THEME.cream} />

      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
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
            <History size={15} color={a.primary} />
            <Text style={styles.historyButtonText}>{t('Lịch sử', 'History')}</Text>
          </TouchableOpacity>
          <View style={styles.headerIconWrap}>
            <Stethoscope size={24} color={a.primary} />
          </View>
          <View style={styles.headerEyebrowWrap}>
            <Text style={styles.headerEyebrow}>{t('GỢI Ý CHĂM SÓC MẸ & BÉ', 'CARE TIPS FOR MOM & BABY')}</Text>
          </View>
          <Text style={styles.title}>{t('Hỏi Mom Ơi AI', 'Ask Mom Ơi AI')}</Text>
          <Text style={styles.subtitle}>
            {t(
              'Chia sẻ cảm giác hoặc biểu hiện lạ mẹ và bé đang gặp phải để nhận gợi ý chăm sóc tham khảo 🌸 Gợi ý không phải chẩn đoán và không thay thế bác sĩ.',
              'Describe how you or your baby feel to get care suggestions 🌸 Suggestions are not a diagnosis and do not replace a doctor.'
            )}
          </Text>
          {/* Server và AI hiện trả lời bằng tiếng Việt: nói trước để người dùng nước ngoài không bất ngờ. */}
          {isEnglish ? (
            <Text style={styles.languageNote}>Replies are currently written in Vietnamese.</Text>
          ) : null}
        </View>

        {/* ── Quick Symptom Suggestions ── */}
        <View style={styles.quickWrap}>
          <Text style={styles.quickTitle}>{t('Gợi ý nhanh:', 'Quick picks:')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            {quickSymptoms.map((sym) => {
              const text = t(sym.vi, sym.en);
              return (
                <TouchableOpacity
                  key={sym.vi}
                  style={styles.quickChip}
                  onPress={() => setDescription((prev) => (prev ? `${prev}, ${text}` : text))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickChipText}>{text}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Main Input Card ── */}
        <View
          style={[styles.card, SHADOWS.card]}
          onLayout={(e) => {
            cardY.current = e.nativeEvent.layout.y;
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.label}>{t('Mẹ hoặc bé đang gặp vấn đề gì?', 'What is happening with you or your baby?')}</Text>
            <Text style={styles.charCount}>
              {description.length} {t('ký tự', 'chars')}
            </Text>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder={t(
              'Ví dụ: Em bé bị nổi nốt đỏ li ti quanh cổ, sốt 38 độ từ chiều nay, bú ít hơn mọi ngày...',
              'Example: small red spots around the neck, 38°C fever since this afternoon, feeding less than usual...'
            )}
            placeholderTextColor={MOM_THEME.mutedLight}
            multiline
            value={description}
            onChangeText={setDescription}
            onFocus={() => {
              typing.current = true;
            }}
            onBlur={() => {
              typing.current = false;
            }}
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
                <Text style={styles.previewBadgeText}>{t('Đã đính kèm ảnh', 'Photo attached')}</Text>
              </View>
            </View>
          ) : null}

          {/* Media Pickers */}
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaButton} onPress={pickImage} activeOpacity={0.8}>
              <ImageIcon size={17} color={MOM_THEME.sageDark} />
              <Text style={styles.mediaText}>{t('Chọn từ thư viện', 'Choose a photo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto} activeOpacity={0.8}>
              <Camera size={17} color={MOM_THEME.sageDark} />
              <Text style={styles.mediaText}>{t('Chụp ảnh triệu chứng', 'Take a photo')}</Text>
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
                <Text style={styles.primaryText}>{t('AI đang soạn gợi ý...', 'Writing suggestions...')}</Text>
              </View>
            ) : (
              <>
                <Sparkles size={18} color={MOM_THEME.white} />
                <Text style={styles.primaryText}>{t('Nhận gợi ý chăm sóc', 'Get care suggestions')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Result Card ── */}
        {result ? (
          <View style={[styles.resultCard, SHADOWS.card]}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{t('Gợi ý cho mẹ', 'Suggestions for you')}</Text>
              <View style={styles.aiTag}>
                <Sparkles size={12} color={MOM_THEME.white} />
                <Text style={styles.aiTagText}>Mom Ơi AI</Text>
              </View>
            </View>

            <SymptomAnalysisView analysis={result.analysisResult} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles((a) => ({
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
    color: a.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  headerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: a.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: a.border,
  },
  headerEyebrowWrap: {
    marginBottom: 3,
  },
  headerEyebrow: {
    color: a.primary,
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
  languageNote: {
    color: MOM_THEME.amberDark,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
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
    backgroundColor: a.primary,
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
    backgroundColor: a.primary,
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
}));

