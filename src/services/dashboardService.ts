import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

export interface DashboardDataDto {
  recentSymptoms?: any[];
  recentDailyMonitoring?: any[];
  alerts?: any[];
  medicationSchedule?: any[];
  dietPlan?: any;
  severityMetrics?: any;
  weeklySeverity?: any;
  alertCount?: number;
  bmi?: number;
}

const dashboardService = {
  getDashboardData: async () => {
    try {
      const res = await axiosClient.get(ENDPOINTS.DASHBOARD);
      return res.data?.data || null;
    } catch (err: any) {
      console.warn('[DashboardService] getDashboardData error:', err?.message);
      return null;
    }
  },
};

export default dashboardService;
