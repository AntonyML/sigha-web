import axios from 'axios';
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

export interface SystemMetrics {
  memoryUsage: number;   // heapUsed in MB
  cpuUsage: number;
  uptime: number;
  loadAverage: number[];
  totalMemory: number;   // OS total MB
  freeMemory: number;    // OS free MB
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

export interface PerformanceReport {
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    peakMemoryUsage: number;
    totalErrors: number;
  };
  byEndpoint?: Array<{
    endpoint: string;
    method: string;
    requestCount: number;
    averageResponseTime: number;
    errorCount: number;
  }>;
}

export interface SystemHealthResponse {
  status: 'healthy' | 'warning' | 'critical';
  metrics: SystemMetrics;
  issues: string[];
  recommendations: string[];
  lastHealthCheck: string;
}

export interface SystemEventFilters {
  page?: number;
  limit?: number;
  eventType?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

export const systemAuditService = {
  /**
   * Obtener métricas actuales del sistema
   * Endpoint: GET /system-audit/metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get<SystemMetrics>('/system-audit/metrics');
    return response.data;
  },

  /**
   * Realizar health check del sistema
   * Endpoint: GET /system-audit/health
   */
  async performHealthCheck(): Promise<SystemHealthResponse> {
    const response = await apiClient.get<SystemHealthResponse>('/system-audit/health');
    return response.data;
  },

  /**
   * Obtener métricas de rendimiento
   * Endpoint: GET /system-audit/performance-report
   */
  async getPerformanceMetrics(): Promise<PerformanceReport> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const response = await apiClient.get<PerformanceReport>('/system-audit/performance-report', {
      params: {
        startDate: yesterday.toISOString(),
        endDate: now.toISOString(),
      },
    });
    return response.data;
  },

  /**
   * Obtener eventos del sistema con filtros
   * Endpoint: GET /system-audit/events
   */
  async getSystemEvents(filters?: SystemEventFilters): Promise<{ events: unknown[]; total: number }> {
    const response = await apiClient.get('/system-audit/events', { params: filters });
    return response.data;
  },
};
