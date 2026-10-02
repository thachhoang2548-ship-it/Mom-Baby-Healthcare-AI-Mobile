import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ENDPOINTS } from './endpoints';

export const STORAGE_KEYS = {
  TOKEN: '@momoi_token',
  REFRESH_TOKEN: '@momoi_refresh_token',
  USER: '@momoi_user',
  TIER: '@momoi_tier',
};

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Token from AsyncStorage
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[AxiosClient] Error retrieving token from AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize response format & Handle 401 token refresh
axiosClient.interceptors.response.use(
  (response) => {
    if (response?.data && typeof response.data === 'object') {
      const data = response.data;
      if (data.success !== undefined && data.isSuccess === undefined) {
        data.isSuccess = data.success;
      } else if (data.isSuccess !== undefined && data.success === undefined) {
        data.success = data.isSuccess;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data;
      if (data.success !== undefined && data.isSuccess === undefined) {
        data.isSuccess = data.success;
      } else if (data.isSuccess !== undefined && data.success === undefined) {
        data.success = data.isSuccess;
      }
    }

    const status = error.response?.status;

    // Handle 401 Unauthorized (Auto Token Refresh)
    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/api/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await AsyncStorage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN
        );

        if (!storedRefreshToken) {
          isRefreshing = false;
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.TIER,
          ]);
          return Promise.reject(error);
        }

        const refreshRes = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.REFRESH}`,
          { refreshToken: storedRefreshToken }
        );

        const resData = refreshRes.data;
        const isSuccess =
          resData && (resData.isSuccess || resData.success || resData.Success);

        if (isSuccess && resData.data) {
          const { token, refreshToken, user } = resData.data;

          await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
          if (refreshToken) {
            await AsyncStorage.setItem(
              STORAGE_KEYS.REFRESH_TOKEN,
              refreshToken
            );
          }
          if (user) {
            await AsyncStorage.setItem(
              STORAGE_KEYS.USER,
              JSON.stringify(user)
            );
          }

          processQueue(null, token);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'));
          isRefreshing = false;
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.TIER,
          ]);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr);
        isRefreshing = false;
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
          STORAGE_KEYS.TIER,
        ]);
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
