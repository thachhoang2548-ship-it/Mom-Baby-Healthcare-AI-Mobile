import { MOM_THEME } from '../theme/colors';

export type UrgencyKey = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

/**
 * Backend lưu UrgencyLevel dạng enum (Low/Medium/High/Critical), còn JSON của AI
 * dùng tiếng Việt (Thấp/Trung bình/Cao/Khẩn cấp). Chấp nhận cả hai và cả số thứ tự enum.
 */
export function normalizeUrgency(value?: string | number | null): UrgencyKey {
  if (typeof value === 'number') {
    return (['low', 'medium', 'high', 'critical'] as const)[value] ?? 'unknown';
  }
  const v = (value || '').trim().toLowerCase();
  if (v === 'critical' || v.includes('khẩn')) return 'critical';
  if (v === 'high' || v === 'cao') return 'high';
  if (v === 'medium' || v.includes('trung bình')) return 'medium';
  if (v === 'low' || v === 'thấp') return 'low';
  return 'unknown';
}

export const URGENCY_META: Record<
  UrgencyKey,
  { short: string; label: string; sub: string; color: string; bg: string }
> = {
  critical: {
    short: 'Khẩn cấp',
    label: 'Khẩn cấp – cần đến cơ sở y tế ngay',
    sub: 'Mẹ hãy đến bệnh viện gần nhất hoặc gọi cấp cứu 115, không chờ theo dõi tại nhà.',
    color: '#B42318',
    bg: '#FEE4E2',
  },
  high: {
    short: 'Cao',
    label: 'Cần gặp bác sĩ sớm',
    sub: 'Triệu chứng có thể cần thăm khám trực tiếp để xử lý an toàn.',
    color: '#D95368',
    bg: '#FDECEF',
  },
  medium: {
    short: 'Trung bình',
    label: 'Cần theo dõi thêm trong 24-48h',
    sub: 'Chăm sóc tại nhà kết hợp quan sát các biểu hiện đi kèm.',
    color: MOM_THEME.amberDark,
    bg: '#FFF4EB',
  },
  low: {
    short: 'Thấp',
    label: 'Có thể chăm sóc tại nhà',
    sub: 'Biểu hiện thường gặp, mẹ chú ý nghỉ ngơi và uống đủ nước.',
    color: MOM_THEME.sageDark,
    bg: MOM_THEME.sageLight,
  },
  unknown: {
    short: 'Chưa phân tích',
    label: 'AI chưa phân tích được triệu chứng này',
    sub: 'Mẹ thử gửi lại sau ít phút. Nếu thấy lo lắng hoặc triệu chứng nặng lên, hãy liên hệ bác sĩ.',
    color: MOM_THEME.muted,
    bg: MOM_THEME.beigeLight,
  },
};
