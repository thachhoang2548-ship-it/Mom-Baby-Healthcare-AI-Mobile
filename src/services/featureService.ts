import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

const unwrap = (data: any) => data?.data ?? data;

export const TIERS_DATA = {
  MomHienDai: {
    id: 'MomHienDai',
    name: 'Mẹ Hiện Đại',
    monthlyPrice: '99.000d',
    sixMonthPrice: '499.000d',
    features: [
      'IVF timeline thong minh',
      'Thuc don dinh duong 7 ngay',
      'Bai tap an toan theo thai ky',
      'Danh gia EPDS sau sinh',
    ],
  },
  SuperMomVip: {
    id: 'SuperMomVip',
    name: 'Super Mom VIP',
    monthlyPrice: '199.000d',
    sixMonthPrice: '999.000d',
    features: [
      'Toan bo dac quyen Me Hien Dai',
      'Nhat ky cam xuc AI',
      'Uu tien ket noi chuyen gia',
      'Care Staff dong hanh 24/7',
    ],
  },
};

const PLAN_CODES = {
  MomHienDai: {
    1: 'HD_1M',
    6: 'HD_6M',
  },
  SuperMomVip: {
    1: 'VIP_1M',
    6: 'VIP_6M',
  },
};

type TierId = keyof typeof PLAN_CODES;
type PlanMonths = 1 | 6;

const featureService = {
  sendChatMessage: async (text: string, sessionId = 'mobile-default') => {
    const response = await axiosClient.post(ENDPOINTS.CHAT_SEND, { text, sessionId });
    return unwrap(response.data);
  },

  getTodayMonitoring: async () => {
    const response = await axiosClient.get(ENDPOINTS.DAILY_MONITORING_TODAY);
    return unwrap(response.data);
  },

  getNotifications: async () => {
    const response = await axiosClient.get(ENDPOINTS.ALERTS);
    return unwrap(response.data);
  },

  createDailyMonitoring: async (payload: Record<string, any>) => {
    const response = await axiosClient.post(ENDPOINTS.DAILY_MONITORING, payload);
    return unwrap(response.data);
  },

  getMedications: async () => {
    const response = await axiosClient.get(ENDPOINTS.MEDICATIONS);
    return unwrap(response.data);
  },

  addMedication: async (payload: Record<string, any>) => {
    const response = await axiosClient.post(ENDPOINTS.MEDICATIONS, payload);
    return unwrap(response.data);
  },

  deleteMedication: async (id: string | number) => {
    const response = await axiosClient.delete(`${ENDPOINTS.MEDICATIONS}/${id}`);
    return unwrap(response.data);
  },

  logCycle: async (periodStartDate: string, cycleLength = 28, symptoms: string[] = []) => {
    const normalizedDate = new Date(`${periodStartDate}T00:00:00.000Z`).toISOString();
    const response = await axiosClient.post(ENDPOINTS.FERTILITY_CYCLE_LOG, {
      periodStartDate: normalizedDate,
      cycleLength: Number(cycleLength),
      symptoms,
    });
    return unwrap(response.data);
  },

  getOvulationToday: async () => {
    const response = await axiosClient.get(ENDPOINTS.FERTILITY_OVULATION_TODAY);
    return unwrap(response.data);
  },

  createIvfTimeline: async (ivfStartDate: string, protocol = 'long') => {
    const response = await axiosClient.post(ENDPOINTS.FERTILITY_IVF_TIMELINE, {
      ivfStartDate,
      protocol,
    });
    return unwrap(response.data);
  },

  getPregnancyThisWeek: async () => {
    const response = await axiosClient.get(ENDPOINTS.PREGNANCY_THIS_WEEK);
    return unwrap(response.data);
  },

  getPregnancyMealPlan: async () => {
    const response = await axiosClient.get(ENDPOINTS.PREGNANCY_MEAL_PLAN);
    return unwrap(response.data);
  },

  getExercisePlan: async () => {
    const response = await axiosClient.get(ENDPOINTS.PREGNANCY_EXERCISE_PLAN);
    return unwrap(response.data);
  },

  logPregnancyWeight: async (weightKg: number) => {
    const response = await axiosClient.post(ENDPOINTS.PREGNANCY_WEIGHT_LOG, {
      weightKg,
      date: new Date().toISOString(),
    });
    return unwrap(response.data);
  },

  submitEpds: async (answers: number[]) => {
    const response = await axiosClient.post(ENDPOINTS.POSTPARTUM_EPDS, { answers });
    return unwrap(response.data);
  },

  getLatestEpds: async () => {
    const response = await axiosClient.get(ENDPOINTS.POSTPARTUM_EPDS_LATEST);
    return unwrap(response.data);
  },

  getRecoveryPlan: async () => {
    const response = await axiosClient.get(ENDPOINTS.POSTPARTUM_RECOVERY_PLAN);
    return unwrap(response.data);
  },

  createPayment: async (targetTier: TierId, months: PlanMonths) => {
    const response = await axiosClient.post(ENDPOINTS.PAYMENT_CREATE, {
      planCode: PLAN_CODES[targetTier][months],
      provider: 'BankTransfer',
    });
    return unwrap(response.data);
  },

  getPaymentHistory: async () => {
    const response = await axiosClient.get(ENDPOINTS.PAYMENT_HISTORY);
    return unwrap(response.data);
  },

  getSymptomHistory: async () => {
    const response = await axiosClient.get(ENDPOINTS.SYMPTOMS);
    return unwrap(response.data);
  },

  generateRecipes: async (preferences: {
    dietType?: string;
    allergies?: string;
    maxCookTime?: string | number;
    availableIngredients?: string;
  }) => {
    const query = `Chế độ ăn: ${preferences.dietType || 'Thường'}, Dị ứng: ${
      preferences.allergies || 'Không'
    }, Thời gian nấu tối đa: ${
      preferences.maxCookTime || 30
    } phút, Nguyên liệu có sẵn: ${preferences.availableIngredients || 'Không'}`;
    const response = await axiosClient.post(ENDPOINTS.AI_RECIPES, { query });
    return unwrap(response.data);
  },

  getMyRecipes: async () => {
    const response = await axiosClient.get(ENDPOINTS.MY_RECIPES);
    return unwrap(response.data);
  },

  sendFeedback: async (payload: Record<string, any>) => {
    const response = await axiosClient.post(ENDPOINTS.FEEDBACK, payload);
    return unwrap(response.data);
  },
};

export default featureService;
