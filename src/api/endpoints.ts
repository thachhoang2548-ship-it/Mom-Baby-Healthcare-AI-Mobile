export const API_BASE_URL = 'https://momoi-api-production.up.railway.app';

export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',

  // Profile
  USER_PROFILE: '/api/user-profile',
  SETUP_PREGNANCY: '/api/pregnancy/setup',

  // Baby
  BABY_PROFILES: '/api/baby/profiles',
  CREATE_BABY: '/api/baby/profile',
  UPDATE_BABY: (id: string | number) => `/api/baby/${id}`,
  LOG_GROWTH: (id: string | number) => `/api/baby/${id}/growth`,
  DELETE_GROWTH: (id: string | number, recordId: string | number) => `/api/baby/${id}/growth/${recordId}`,
  DAILY_MENU: (id: string | number) => `/api/baby/${id}/menu/daily`,
  WEEKLY_MENU: (id: string | number) => `/api/baby/${id}/menu/weekly`,

  // Symptoms AI
  SYMPTOMS: '/api/symptoms',
  SYMPTOM_DETAIL: (id: string | number) => `/api/symptoms/${id}`,

  // Dashboard
  DASHBOARD: '/api/dashboard',

  // Alerts / notifications
  ALERTS: '/api/alerts',
  // Dùng /status (có kiểm tra chủ sở hữu) thay cho /resolve: /resolve không kiểm tra
  // người gọi và đóng cùng lúc cảnh báo trùng id ở các bảng khác.
  ALERT_STATUS: (id: string | number) => `/api/alerts/${id}/status`,

  // Daily monitoring
  DAILY_MONITORING: '/api/daily-monitoring',
  DAILY_MONITORING_TODAY: '/api/daily-monitoring/today',
  DAILY_MONITORING_HISTORY: '/api/daily-monitoring/history',

  // Medication
  MEDICATIONS: '/api/medications',
  MEDICATION_ADHERENCE: (id: string | number) => `/api/medications/${id}/adherence`,

  // Fertility
  FERTILITY_CYCLE_LOG: '/api/fertility/cycle-log',
  FERTILITY_CALENDAR: '/api/fertility/calendar',
  FERTILITY_OVULATION_TODAY: '/api/fertility/ovulation-today',
  FERTILITY_IVF_TIMELINE: '/api/fertility/ivf-timeline',

  // Pregnancy
  PREGNANCY_THIS_WEEK: '/api/pregnancy/this-week',
  PREGNANCY_MEAL_PLAN: '/api/pregnancy/meal-plan',
  PREGNANCY_EXERCISE_PLAN: '/api/pregnancy/exercise-plan',
  PREGNANCY_WEIGHT_LOG: '/api/pregnancy/weight-log',
  PREGNANCY_WEIGHT_LOGS: '/api/pregnancy/weight-logs',
  PREGNANCY_FOOD_LOG: '/api/pregnancy/food-log',
  PREGNANCY_EXERCISE_LOG: '/api/pregnancy/exercise-log',
  PREGNANCY_TODAY_STEPS: '/api/pregnancy/today-steps',

  // Postpartum
  POSTPARTUM_SETUP: '/api/postpartum/setup',
  POSTPARTUM_EPDS: '/api/postpartum/epds',
  POSTPARTUM_EPDS_LATEST: '/api/postpartum/epds/latest',
  POSTPARTUM_RECOVERY_PLAN: '/api/postpartum/recovery-plan',
  POSTPARTUM_BREASTFEEDING_LOG: '/api/postpartum/breastfeeding-log',

  // Payments and feedback
  PAYMENT_CREATE: '/api/payment/create',
  PAYMENT_HISTORY: '/api/payment/history',
  PAYMENT_STATUS: (orderCode: string | number) =>
    `/api/payment/status/${encodeURIComponent(orderCode)}`,
  FEEDBACK: '/api/feedback',
  FEEDBACK_OPTIONS: '/api/feedback/options',

  // Recipes
  AI_RECIPES: '/api/ai/recipes',
  MY_RECIPES: '/api/recipes/my',
  RECIPE_SAVE: (id: string | number) => `/api/recipes/${id}/save`,
};
