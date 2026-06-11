import axios from 'axios';
import type {
  ActivityLog,
  ActivityLogFilters,
  ActivityLogsResponse,
  ActivityStatistics,
} from '../types/activityLog';
import { config } from '../config/app.config';
import { navigateTo } from '../utils/navigationUtils';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('authToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);

export const activityLogsService = {
  /**
   * Obtener logs de actividad con filtros y paginación
   * Endpoint: GET /activity-logs
   */
  async getActivityLogs(filters?: ActivityLogFilters): Promise<ActivityLogsResponse> {
    const response = await apiClient.get<ActivityLogsResponse>('/activity-logs', { params: filters });
    return response.data;
  },

  /**
   * Obtener estadísticas de actividad
   * Endpoint: GET /activity-logs/statistics
   */
  async getActivityStatistics(
    startDate?: string,
    endDate?: string,
    userId?: number
  ): Promise<ActivityStatistics> {
    const response = await apiClient.get<ActivityStatistics>('/activity-logs/statistics', {
      params: { startDate, endDate, userId },
    });
    return response.data;
  },

  /**
   * Obtener log por ID
   * Endpoint: GET /activity-logs/:id
   */
  async getActivityLogById(id: number): Promise<ActivityLog> {
    const response = await apiClient.get<ActivityLog>(`/activity-logs/${id}`);
    return response.data;
  },
};
