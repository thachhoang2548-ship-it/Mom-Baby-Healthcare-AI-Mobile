import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from './authService';

export interface MomProfileDto {
  id?: string;
  stage?: number | string; // 0: PrePregnancy, 1: Pregnant, 2: Postpartum
  pregnancyWeek?: number | null;
  trimester?: number | null;
  height?: number | string | null;
  weight?: number | string | null;
  bmi?: number | string | null;
  bloodSugarLevel?: number | string | null;
  hasGestDiabetes?: boolean;
  avgCycleLength?: number | string | null;
  lastPeriodDate?: string | null;
  deliveryDate?: string | null;
  isBreastfeeding?: boolean;
  medicalConditions?: string[];
}

const profileService = {
  getProfile: async (): Promise<ApiResponse<MomProfileDto>> => {
    const res = await axiosClient.get(ENDPOINTS.USER_PROFILE);
    return res.data;
  },

  updateProfile: async (profileData: Partial<MomProfileDto>): Promise<ApiResponse<MomProfileDto>> => {
    const res = await axiosClient.put(ENDPOINTS.USER_PROFILE, profileData);
    return res.data;
  },

  setupPregnancy: async (lastMenstrualPeriod: string, dueDate?: string | null): Promise<ApiResponse<unknown>> => {
    const res = await axiosClient.post(ENDPOINTS.SETUP_PREGNANCY, {
      lastMenstrualPeriod,
      dueDate,
    });
    return res.data;
  },

  logWeight: async (weightKg: number): Promise<ApiResponse<unknown>> => {
    const res = await axiosClient.post(ENDPOINTS.LOG_WEIGHT, { weightKg });
    return res.data;
  },
};

export default profileService;
