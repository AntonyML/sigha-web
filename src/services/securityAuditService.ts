import axios from 'axios';
import type {
  SecurityEvent,
  CreateSecurityEventDto,
  SearchSecurityEventsDto,
  ResolveSecurityEventDto,
  SearchLoginAttemptsDto,
  SecurityStatistics,
  PaginatedSecurityEventsResponse,
  PaginatedLoginAttemptsResponse,
} from '../types/securityAudit';
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

export const securityAuditService = {
  /**
   * Crear evento de seguridad
   * Endpoint: POST /security-audit/events
   */
  async createSecurityEvent(dto: CreateSecurityEventDto, userId?: number): Promise<SecurityEvent> {
    const response = await apiClient.post<SecurityEvent>('/security-audit/events', dto, {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },

  /**
   * Obtener eventos de seguridad con filtros y paginación
   * Endpoint: GET /security-audit/events
   */
  async getSecurityEvents(filters?: SearchSecurityEventsDto): Promise<PaginatedSecurityEventsResponse> {
    const response = await apiClient.get<PaginatedSecurityEventsResponse>('/security-audit/events', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Resolver evento de seguridad
   * Endpoint: PUT /security-audit/events/:id/resolve
   */
  async resolveSecurityEvent(
    id: number,
    dto: ResolveSecurityEventDto,
    resolverId: number
  ): Promise<SecurityEvent> {
    const response = await apiClient.put<SecurityEvent>(`/security-audit/events/${id}/resolve`, dto, {
      params: { resolverId },
    });
    return response.data;
  },

  /**
   * Obtener intentos de login con filtros y paginación
   * Endpoint: GET /security-audit/login-attempts
   */
  async getLoginAttempts(filters?: SearchLoginAttemptsDto): Promise<PaginatedLoginAttemptsResponse> {
    const response = await apiClient.get<PaginatedLoginAttemptsResponse>('/security-audit/login-attempts', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtener estadísticas de seguridad
   * Endpoint: GET /security-audit/statistics
   */
  async getSecurityStatistics(): Promise<SecurityStatistics> {
    const response = await apiClient.get<SecurityStatistics>('/security-audit/statistics');
    return response.data;
  },
};
