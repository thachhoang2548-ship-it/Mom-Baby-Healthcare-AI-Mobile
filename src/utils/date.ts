const pad = (n: number) => String(n).padStart(2, '0');

const DAY_MS = 24 * 60 * 60 * 1000;

/** Ngày lịch mẹ chọn -> ISO 00:00 UTC, giống web (`new Date('YYYY-MM-DD').toISOString()`). */
export function toUtcDateIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00.000Z`;
}

/** Ngày (không kèm giờ) backend trả về -> Date địa phương đúng ngày lịch đó. */
export function fromUtcDateIso(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Số ngày lịch từ `from` đến `to` (bỏ qua giờ phút). */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY_MS);
}

export function formatDate(date?: Date | null): string {
  if (!date) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatUtcDate(value?: string | null): string {
  return formatDate(fromUtcDateIso(value));
}

/** Mốc thời gian thật (createdAt, takenAt...) hiển thị theo giờ máy. */
export function formatDateTime(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${formatDate(d)}`;
}

export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Tuần thai theo ngày kinh cuối, cùng công thức với web (ProfilePage). */
export function pregnancyWeekFromLmp(lmp: Date): number {
  const week = Math.floor(daysBetween(lmp, startOfToday()) / 7) + 1;
  return Math.min(42, Math.max(1, week));
}

/** Ngày dự sinh = ngày kinh cuối + 280 ngày. */
export function dueDateFromLmp(lmp: Date): Date {
  return addDays(lmp, 280);
}
