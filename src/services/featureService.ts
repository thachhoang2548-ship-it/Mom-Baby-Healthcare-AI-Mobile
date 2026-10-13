import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Trả về `data` của ApiResponse. Một số endpoint trả HTTP 200 nhưng `success: false`,
 * nên phải ném lỗi ở đây thay vì coi như thành công.
 */
async function call<T = any>(request: Promise<AxiosResponse<any>>): Promise<T> {
  const res = await request;
  const body = res.data;
  if (body && typeof body === 'object' && ('success' in body || 'isSuccess' in body)) {
    if (body.success === false || body.isSuccess === false) {
      throw new Error(body.message || 'Thao tác không thành công.');
    }
    return body.data as T;
  }
  return body as T;
}

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

// ── Kiểu dữ liệu theo DTO của backend (Swagger) ──

export interface DailyMonitoringPayload {
  date?: string;
  sleepHours?: number;
  sleepQuality?: number; // 1-5
  waterLiters?: number;
  hadBreakfast?: boolean;
  hadLunch?: boolean;
  hadDinner?: boolean;
  moodScore?: number; // 1-5
  moodNote?: string;
  bloodSugar?: number;
  bloodPressureHigh?: number;
  bloodPressureLow?: number;
  weight?: number;
  symptomSeverity?: number; // 0-5
  symptomNote?: string;
}

export interface DailyMonitoringLog extends DailyMonitoringPayload {
  id: number;
  date: string;
}

export interface TodayMonitoring {
  data: DailyMonitoringLog | null;
  hasSubmittedToday: boolean;
}

export interface MedicationAdherenceLog {
  id: number;
  date: string;
  status: string; // "Taken" | "Skipped"
}

export interface MedicationSchedule {
  id: number;
  medName: string;
  dosage: string;
  times: string[];
  startDate: string;
  endDate: string;
  notes?: string | null;
  adherenceLogs?: MedicationAdherenceLog[];
}

export interface MedicationPayload {
  medName: string;
  dosage: string;
  times: string[]; // "HH:mm"
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface NotificationAlert {
  id: number;
  type: string; // Symptom | Medication | RoutineCheck
  severity: string; // Critical | High | Medium | Warning | Info | Positive
  message: string;
  status: string; // Pending | Sent | Resolved
  createdAt: string;
}

export interface PregnancyWeekInfo {
  week: number;
  babySize?: string;
  development?: string;
  momTips?: string;
}

export interface PregnancyWeightLog {
  week: number;
  weight: number;
  recordedAt: string;
}

export interface WeightLogResult {
  weeklyGain?: number;
  totalGain?: number;
  recommendation?: string;
}

export interface FertilityCalendar {
  fertileWindowDays: string[];
  ovulationDay: string;
  periodPrediction: string;
}

export interface OvulationToday {
  isInFertileWindow: boolean;
  daysUntilOvulation: number;
  recommendation?: string;
}

export interface EpdsResult {
  score: number;
  isUrgent: boolean;
  aiMessage?: string;
  resources?: string[];
}

export interface LatestEpds {
  score: number;
  isUrgent: boolean;
  takenAt: string | null;
  aiAnalysis?: string;
}

export interface PostpartumSetupResult {
  daysPostpartum: number;
  recoveryPhase: string;
  initialRecommendations: string;
}

export interface RecoveryPlan {
  day: number;
  recoveryPhase: string;
  exerciseSchedule?: {
    week?: number;
    activeExercise?: string;
    allowed?: string[];
    locked?: string[];
  };
}

export interface PregnancyMealDay {
  day: string;
  breakfast?: string;
  lunch?: string;
  snack?: string;
  dinner?: string;
  dailyNutrients?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
    iron?: string;
  };
}

export interface ExercisePlan {
  trimester: number;
  exercises: { name: string; reps?: string; duration?: string }[];
}

export interface IvfMilestone {
  dayNumber: number;
  date: string;
  title: string;
  description: string;
}

export interface RecipeDto {
  id: number;
  category: 'Mom' | 'Baby' | string;
  title: string;
  description?: string;
  ingredientsJson?: string;
  stepsJson?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  prepTimeMinutes?: number;
  difficulty?: string; // Easy | Medium | Hard
  isSaved: boolean;
  status: string; // PendingReview | Approved | Rejected
  expertNote?: string | null;
  generatedAt?: string;
}

export interface FeedbackCategory {
  value: string;
  label: string;
}

const featureService = {
  // Theo dõi hằng ngày
  getTodayMonitoring: () =>
    call<TodayMonitoring>(axiosClient.get(ENDPOINTS.DAILY_MONITORING_TODAY)),

  getMonitoringHistory: (limit = 14) =>
    call<DailyMonitoringLog[]>(
      axiosClient.get(ENDPOINTS.DAILY_MONITORING_HISTORY, { params: { limit } })
    ),

  /** Backend gộp theo ngày: chỉ ghi đè các trường được gửi lên. */
  saveDailyMonitoring: (payload: DailyMonitoringPayload) =>
    call<DailyMonitoringLog>(axiosClient.post(ENDPOINTS.DAILY_MONITORING, payload)),

  // Thông báo
  getNotifications: () => call<NotificationAlert[]>(axiosClient.get(ENDPOINTS.ALERTS)),

  resolveNotification: (id: number) =>
    call(axiosClient.patch(ENDPOINTS.ALERT_STATUS(id), { status: 'Resolved' })),

  // Lịch uống thuốc
  getMedications: () => call<MedicationSchedule[]>(axiosClient.get(ENDPOINTS.MEDICATIONS)),

  addMedication: (payload: MedicationPayload) =>
    call<MedicationSchedule>(axiosClient.post(ENDPOINTS.MEDICATIONS, payload)),

  deleteMedication: (id: number) => call(axiosClient.delete(`${ENDPOINTS.MEDICATIONS}/${id}`)),

  logAdherence: (id: number, dateIso: string, status: 'taken' | 'skipped') =>
    call(axiosClient.post(ENDPOINTS.MEDICATION_ADHERENCE(id), { date: dateIso, status })),

  // Chuẩn bị mang thai
  logCycle: (periodStartIso: string, cycleLength = 28, symptoms: string[] = []) =>
    call(
      axiosClient.post(ENDPOINTS.FERTILITY_CYCLE_LOG, {
        periodStartDate: periodStartIso,
        cycleLength: Number(cycleLength),
        symptoms,
      })
    ),

  /** month: "YYYY-MM" */
  getFertilityCalendar: (month: string) =>
    call<FertilityCalendar>(axiosClient.get(ENDPOINTS.FERTILITY_CALENDAR, { params: { month } })),

  getOvulationToday: () => call<OvulationToday>(axiosClient.get(ENDPOINTS.FERTILITY_OVULATION_TODAY)),

  /** protocol: "long" (phác đồ dài) hoặc "short" (phác đồ ngắn / antagonist). */
  createIvfTimeline: (ivfStartDateIso: string, protocol: 'long' | 'short' = 'long') =>
    call<IvfMilestone[]>(
      axiosClient.post(ENDPOINTS.FERTILITY_IVF_TIMELINE, { ivfStartDate: ivfStartDateIso, protocol })
    ),

  // Thai kỳ
  getPregnancyThisWeek: () =>
    call<PregnancyWeekInfo>(axiosClient.get(ENDPOINTS.PREGNANCY_THIS_WEEK)),

  getPregnancyMealPlan: () =>
    call<PregnancyMealDay[]>(axiosClient.get(ENDPOINTS.PREGNANCY_MEAL_PLAN)),

  getExercisePlan: () => call<ExercisePlan>(axiosClient.get(ENDPOINTS.PREGNANCY_EXERCISE_PLAN)),

  logExercise: (exerciseType: string, durationMinutes: number, stepCount = 0) =>
    call(
      axiosClient.post(ENDPOINTS.PREGNANCY_EXERCISE_LOG, { exerciseType, durationMinutes, stepCount })
    ),

  getTodaySteps: () => call<{ todaySteps: number }>(axiosClient.get(ENDPOINTS.PREGNANCY_TODAY_STEPS)),

  logPregnancyWeight: (weightKg: number) =>
    call<WeightLogResult>(
      axiosClient.post(ENDPOINTS.PREGNANCY_WEIGHT_LOG, {
        weightKg,
        date: new Date().toISOString(),
      })
    ),

  getPregnancyWeightLogs: () =>
    call<PregnancyWeightLog[]>(axiosClient.get(ENDPOINTS.PREGNANCY_WEIGHT_LOGS)),

  // Sau sinh
  setupPostpartum: (deliveryDateIso: string, deliveryType: 'natural' | 'cesarean', isBreastfeeding: boolean) =>
    call<PostpartumSetupResult>(
      axiosClient.post(ENDPOINTS.POSTPARTUM_SETUP, {
        deliveryDate: deliveryDateIso,
        deliveryType,
        isBreastfeeding,
      })
    ),

  submitEpds: (answers: number[]) =>
    call<EpdsResult>(axiosClient.post(ENDPOINTS.POSTPARTUM_EPDS, { answers })),

  getLatestEpds: () => call<LatestEpds>(axiosClient.get(ENDPOINTS.POSTPARTUM_EPDS_LATEST)),

  getRecoveryPlan: (day?: number) =>
    call<RecoveryPlan>(
      axiosClient.get(ENDPOINTS.POSTPARTUM_RECOVERY_PLAN, { params: day ? { day } : undefined })
    ),

  // Gói dịch vụ
  createPayment: (targetTier: TierId, months: PlanMonths) =>
    call(
      axiosClient.post(ENDPOINTS.PAYMENT_CREATE, {
        planCode: PLAN_CODES[targetTier][months],
        provider: 'BankTransfer',
      })
    ),

  getPaymentHistory: () => call(axiosClient.get(ENDPOINTS.PAYMENT_HISTORY)),

  // Món ăn
  generateRecipes: (preferences: {
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
    // Backend lưu các món vừa tạo vào "món của tôi" (category Mom, chờ chuyên gia duyệt).
    return call(axiosClient.post(ENDPOINTS.AI_RECIPES, { query }));
  },

  getMyRecipes: (filters: { category?: 'Mom' | 'Baby'; isSaved?: boolean } = {}) =>
    call<{ total: number; recipes: RecipeDto[] }>(
      axiosClient.get(ENDPOINTS.MY_RECIPES, { params: { limit: 50, ...filters } })
    ),

  toggleSaveRecipe: (id: number) =>
    call<{ isSaved: boolean }>(axiosClient.patch(ENDPOINTS.RECIPE_SAVE(id))),

  // Góp ý
  getFeedbackOptions: () =>
    call<{ categories: FeedbackCategory[] }>(axiosClient.get(ENDPOINTS.FEEDBACK_OPTIONS)),

  sendFeedback: (payload: { category: string; message: string; page?: string }) =>
    call(axiosClient.post(ENDPOINTS.FEEDBACK, payload)),
};

export default featureService;
