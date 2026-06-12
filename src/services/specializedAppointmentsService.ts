import axios from 'axios';
import {
  type SpecializedAppointmentApi,
  type CreateSpecializedAppointmentDto,
  type UpdateSpecializedAppointmentDto,
  type AppointmentStatusApi,
} from '../types/specializedAppointment';
import { config } from '../config/app.config';
import { navigateTo } from '../utils/navigationUtils';

export type { SpecializedAppointmentApi, CreateSpecializedAppointmentDto, UpdateSpecializedAppointmentDto, AppointmentStatusApi };

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

export const specializedAppointmentsService = {
  getAll: async (patientId?: number, areaId?: number, status?: AppointmentStatusApi): Promise<SpecializedAppointmentApi[]> => {
    const params: Record<string, unknown> = {};
    if (patientId) params.patientId = patientId;
    if (areaId) params.areaId = areaId;
    if (status) params.status = status;
    const response = await apiClient.get('/specialized-appointments', { params });
    return response.data?.data ?? response.data ?? [];
  },

  getByPatient: async (patientId: number): Promise<SpecializedAppointmentApi[]> => {
    const response = await apiClient.get(`/specialized-appointments/by-patient/${patientId}`);
    return response.data?.data ?? response.data ?? [];
  },

  getById: async (id: number): Promise<SpecializedAppointmentApi> => {
    const response = await apiClient.get(`/specialized-appointments/${id}`);
    return response.data?.data ?? response.data;
  },

  create: async (data: CreateSpecializedAppointmentDto): Promise<SpecializedAppointmentApi> => {
    const response = await apiClient.post('/specialized-appointments', data);
    return response.data?.data ?? response.data;
  },

  update: async (id: number, data: UpdateSpecializedAppointmentDto): Promise<SpecializedAppointmentApi> => {
    const response = await apiClient.patch(`/specialized-appointments/${id}`, data);
    return response.data?.data ?? response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/specialized-appointments/${id}`);
  },
};
