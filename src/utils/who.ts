// Bảng bách phân vị WHO 0-24 tháng, cùng số liệu với web (GrowthChartPage.jsx).
export interface WhoRow {
  month: number;
  P3: number;
  P15: number;
  P50: number;
  P85: number;
  P97: number;
}

const WEIGHT_BOYS: WhoRow[] = [
  { month: 0, P3: 2.5, P15: 2.9, P50: 3.3, P85: 3.9, P97: 4.4 },
  { month: 2, P3: 4.3, P15: 4.9, P50: 5.6, P85: 6.3, P97: 7.1 },
  { month: 4, P3: 5.6, P15: 6.2, P50: 7.0, P85: 7.8, P97: 8.6 },
  { month: 6, P3: 6.4, P15: 7.1, P50: 7.9, P85: 8.8, P97: 9.7 },
  { month: 8, P3: 7.0, P15: 7.8, P50: 8.6, P85: 9.6, P97: 10.5 },
  { month: 10, P3: 7.5, P15: 8.3, P50: 9.2, P85: 10.2, P97: 11.2 },
  { month: 12, P3: 7.8, P15: 8.7, P50: 9.6, P85: 10.7, P97: 11.8 },
  { month: 15, P3: 8.4, P15: 9.3, P50: 10.3, P85: 11.5, P97: 12.7 },
  { month: 18, P3: 8.9, P15: 9.9, P50: 10.9, P85: 12.2, P97: 13.5 },
  { month: 21, P3: 9.4, P15: 10.4, P50: 11.5, P85: 12.9, P97: 14.3 },
  { month: 24, P3: 9.8, P15: 10.9, P50: 12.0, P85: 13.5, P97: 15.0 },
];

const WEIGHT_GIRLS: WhoRow[] = [
  { month: 0, P3: 2.4, P15: 2.8, P50: 3.2, P85: 3.8, P97: 4.2 },
  { month: 2, P3: 3.9, P15: 4.5, P50: 5.1, P85: 5.8, P97: 6.6 },
  { month: 4, P3: 5.0, P15: 5.7, P50: 6.4, P85: 7.3, P97: 8.2 },
  { month: 6, P3: 5.8, P15: 6.5, P50: 7.3, P85: 8.2, P97: 9.3 },
  { month: 8, P3: 6.3, P15: 7.0, P50: 7.9, P85: 9.0, P97: 10.2 },
  { month: 10, P3: 6.8, P15: 7.5, P50: 8.5, P85: 9.6, P97: 10.9 },
  { month: 12, P3: 7.1, P15: 7.9, P50: 8.9, P85: 10.1, P97: 11.5 },
  { month: 15, P3: 7.7, P15: 8.5, P50: 9.6, P85: 10.9, P97: 12.4 },
  { month: 18, P3: 8.2, P15: 9.1, P50: 10.2, P85: 11.6, P97: 13.2 },
  { month: 21, P3: 8.6, P15: 9.6, P50: 10.8, P85: 12.3, P97: 14.0 },
  { month: 24, P3: 9.0, P15: 10.1, P50: 11.4, P85: 13.0, P97: 14.8 },
];

const HEIGHT_BOYS: WhoRow[] = [
  { month: 0, P3: 46.3, P15: 48.0, P50: 49.9, P85: 51.8, P97: 53.4 },
  { month: 2, P3: 54.4, P15: 56.4, P50: 58.4, P85: 60.4, P97: 62.4 },
  { month: 4, P3: 59.7, P15: 61.8, P50: 63.9, P85: 66.0, P97: 68.0 },
  { month: 6, P3: 63.6, P15: 65.7, P50: 67.9, P85: 70.1, P97: 72.2 },
  { month: 8, P3: 66.8, P15: 69.0, P50: 71.2, P85: 73.5, P97: 75.6 },
  { month: 10, P3: 69.6, P15: 71.8, P50: 74.1, P85: 76.4, P97: 78.6 },
  { month: 12, P3: 71.9, P15: 74.2, P50: 76.5, P85: 78.9, P97: 81.1 },
  { month: 15, P3: 75.0, P15: 77.4, P50: 79.9, P85: 82.4, P97: 84.7 },
  { month: 18, P3: 77.8, P15: 80.4, P50: 83.0, P85: 85.6, P97: 88.0 },
  { month: 21, P3: 80.5, P15: 83.1, P50: 85.9, P85: 88.6, P97: 91.2 },
  { month: 24, P3: 82.9, P15: 85.7, P50: 88.6, P85: 91.4, P97: 94.1 },
];

const HEIGHT_GIRLS: WhoRow[] = [
  { month: 0, P3: 45.6, P15: 47.3, P50: 49.1, P85: 51.0, P97: 52.7 },
  { month: 2, P3: 53.2, P15: 55.0, P50: 57.1, P85: 59.1, P97: 60.9 },
  { month: 4, P3: 58.0, P15: 60.0, P50: 62.1, P85: 64.2, P97: 66.2 },
  { month: 6, P3: 61.5, P15: 63.5, P50: 65.7, P85: 67.9, P97: 69.9 },
  { month: 8, P3: 64.5, P15: 66.6, P50: 68.8, P85: 71.1, P97: 73.2 },
  { month: 10, P3: 67.0, P15: 69.2, P50: 71.5, P85: 73.9, P97: 76.1 },
  { month: 12, P3: 69.2, P15: 71.4, P50: 73.7, P85: 76.1, P97: 78.4 },
  { month: 15, P3: 72.2, P15: 74.5, P50: 77.0, P85: 79.5, P97: 81.8 },
  { month: 18, P3: 74.9, P15: 77.4, P50: 80.0, P85: 82.6, P97: 85.0 },
  { month: 21, P3: 77.5, P15: 80.1, P50: 82.7, P85: 85.4, P97: 88.0 },
  { month: 24, P3: 79.8, P15: 82.5, P50: 85.2, P85: 88.0, P97: 90.7 },
];

export type GrowthMetric = 'weight' | 'height';

export const WHO_MAX_MONTH = 24;

export function whoTable(metric: GrowthMetric, isBoy: boolean): WhoRow[] {
  if (metric === 'weight') return isBoy ? WEIGHT_BOYS : WEIGHT_GIRLS;
  return isBoy ? HEIGHT_BOYS : HEIGHT_GIRLS;
}

/** Nội suy tuyến tính giữa hai mốc tháng gần nhất; ngoài 0-24 tháng trả null. */
export function whoAt(table: WhoRow[], month: number): WhoRow | null {
  if (month < 0 || month > WHO_MAX_MONTH) return null;
  const upperIndex = table.findIndex((row) => row.month >= month);
  const upper = table[upperIndex];
  if (upper.month === month || upperIndex === 0) return { ...upper, month };
  const lower = table[upperIndex - 1];
  const t = (month - lower.month) / (upper.month - lower.month);
  const mix = (key: keyof Omit<WhoRow, 'month'>) => lower[key] + (upper[key] - lower[key]) * t;
  return { month, P3: mix('P3'), P15: mix('P15'), P50: mix('P50'), P85: mix('P85'), P97: mix('P97') };
}

export interface GrowthBand {
  label: string;
  tone: 'low' | 'watch' | 'normal';
}

/** Xếp loại theo bách phân vị WHO: dưới P3 / P97 cần hỏi bác sĩ, P3-P15 và P85-P97 cần theo dõi. */
export function classifyGrowth(metric: GrowthMetric, isBoy: boolean, month: number, value: number): GrowthBand | null {
  const ref = whoAt(whoTable(metric, isBoy), month);
  if (!ref) return null;
  const low = metric === 'weight' ? 'Nhẹ cân so với chuẩn' : 'Thấp so với chuẩn';
  const high = metric === 'weight' ? 'Nặng cân so với chuẩn' : 'Cao vượt chuẩn';
  if (value < ref.P3) return { label: low, tone: 'low' };
  if (value < ref.P15) return { label: metric === 'weight' ? 'Hơi nhẹ cân' : 'Hơi thấp', tone: 'watch' };
  if (value <= ref.P85) return { label: 'Trong mức chuẩn', tone: 'normal' };
  if (value <= ref.P97) return { label: metric === 'weight' ? 'Hơi nặng cân' : 'Hơi cao', tone: 'watch' };
  return { label: high, tone: 'low' };
}

/** Tuổi tính theo tháng (có phần lẻ) tại một thời điểm, cùng cách tính 30.44 ngày/tháng với backend. */
export function ageInMonths(dateOfBirth: Date, at: Date): number {
  return (at.getTime() - dateOfBirth.getTime()) / (30.44 * 24 * 60 * 60 * 1000);
}
