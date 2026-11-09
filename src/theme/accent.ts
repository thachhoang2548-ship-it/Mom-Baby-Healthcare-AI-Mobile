import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Màu chủ đạo của app đổi theo bé: có hồ sơ bé trai thì màu xanh, còn lại màu hồng mặc định.
 * Mẹ không chọn màu bằng tay; màu theo bé đang chọn ở tab Bé yêu.
 * Các màu khác (kem, xanh lá, cam, màu báo lỗi) giữ nguyên ở theme/colors.ts.
 * Bảng màu hồng trùng với màu cũ nên giao diện của bé gái và khi chưa có bé không đổi.
 */
export type AccentKey = 'pink' | 'blue';

export interface Accent {
  key: AccentKey;
  /** Nút chính, chữ nhấn, tab đang chọn. */
  primary: string;
  /** Chữ đậm trên nền nhạt của màu chủ đạo. */
  primaryDark: string;
  primaryMid: string;
  /** Viền, vạch tiến độ, nền công tắc đang bật. */
  tint: string;
  /** Viền nhạt. */
  border: string;
  /** Nền rất nhạt. */
  light: string;
  /** Nền nhạt, đậm hơn `light` một chút. */
  soft: string;
  gradient: [string, string];
}

export const ACCENTS: Record<AccentKey, Accent> = {
  pink: {
    key: 'pink',
    primary: '#C97A95',
    primaryDark: '#B85B7A',
    primaryMid: '#D4869C',
    tint: '#E8B4C4',
    border: '#F2D0DC',
    light: '#FFF0F5',
    soft: '#FBE8EF',
    gradient: ['#E8B4C4', '#C97A95'],
  },
  blue: {
    key: 'blue',
    primary: '#4F84BA',
    primaryDark: '#3A6A9C',
    primaryMid: '#6896C6',
    tint: '#A9C7E6',
    border: '#CFE1F3',
    light: '#EEF5FC',
    soft: '#DEEBF8',
    gradient: ['#A9C7E6', '#4F84BA'],
  },
};

type BabyGender = 'boy' | 'girl';

const STORAGE_KEY = '@momoi_theme';

interface ThemeState {
  babyId: string | null;
  /** Giới tính bé đang chọn; null khi chưa có hồ sơ bé. */
  babyGender: BabyGender | null;
  initTheme: () => Promise<void>;
  /** Gọi khi mẹ chọn bé khác hoặc khi tải danh sách bé. `null` khi chưa có bé. */
  setActiveBaby: (baby: { id: string; gender: number | string } | null) => Promise<void>;
  /** Đăng xuất: bỏ bé của tài khoản cũ. */
  clearBaby: () => Promise<void>;
}

const persist = (s: Pick<ThemeState, 'babyId' | 'babyGender'>) =>
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s)).catch(() => undefined);

export const useThemeStore = create<ThemeState>((set, get) => ({
  babyId: null,
  babyGender: null,

  // Đọc bé đã chọn lần trước để mở app là đúng màu ngay, không đợi tải danh sách bé.
  initTheme: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      set({
        babyId: typeof saved.babyId === 'string' ? saved.babyId : null,
        babyGender: saved.babyGender === 'boy' || saved.babyGender === 'girl' ? saved.babyGender : null,
      });
    } catch {
      // Dùng màu mặc định.
    }
  },

  setActiveBaby: async (baby) => {
    const babyId = baby ? String(baby.id) : null;
    const babyGender: BabyGender | null = baby ? (Number(baby.gender) === 0 ? 'boy' : 'girl') : null;
    if (get().babyId === babyId && get().babyGender === babyGender) return;
    set({ babyId, babyGender });
    await persist({ babyId, babyGender });
  },

  clearBaby: async () => {
    set({ babyId: null, babyGender: null });
    await persist({ babyId: null, babyGender: null });
  },
}));

/** Bé trai: xanh. Bé gái hoặc chưa có bé: hồng (màu mặc định). */
export function useAccentKey(): AccentKey {
  return useThemeStore((s) => (s.babyGender === 'boy' ? 'blue' : 'pink'));
}

export function useAccent(): Accent {
  return ACCENTS[useAccentKey()];
}

/**
 * Tạo style theo màu chủ đạo. Style của cả hai màu được tạo sẵn một lần,
 * component chỉ chọn bộ đúng nên đổi màu không phải tạo lại style.
 *
 *   const useStyles = createThemedStyles((a) => ({ button: { backgroundColor: a.primary } }));
 *   const styles = useStyles();
 */
export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(factory: (a: Accent) => T) {
  let cache: Record<AccentKey, T> | null = null;
  return function useThemedStyles(): T {
    const key = useAccentKey();
    return useMemo(() => {
      if (!cache) {
        cache = {
          pink: StyleSheet.create(factory(ACCENTS.pink)),
          blue: StyleSheet.create(factory(ACCENTS.blue)),
        };
      }
      return cache[key];
    }, [key]);
  };
}
