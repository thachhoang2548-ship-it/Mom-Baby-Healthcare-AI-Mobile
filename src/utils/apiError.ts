import { isAxiosError } from 'axios';

const NETWORK_MESSAGE = 'Không kết nối được máy chủ. Mẹ kiểm tra mạng và thử lại nhé.';

const firstString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstString(item);
      if (found) return found;
    }
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const found = firstString(item);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Backend trả lỗi theo 3 kiểu: ApiResponse ({ message }), middleware gói dịch vụ
 * ({ Message } viết hoa) và ProblemDetails của ASP.NET ({ title, errors: {field: [..]} }).
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = 'Đã có lỗi xảy ra. Mẹ thử lại sau nhé.'
): string {
  if (isAxiosError(err)) {
    if (!err.response) return NETWORK_MESSAGE;
    const data: any = err.response.data;
    if (data && typeof data === 'object') {
      const message = firstString(data.message ?? data.Message);
      if (message) return message;
      const detail = firstString(data.errors ?? data.Errors);
      if (detail) return detail;
      if (typeof data.title === 'string') return data.title;
    }
    return fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** 403 = tài khoản chưa có gói dịch vụ đủ quyền (SubscriptionTierMiddleware). */
export function isTierLocked(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 403;
}
