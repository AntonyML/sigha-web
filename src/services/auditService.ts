import axios from 'axios';
import {
  AuditReportType,
  AuditAction,
  type AuditReport,
  type PaginatedAuditReportsResponse,
  type AuditStatistics,
} from '../types/audit';
import { config } from '../config/app.config';

export interface DigitalRecord {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: AuditAction;
  tableName?: string;
  recordId?: number;
  description?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PaginatedDigitalRecords {
  records: DigitalRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchAuditRecordsParams {
  userId?: number;
  action?: AuditAction;
  tableName?: string;
  recordId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

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
    }
    return Promise.reject(error);
  },
);

const toStringRecord = (params?: SearchAuditRecordsParams): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!params) return out;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = String(value);
    }
  }
  return out;
};

export const auditService = {
  async getAuditReports(params?: SearchAuditReportsParams): Promise<AuditReport[]> {
    const response = await apiClient.get('/audits/reports', { params: toStringRecord(params) });
    const data = response.data;
    return Array.isArray(data) ? data : data?.data ?? [];
  },

  async getAuditReportById(id: number): Promise<AuditReport> {
    const response = await apiClient.get(`/audits/reports/${id}`);
    return response.data?.data ?? response.data;
  },

  async generateAuditReport(payload: { type: AuditReportType; startDate: string; endDate: string; description?: string }) {
    const response = await apiClient.post('/audits/reports', payload);
    return response.data;
  },

  async deleteAuditReport(id: number): Promise<void> {
    await apiClient.delete(`/audits/reports/${id}`);
  },

  async searchAuditRecords(params?: SearchAuditRecordsParams): Promise<PaginatedDigitalRecords> {
    const response = await apiClient.get('/audits/search', { params: toStringRecord(params) });
    return response.data as PaginatedDigitalRecords;
  },

  async getAuditStatistics(startDate?: string, endDate?: string): Promise<AuditStatistics> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get('/audits/stats', { params });
    return response.data;
  },
};
