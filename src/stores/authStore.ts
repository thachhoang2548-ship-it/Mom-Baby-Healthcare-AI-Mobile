import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { UserDto } from '../services/authService';
import featureService from '../services/featureService';
import { STORAGE_KEYS } from '../api/axiosClient';
import { tr } from '../i18n';
import { getApiErrorMessage } from '../utils/apiError';
import { useThemeStore } from '../theme/accent';

export type TierType = 'Free' | 'MomHienDai' | 'SuperMomVip';

export const mapTier = (tierValue?: number | string | null): TierType => {
  if (tierValue === 1 || tierValue === 'MomHienDai') return 'MomHienDai';
  if (tierValue === 2 || tierValue === 'SuperMomVip') return 'SuperMomVip';
  return 'Free';
};

export const getTierDisplayName = (tier: TierType): string => {
  switch (tier) {
    case 'MomHienDai':
      return 'Mẹ Hiện Đại';
    case 'SuperMomVip':
      return 'Super Mom VIP';
    default:
      return tr('Hội viên miễn phí', 'Free plan');
  }
};

interface AuthState {
  user: UserDto | null;
  token: string | null;
  refreshToken: string | null;
  tier: TierType;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    email: string,
    pass: string,
    fullName: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  /** Xóa phiên trong bộ nhớ khi refresh token hết hạn (storage đã được axiosClient xóa). */
  clearSession: () => void;
  clearError: () => void;
  /** Cập nhật gói theo server (gói được nâng cấp trên web, app không bán gói). */
  setTier: (tier: TierType) => Promise<void>;
  /** Hỏi lại server gói hiện tại; lỗi mạng thì giữ gói đang có. */
  refreshTier: () => Promise<void>;
  /** Đổi họ tên trên server rồi lưu lại user đã cập nhật. Lỗi được ném ra để màn hình hiển thị. */
  updateFullName: (fullName: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  tier: 'Free',
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  setTier: async (tier) => {
    set({ tier });
    await AsyncStorage.setItem(STORAGE_KEYS.TIER, tier).catch(() => undefined);
  },

  refreshTier: async () => {
    try {
      const data = await featureService.getPaymentHistory();
      if (!data?.currentTier) return;
      const tier = mapTier(data.currentTier);
      set({ tier });
      await AsyncStorage.setItem(STORAGE_KEYS.TIER, tier);
    } catch {
      // Giữ gói đang có; server vẫn tự chặn chức năng nếu gói không đủ.
    }
  },

  updateFullName: async (fullName) => {
    const res = await authService.updateName(fullName.trim());
    if (!(res.isSuccess || res.success) || !res.data) {
      throw new Error(res.message || tr('Chưa cập nhật được họ và tên.', 'Could not update your name.'));
    }
    // Giữ các trường app đang có (role...) nếu server không trả về.
    const user = { ...get().user, ...res.data };
    set({ user });
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)).catch(() => undefined);
  },

  clearSession: () =>
    set({
      user: null,
      token: null,
      refreshToken: null,
      tier: 'Free',
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),

  initAuth: async () => {
    try {
      const [token, refreshToken, userJson, tierStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TIER),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        const tier = (tierStr as TierType) || mapTier(user.tier);
        set({
          token,
          refreshToken,
          user,
          tier,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch (e) {
      console.warn('[useAuthStore] Error loading stored auth', e);
    }
    set({ isLoading: false, isAuthenticated: false });
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(email.trim(), pass);
      const isSuccess = res && (res.isSuccess || res.success);

      if (isSuccess && res.data) {
        const { token, refreshToken, user } = res.data;
        const tier = mapTier(user?.tier);

        await AsyncStorage.multiSet([
          [STORAGE_KEYS.TOKEN, token],
          [STORAGE_KEYS.REFRESH_TOKEN, refreshToken || ''],
          [STORAGE_KEYS.USER, JSON.stringify(user)],
          [STORAGE_KEYS.TIER, tier],
        ]);

        set({
          token,
          refreshToken,
          user,
          tier,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      }

      const msg = res.message || tr('Đăng nhập không thành công.', 'Sign-in failed.');
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    } catch (err) {
      // Mất mạng thì báo đúng là mất mạng thay vì "Network Error" của axios.
      const msg = getApiErrorMessage(
        err,
        tr('Không thể kết nối đến máy chủ. Vui lòng thử lại.', 'Could not reach the server. Please try again.')
      );
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  register: async (email: string, pass: string, fullName: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(email.trim(), pass, fullName.trim());
      const isSuccess = res && (res.isSuccess || res.success);

      if (isSuccess) {
        set({ isLoading: false, error: null });
        return {
          success: true,
          message: res.message || tr('Đăng ký thành công. Hãy đăng nhập.', 'Account created. Please sign in.'),
        };
      }

      const msg = res.message || tr('Đăng ký thất bại.', 'Sign-up failed.');
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    } catch (err) {
      const msg = getApiErrorMessage(err, tr('Không thể hoàn tất đăng ký.', 'Could not finish signing up.'));
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  logout: async () => {
    try {
      // Lấy token từ storage: interceptor cập nhật storage khi refresh, không cập nhật store.
      const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      await authService.logout(storedRefreshToken).catch(() => {});
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TIER,
      ]);
      // Màu theo bé của tài khoản cũ không áp cho người đăng nhập sau.
      await useThemeStore.getState().clearBaby();
      set({
        user: null,
        token: null,
        refreshToken: null,
        tier: 'Free',
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));

/** Chỉ báo hiển thị (dấu khóa); quyền thật luôn do server kiểm tra (403). */
export const useIsFreeTier = () => useAuthStore((s) => s.tier === 'Free');
