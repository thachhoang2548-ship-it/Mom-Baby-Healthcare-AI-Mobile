import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from './authService';

export interface GrowthRecord {
  id?: string | number;
  weightKg: number;
  heightCm: number;
  recordedAt?: string;
}

export interface BabyProfileDto {
  id: string;
  userId?: string;
  name?: string;
  babyName: string;
  dateOfBirth: string;
  birthDate?: string;
  gender: number | string; // 0: Boy, 1: Girl
  currentWeightKg?: number;
  currentHeightCm?: number;
  ageMonths?: number;
  allergies?: string[];
  foodHistory?: string[];
  growthRecords?: GrowthRecord[];
}

export interface MealItem {
  name_vi?: string;
  name_en?: string;
  description?: string;
  texture?: string;
  prep_time_min?: number;
  total_calories?: number;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
  ingredients?: { ingredient: { vietnamese_name?: string; english_name?: string }; weight_grams?: number }[];
  cooking_steps?: { step: number; instruction: string; duration?: string }[];
  allergens?: string[];
}

export interface DailyMenuDto {
  meals?: {
    breakfast?: MealItem | null;
    lunch?: MealItem | null;
    snack?: MealItem | null;
    dinner?: MealItem | null;
    supplementary_snack?: MealItem | null;
  };
  nutrition_totals?: {
    calories?: number;
    protein_g?: number;
    fat_g?: number;
    carbs_g?: number;
    iron_mg?: number;
  };
  coverage_pct?: {
    calories?: number;
    protein_g?: number;
    fat_g?: number;
    carbs_g?: number;
  };
  goals?: {
    calories?: number;
    protein_g?: number;
    fat_g?: number;
    carbs_g?: number;
    iron_mg?: number;
  };
}

/** Thực đơn 7 ngày: mỗi ngày cùng cấu trúc với thực đơn ngày, kèm cờ đạt 80% mục tiêu. */
export interface WeeklyMenuDto {
  days: (DailyMenuDto & { meets_80pct?: boolean })[];
}

export interface BabyFormData {
  babyName: string;
  dateOfBirth: string;
  gender: number | string;
  currentWeightKg?: number | null;
  currentHeightCm?: number | null;
  allergies?: string[];
  foodHistory?: string[];
}

/** Kết quả đánh giá tăng trưởng theo chuẩn WHO do backend trả về. */
export interface GrowthEvaluation {
  isHealthy: boolean;
  weightStatus: string; // Underweight | Normal | Overweight
  heightStatus: string; // Short | Normal | Tall
  feedback: string;
}

const toBabyPayload = (babyData: BabyFormData) => ({
  babyName: babyData.babyName,
  dateOfBirth: babyData.dateOfBirth,
  gender:
    babyData.gender === 0 ||
    babyData.gender === 'boy' ||
    (babyData.gender || '').toString().toLowerCase() === 'male'
      ? 0
      : 1,
  currentWeightKg: babyData.currentWeightKg ? Number(babyData.currentWeightKg) : null,
  currentHeightCm: babyData.currentHeightCm ? Number(babyData.currentHeightCm) : null,
  allergies: babyData.allergies || [],
  foodHistory: babyData.foodHistory || [],
});

const babyService = {
  getProfiles: async (): Promise<ApiResponse<BabyProfileDto[]>> => {
    const response = await axiosClient.get(ENDPOINTS.BABY_PROFILES);
    const isSuccessful =
      response.data &&
      (response.data.isSuccess || response.data.success || response.data.Success);

    if (isSuccessful && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((b: any) => ({
        id: b.id,
        userId: b.userId,
        name: b.babyName || '',
        babyName: b.babyName || '',
        gender:
          b.gender === 0 ||
          (b.gender || '').toString().toLowerCase() === 'male' ||
          b.gender === 'boy'
            ? 0
            : 1,
        birthDate: b.dateOfBirth,
        dateOfBirth: b.dateOfBirth,
        ageMonths: b.ageMonths ?? 0,
        // Không gán số mặc định: hồ sơ chưa có cân nặng/chiều cao thì để trống.
        currentWeightKg: b.currentWeightKg ?? undefined,
        currentHeightCm: b.currentHeightCm ?? undefined,
        allergies: b.allergies || [],
        foodHistory: b.foodHistory || [],
        growthRecords: b.growthRecords || [],
      }));
      response.data.isSuccess = true;
      response.data.success = true;
    }
    return response.data;
  },

  createProfile: async (babyData: BabyFormData): Promise<ApiResponse<BabyProfileDto>> => {
    const response = await axiosClient.post(ENDPOINTS.CREATE_BABY, toBabyPayload(babyData));
    return response.data;
  },

  /** PUT ghi đè tên, ngày sinh, giới tính, chỉ số, dị ứng và lịch sử món ăn. */
  updateProfile: async (
    babyId: string | number,
    babyData: BabyFormData
  ): Promise<ApiResponse<BabyProfileDto>> => {
    const response = await axiosClient.put(ENDPOINTS.UPDATE_BABY(babyId), toBabyPayload(babyData));
    return response.data;
  },

  /** recordedAt mặc định là lúc gọi; truyền ngày đo khi mẹ ghi lại số liệu cũ. */
  logGrowth: async (
    babyId: string | number,
    weightKg: number,
    heightCm: number,
    recordedAt: string = new Date().toISOString()
  ): Promise<ApiResponse<GrowthEvaluation>> => {
    const response = await axiosClient.post(ENDPOINTS.LOG_GROWTH(babyId), {
      weightKg: parseFloat(weightKg.toString()),
      heightCm: parseFloat(heightCm.toString()),
      recordedAt,
    });
    return response.data;
  },

  deleteGrowth: async (babyId: string | number, recordId: string | number): Promise<ApiResponse<unknown>> => {
    const response = await axiosClient.delete(ENDPOINTS.DELETE_GROWTH(babyId, recordId));
    return response.data;
  },

  getWeeklyMenu: async (
    babyId: string | number,
    forceRefresh: boolean = false
  ): Promise<ApiResponse<WeeklyMenuDto>> => {
    const response = await axiosClient.get(ENDPOINTS.WEEKLY_MENU(babyId), {
      params: forceRefresh ? { force: true } : undefined,
    });
    return response.data;
  },

  getDailyMenu: async (
    babyId: string | number,
    forceRefresh: boolean = false
  ): Promise<ApiResponse<DailyMenuDto>> => {
    const url = `${ENDPOINTS.DAILY_MENU(babyId)}${
      forceRefresh ? '?force=true' : ''
    }`;
    const response = await axiosClient.get(url);
    return response.data;
  },
};

export default babyService;
