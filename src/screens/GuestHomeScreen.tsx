import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RADII, SHADOWS } from '../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Colour tokens for Guest Home ────────────────────────────────────────────
const G = {
  cream: '#FAF6F0',
  cream2: '#F5EFE6',
  rose: '#E8B4C4',
  roseDark: '#C97A95',
  roseMid: '#D4869C',
  pink: '#F2D0DC',
  sage: '#8AA898',
  sageDark: '#5F7A6B',
  sageLight: '#D8E8E0',
  beige: '#E8DDD0',
  charcoal: '#2C2118',
  charcoalMid: '#4A3F35',
  muted: '#7A6E65',
  white: '#FFFFFF',
};

export default function GuestHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={G.cream} />

      {/* ── Sticky Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLogo}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>🌸</Text>
          </View>
          <Text style={styles.logoText}>Mom Ơi</Text>
        </View>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <View style={styles.heroContainer}>
          {/* Background organic shapes */}
          <View style={styles.heroBgShape} />
          <View style={styles.heroBgShape2} />

          {/* Hero Image – large rounded card */}
          <View style={styles.heroImageWrapper}>
            <Image
              source={require('../../assets/images/hero_mom.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Floating trust badge */}
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeEmoji}>💛</Text>
              <Text style={styles.heroBadgeText}>Đồng hành cùng mẹ mỗi ngày</Text>
            </View>
          </View>

          {/* Hero Text */}
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroLabel}>ĐỒNG HÀNH CÙNG MẸ</Text>
            <Text style={styles.heroTitle}>
              Chăm mẹ khỏe,{'\n'}Chăm bé vui.
            </Text>
            <Text style={styles.heroSubtitle}>
              Một nơi nhẹ nhàng để mẹ theo dõi thai kỳ, chăm sóc bé và tìm những thông tin hữu ích mỗi ngày.
            </Text>

            {/* CTA Buttons */}
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>Bắt đầu cùng Mom Ơi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryCtaText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════════
            SECTION: Khám phá Mom Ơi
        ══════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TÍNH NĂNG</Text>
          <Text style={styles.sectionTitle}>Khám phá Mom Ơi</Text>
          <Text style={styles.sectionSubtitle}>
            Mọi thứ mẹ cần, trong một ứng dụng
          </Text>
        </View>

        {/* Feature Card: Thai kỳ (large) */}
        <View style={[styles.featureCard, styles.featureCardLarge]}>
          <Image
            source={require('../../assets/images/pregnancy.jpg')}
            style={styles.featureImageFill}
            resizeMode="cover"
          />
          <View style={styles.featureCardOverlay} />
          <View style={styles.featureCardContent}>
            <View style={styles.featureTag}>
              <Text style={styles.featureTagText}>Thai kỳ</Text>
            </View>
            <Text style={styles.featureCardTitle}>
              Theo dõi hành trình thai kỳ
            </Text>
            <Text style={styles.featureCardDesc}>
              Ghi lại từng tuần, cân nặng, siêu âm và cột mốc đặc biệt
            </Text>
          </View>
        </View>

        {/* Feature Cards Row: Bé yêu + Sức khoẻ */}
        <View style={styles.featureRow}>
          <View style={[styles.featureCard, styles.featureCardHalf]}>
            <Image
              source={require('../../assets/images/baby.jpg')}
              style={styles.featureImageFill}
              resizeMode="cover"
            />
            <View style={styles.featureCardOverlay} />
            <View style={styles.featureCardContent}>
              <View style={[styles.featureTag, { backgroundColor: 'rgba(212,134,156,0.88)' }]}>
                <Text style={styles.featureTagText}>Bé yêu</Text>
              </View>
              <Text style={[styles.featureCardTitle, { fontSize: 14 }]}>
                Cột mốc của bé
              </Text>
              <Text style={[styles.featureCardDesc, { fontSize: 11 }]}>
                Ghi nhớ mọi khoảnh khắc
              </Text>
            </View>
          </View>

          <View style={[styles.featureCard, styles.featureCardHalf]}>
            <Image
              source={require('../../assets/images/health.jpg')}
              style={styles.featureImageFill}
              resizeMode="cover"
            />
            <View style={styles.featureCardOverlay} />
            <View style={styles.featureCardContent}>
              <View style={[styles.featureTag, { backgroundColor: 'rgba(95,122,107,0.88)' }]}>
                <Text style={styles.featureTagText}>Sức khỏe</Text>
              </View>
              <Text style={[styles.featureCardTitle, { fontSize: 14 }]}>
                Dinh dưỡng & Wellness
              </Text>
              <Text style={[styles.featureCardDesc, { fontSize: 11 }]}>
                Lời khuyên từ chuyên gia
              </Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════
            ASSISTANT SECTION
        ══════════════════════════════════════════ */}
        <View style={styles.assistantSection}>
          <View style={styles.assistantIconBg}>
            <Text style={styles.assistantEmoji}>💬</Text>
          </View>
          <Text style={styles.assistantLabel}>Trợ lý Mom Ơi</Text>
          <Text style={styles.assistantTitle}>
            Hỏi mọi điều{'\n'}bạn muốn biết
          </Text>
          <Text style={styles.assistantDesc}>
            Từ triệu chứng thai kỳ, dinh dưỡng, đến cách chăm sóc bé – Mom Ơi luôn sẵn sàng giải đáp.
          </Text>
          <View style={styles.assistantPills}>
            <View style={styles.pill}><Text style={styles.pillText}>Triệu chứng thai kỳ</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Dinh dưỡng cho mẹ</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Chăm sóc sơ sinh</Text></View>
          </View>
        </View>

        {/* ══════════════════════════════════════════
            LIFESTYLE SECTION
        ══════════════════════════════════════════ */}
        <View style={styles.lifestyleSection}>
          <Text style={styles.sectionLabel}>LIFESTYLE</Text>
          <Text style={styles.sectionTitle}>Mỗi ngày cùng Mom Ơi</Text>
          <Text style={styles.sectionSubtitle}>
            Đồng hành từ những buổi sáng bình yên đến khoảnh khắc ngọt ngào nhất
          </Text>

          <View style={styles.lifestyleImageCard}>
            <Image
              source={require('../../assets/images/mom_baby.jpg')}
              style={styles.lifestyleImage}
              resizeMode="cover"
            />
            <View style={styles.lifestyleOverlay} />
            <View style={styles.lifestyleQuote}>
              <Text style={styles.lifestyleQuoteText}>
                “Mỗi ngày của mẹ đều quan trọng.{'\n'}Mỗi khoảnh khắc bên bé đều quý giá.”
              </Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════
            TRUST INDICATORS
        ══════════════════════════════════════════ */}
        <View style={styles.trustSection}>
          {/* Chỉ nêu điều app thực sự có; không dùng số người dùng / đánh giá chưa kiểm chứng. */}
          <View style={styles.trustCard}>
            <Text style={styles.trustNumber}>3</Text>
            <Text style={styles.trustLabel}>Giai đoạn làm mẹ</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustCard}>
            <Text style={styles.trustNumber}>WHO</Text>
            <Text style={styles.trustLabel}>Chuẩn tăng trưởng của bé</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustCard}>
            <Text style={styles.trustNumber}>EPDS</Text>
            <Text style={styles.trustLabel}>Sàng lọc tâm lý sau sinh</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════
            FINAL CTA SECTION
        ══════════════════════════════════════════ */}
        <View style={styles.finalCta}>
          <View style={styles.finalCtaBg} />
          <Text style={styles.finalCtaLabel}>🌸 MOM ƠI</Text>
          <Text style={styles.finalCtaTitle}>
            Sẵn sàng bắt đầu hành trình cùng bé yêu?
          </Text>
          <Text style={styles.finalCtaDesc}>
            Tham gia cùng hàng nghìn bà mẹ đang sử dụng Mom Ơi để theo dõi thai kỳ và chăm sóc bé.
          </Text>
          <TouchableOpacity
            style={styles.finalCtaButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.finalCtaButtonText}>Bắt đầu cùng Mom Ơi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.finalCtaSecondary}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.finalCtaSecondaryText}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Mom Ơi · Chăm mẹ khỏe, chăm bé vui 🌸
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: G.cream,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 14,
    backgroundColor: G.cream,
    zIndex: 10,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: G.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { fontSize: 18 },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: G.charcoal,
    letterSpacing: -0.3,
  },
  loginBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    borderColor: G.roseDark,
    backgroundColor: G.white,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: G.roseDark,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Hero
  heroContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    position: 'relative',
  },
  heroBgShape: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: G.pink,
    opacity: 0.35,
  },
  heroBgShape2: {
    position: 'absolute',
    top: 200,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: G.sageLight,
    opacity: 0.45,
  },
  heroImageWrapper: {
    width: '100%',
    height: 400,
    borderRadius: 28,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    gap: 6,
    ...SHADOWS.sm,
  },
  heroBadgeEmoji: { fontSize: 14 },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: G.charcoalMid,
  },
  heroTextBlock: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: G.roseDark,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: G.charcoal,
    lineHeight: 42,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: G.muted,
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryCta: {
    backgroundColor: G.roseDark,
    paddingVertical: 16,
    borderRadius: RADII.pill,
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.md,
    shadowColor: G.roseDark,
  },
  primaryCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: G.white,
    letterSpacing: 0.2,
  },
  secondaryCta: {
    backgroundColor: G.white,
    paddingVertical: 15,
    borderRadius: RADII.pill,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: G.beige,
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: G.charcoalMid,
  },

  // Section headers
  section: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: G.sage,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: G.charcoal,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: G.muted,
    lineHeight: 20,
  },

  // Feature Cards
  featureCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  featureCardLarge: {
    height: 260,
  },
  featureCardHalf: {
    flex: 1,
    height: 220,
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 20,
  },
  featureRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  featureImageFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  featureCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30,18,10,0.38)',
  },
  featureCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featureTag: {
    backgroundColor: 'rgba(201,122,149,0.88)',
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featureTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: G.white,
    letterSpacing: 0.5,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: G.white,
    marginBottom: 4,
    lineHeight: 21,
  },
  featureCardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 17,
  },

  // Assistant
  assistantSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: G.sageLight,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  assistantIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: G.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...SHADOWS.sm,
  },
  assistantEmoji: { fontSize: 26 },
  assistantLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: G.sageDark,
  },
  assistantTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: G.charcoal,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  assistantDesc: {
    fontSize: 13,
    color: G.charcoalMid,
    lineHeight: 20,
  },
  assistantPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    backgroundColor: G.white,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...SHADOWS.sm,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: G.sageDark,
  },

  // Lifestyle
  lifestyleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  lifestyleImageCard: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 16,
    ...SHADOWS.card,
  },
  lifestyleImage: {
    width: '100%',
    height: '100%',
  },
  lifestyleOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20,12,6,0.36)',
  },
  lifestyleQuote: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  lifestyleQuoteText: {
    fontSize: 15,
    fontWeight: '600',
    color: G.white,
    fontStyle: 'italic',
    lineHeight: 23,
  },

  // Trust
  trustSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: G.white,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  trustCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  trustDivider: {
    width: 1,
    height: 36,
    backgroundColor: G.beige,
  },
  trustNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: G.roseDark,
    letterSpacing: -0.5,
  },
  trustLabel: {
    fontSize: 10,
    color: G.muted,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Final CTA
  finalCta: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    padding: 28,
    backgroundColor: G.cream2,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: G.beige,
  },
  finalCtaBg: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: G.pink,
    opacity: 0.3,
  },
  finalCtaLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: G.roseDark,
    marginBottom: 12,
  },
  finalCtaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: G.charcoal,
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  finalCtaDesc: {
    fontSize: 13,
    color: G.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  finalCtaButton: {
    backgroundColor: G.roseDark,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: RADII.pill,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.md,
    shadowColor: G.roseDark,
  },
  finalCtaButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: G.white,
    letterSpacing: 0.2,
  },
  finalCtaSecondary: { paddingVertical: 8 },
  finalCtaSecondaryText: {
    fontSize: 13,
    color: G.roseDark,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    backgroundColor: G.charcoal,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    fontWeight: '500',
  },
});
