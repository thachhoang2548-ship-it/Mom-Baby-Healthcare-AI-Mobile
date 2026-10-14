import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

export interface UserDto {
  id?: string;
  email: string;
  fullName?: string;
  tier?: number | string;
  tierExpiresAt?: string | null;
  role?: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  user: UserDto;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  success: boolean;
  message?: string;
  data: T;
}

const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponseDto>> => {
    const res = await axiosClient.post(ENDPOINTS.LOGIN, { email, password });
    return res.data;
  },

  register: async (email: string, password: string, fullName: string): Promise<ApiResponse<AuthResponseDto>> => {
    const res = await axiosClient.post(ENDPOINTS.REGISTER, { email, password, fullName });
    return res.data;
  },

  /** Gửi refresh token để chỉ đăng xuất thiết bị này; không gửi thì backend đăng xuất mọi thiết bị. */
  logout: async (refreshToken?: string | null): Promise<ApiResponse<unknown>> => {
    const res = await axiosClient.post(ENDPOINTS.LOGOUT, refreshToken ? { refreshToken } : undefined);
    return res.data;
  },

  /** Xóa vĩnh viễn tài khoản và dữ liệu; backend xác nhận lại bằng mật khẩu. */
  deleteAccount: async (password: string): Promise<ApiResponse<unknown>> => {
    const res = await axiosClient.delete(ENDPOINTS.DELETE_ACCOUNT, { data: { password } });
    return res.data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponseDto>> => {
    const res = await axiosClient.post(ENDPOINTS.REFRESH, { refreshToken });
    return res.data;
  },
};

export default authService;
