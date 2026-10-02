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

  logout: async (): Promise<ApiResponse<unknown>> => {
    const res = await axiosClient.post(ENDPOINTS.LOGOUT);
    return res.data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponseDto>> => {
    const res = await axiosClient.post(ENDPOINTS.REFRESH, { refreshToken });
    return res.data;
  },
};

export default authService;
