import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { UserDto } from '../services/authService';
import { STORAGE_KEYS } from '../api/axiosClient';

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
      return 'Hội viên miễn phí';
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
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  tier: 'Free',
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

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

      const msg = res.message || 'Đăng nhập không thành công.';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể kết nối đến máy chủ. Vui lòng thử lại.';
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
          message: res.message || 'Đăng ký thành công. Hãy đăng nhập.',
        };
      }

      const msg = res.message || 'Đăng ký thất bại.';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể hoàn tất đăng ký.';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  logout: async () => {
    try {
      await authService.logout().catch(() => {});
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TIER,
      ]);
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
