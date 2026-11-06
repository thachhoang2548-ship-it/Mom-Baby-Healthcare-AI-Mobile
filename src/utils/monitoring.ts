/** Backend lưu lượng nước theo lít (2,5 lít = 100% mục tiêu), app hiển thị theo ly 250 ml. */
export const LITERS_PER_CUP = 0.25;
export const DAILY_CUP_GOAL = 10;

export function cupsFromLiters(liters?: number | null): number {
  if (!liters || liters <= 0) return 0;
  return Math.round(liters / LITERS_PER_CUP);
}

// Thang 1-5 giống web (MoodForm / SleepForm). `label` tiếng Việt được lưu làm moodNote lên server;
// `labelEn` chỉ để hiển thị khi app dùng tiếng Anh.
export const MOOD_OPTIONS = [
  { score: 1, emoji: '😣', label: 'Rất mệt', labelEn: 'Exhausted' },
  { score: 2, emoji: '😕', label: 'Không vui', labelEn: 'Low' },
  { score: 3, emoji: '🙂', label: 'Bình thường', labelEn: 'Okay' },
  { score: 4, emoji: '😄', label: 'Vui vẻ', labelEn: 'Happy' },
  { score: 5, emoji: '🤩', label: 'Tuyệt vời', labelEn: 'Great' },
];

export const SLEEP_QUALITY_OPTIONS = [
  { score: 1, emoji: '😞', label: 'Rất tệ' },
  { score: 2, emoji: '😐', label: 'Chập chờn' },
  { score: 3, emoji: '🙂', label: 'Tạm ổn' },
  { score: 4, emoji: '😊', label: 'Ngon giấc' },
  { score: 5, emoji: '😴', label: 'Rất sâu' },
];
