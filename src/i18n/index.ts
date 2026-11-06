import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

/**
 * Song ngữ Việt / Anh cho các màn chính (màn khách, đăng nhập, 5 tab, Hồ sơ).
 * Mỗi chuỗi viết cặp ngay tại chỗ dùng: t('Tổng quan', 'Overview'), để màn nào chưa dịch
 * vẫn chạy tiếng Việt. Nội dung server trả về (thực đơn, lộ trình, kết quả AI, lỗi) vẫn là tiếng Việt.
 */
export type Lang = 'vi' | 'en';

const STORAGE_KEY = '@momoi_lang';

/** Máy đặt tiếng Việt thì dùng tiếng Việt, mọi ngôn ngữ khác dùng tiếng Anh. */
const deviceLang = (): Lang => {
  try {
    return getLocales()[0]?.languageCode === 'vi' ? 'vi' : 'en';
  } catch {
    return 'vi';
  }
};

interface LanguageState {
  lang: Lang;
  /** Đọc lựa chọn đã lưu; chưa chọn bao giờ thì theo ngôn ngữ của máy. */
  initLang: () => Promise<void>;
  setLang: (lang: Lang) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: deviceLang(),

  initLang: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'vi' || stored === 'en') set({ lang: stored });
    } catch {
      // Giữ ngôn ngữ của máy.
    }
  },

  setLang: async (lang) => {
    set({ lang });
    await AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => undefined);
  },
}));

/** Dùng trong component: tự vẽ lại khi đổi ngôn ngữ. */
export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return (vi: string, en: string) => (lang === 'en' ? en : vi);
}

/** Dùng ngoài component (Alert trong callback, store, util). */
export function tr(vi: string, en: string) {
  return useLanguageStore.getState().lang === 'en' ? en : vi;
}
