import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BabyProfileDto } from '../services/babyService';

export type MainTabParamList = {
  Dashboard: undefined;
  Journey: undefined;
  Nutrition: undefined;
  SymptomAI: undefined;
  Menu: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  GuestHome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  // Màn hình chi tiết đẩy lên trên thanh tab
  Profile: undefined;
  BabyProfileForm: { baby?: BabyProfileDto } | undefined;
  DailyMonitoring: undefined;
  Medications: undefined;
  Notifications: undefined;
  SymptomHistory: undefined;
  SymptomDetail: { id: string | number };
  Pregnancy: undefined;
  Postpartum: undefined;
  Epds: undefined;
  Fertility: undefined;

  // P3 – nhóm "Nên có"
  GrowthChart: { babyId: string };
  BabyWeeklyMenu: { babyId: string; babyName: string };
  PregnancyMealPlan: undefined;
  ExercisePlan: undefined;
  IvfTimeline: undefined;
  Recipes: undefined;
};
