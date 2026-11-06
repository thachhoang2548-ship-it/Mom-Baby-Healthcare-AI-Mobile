import { MOM_THEME } from '../theme/colors';
import { tr } from '../i18n';

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

export interface UrgencyMeta {
  short: string;
  label: string;
  sub: string;
  color: string;
  bg: string;
}

/** Nhãn theo ngôn ngữ đang chọn, nên gọi lúc render chứ không lưu thành hằng. */
export function getUrgencyMeta(key: UrgencyKey): UrgencyMeta {
  switch (key) {
    case 'critical':
      return {
        short: tr('Khẩn cấp', 'Emergency'),
        label: tr('Khẩn cấp – cần đến cơ sở y tế ngay', 'Emergency – go to a medical facility now'),
        sub: tr(
          'Mẹ hãy đến bệnh viện gần nhất hoặc gọi cấp cứu 115, không chờ theo dõi tại nhà.',
          'Go to the nearest hospital or call emergency services (115 in Vietnam). Do not wait it out at home.'
        ),
        color: '#B42318',
        bg: '#FEE4E2',
      };
    case 'high':
      return {
        short: tr('Cao', 'High'),
        label: tr('Cần gặp bác sĩ sớm', 'See a doctor soon'),
        sub: tr(
          'Triệu chứng có thể cần thăm khám trực tiếp để xử lý an toàn.',
          'This may need an in-person check to be handled safely.'
        ),
        color: '#D95368',
        bg: '#FDECEF',
      };
    case 'medium':
      return {
        short: tr('Trung bình', 'Medium'),
        label: tr('Cần theo dõi thêm trong 24-48h', 'Keep watching for the next 24–48 hours'),
        sub: tr(
          'Chăm sóc tại nhà kết hợp quan sát các biểu hiện đi kèm.',
          'Care at home and watch for any new or related signs.'
        ),
        color: MOM_THEME.amberDark,
        bg: '#FFF4EB',
      };
    case 'low':
      return {
        short: tr('Thấp', 'Low'),
        label: tr('Có thể chăm sóc tại nhà', 'Can be cared for at home'),
        sub: tr(
          'Biểu hiện thường gặp, mẹ chú ý nghỉ ngơi và uống đủ nước.',
          'A common sign. Rest and drink enough water.'
        ),
        color: MOM_THEME.sageDark,
        bg: MOM_THEME.sageLight,
      };
    default:
      return {
        short: tr('Chưa phân tích', 'Not analyzed'),
        label: tr('AI chưa phân tích được triệu chứng này', 'The AI could not analyze this yet'),
        sub: tr(
          'Mẹ thử gửi lại sau ít phút. Nếu thấy lo lắng hoặc triệu chứng nặng lên, hãy liên hệ bác sĩ.',
          'Try again in a few minutes. If you are worried or it gets worse, contact a doctor.'
        ),
        color: MOM_THEME.muted,
        bg: MOM_THEME.beigeLight,
      };
  }
}
