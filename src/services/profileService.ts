import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from './authService';

export type StageIndex = 0 | 1 | 2;

/** Backend trả enum dạng chuỗi (PrePregnancy/Pregnant/Postpartum), web gửi lên dạng số. */
export function getStageIndex(stage?: number | string | null): StageIndex {
  if (stage === 1 || stage === 'Pregnant') return 1;
  if (stage === 2 || stage === 'Postpartum') return 2;
  return 0;
}

export interface MomProfileDto {
  id?: number;
  userId?: string;
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

  /** PUT cập nhật một phần: trường không gửi giữ nguyên, trường gửi null sẽ bị xóa. */
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
};

export default profileService;
