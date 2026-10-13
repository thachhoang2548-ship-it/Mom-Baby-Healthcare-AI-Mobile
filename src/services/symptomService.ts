import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from './authService';

export interface PossibleCondition {
  conditionName?: string;
  name?: string;
  probability?: string | number;
  description?: string;
  advice?: string;
}

export interface SymptomAnalysisResult {
  /** false khi backend lưu triệu chứng nhưng gọi AI thất bại (possibleConditionsJson rỗng). */
  aiAvailable: boolean;
  urgencyLevel?: string;
  severityScore?: number;
  shouldSeeDoctor?: boolean;
  possibleConditions?: PossibleCondition[];
  urgencyReason?: string;
  lifestyleConnection?: string;
  recommendations?: string[];
  dietarySuggestions?: string[];
  specialistType?: string;
  disclaimer?: string;
}

export interface SymptomLogDto {
  id: string;
  userId?: string;
  textDescription: string;
  imageUrl?: string;
  urgencyLevel?: string;
  severityScore?: number;
  possibleConditionsJson?: string;
  createdAt?: string;
  analysisResult?: SymptomAnalysisResult;
}

const mapSymptomLogToUI = (log: any): SymptomLogDto => {
  if (!log) return log;

  let ai: any = {};
  if (log.possibleConditionsJson) {
    try {
      ai = JSON.parse(log.possibleConditionsJson) || {};
    } catch (e) {
      console.warn('Failed to parse possibleConditionsJson', e);
    }
  }

  const possibleConditions = Array.isArray(ai)
    ? ai
    : ai.possibleConditions || [];

  return {
    ...log,
    analysisResult: {
      aiAvailable: Object.keys(ai).length > 0,
      urgencyLevel: log.urgencyLevel || ai.urgencyLevel,
      severityScore: log.severityScore ?? ai.severityScore,
      shouldSeeDoctor: log.shouldSeeDoctor ?? ai.shouldSeeDoctor,
      possibleConditions,
      urgencyReason: log.urgencyReason || ai.urgencyReason,
      lifestyleConnection: log.lifestyleConnection || ai.lifestyleConnection,
      recommendations: ai.recommendations || log.recommendations || [],
      dietarySuggestions: ai.dietarySuggestions || log.dietarySuggestions || [],
      specialistType: log.specialistType || ai.specialistType,
      disclaimer: log.disclaimer || ai.disclaimer,
    },
  };
};

const symptomService = {
  submitAnalysis: async (payload: {
    textDescription: string;
    imageUrl?: string | null;
    imageMimeType?: string | null;
  }): Promise<ApiResponse<SymptomLogDto>> => {
    const res = await axiosClient.post(ENDPOINTS.SYMPTOMS, payload);
    if (res.data && res.data.isSuccess && res.data.data) {
      res.data.data = mapSymptomLogToUI(res.data.data);
    }
    return res.data;
  },

  fetchHistory: async (): Promise<ApiResponse<SymptomLogDto[]>> => {
    const res = await axiosClient.get(ENDPOINTS.SYMPTOMS);
    if (res.data && res.data.isSuccess && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(mapSymptomLogToUI);
    }
    return res.data;
  },

  fetchById: async (id: string | number): Promise<ApiResponse<SymptomLogDto>> => {
    const res = await axiosClient.get(ENDPOINTS.SYMPTOM_DETAIL(id));
    if (res.data && res.data.isSuccess && res.data.data) {
      res.data.data = mapSymptomLogToUI(res.data.data);
    }
    return res.data;
  },
};

export default symptomService;
