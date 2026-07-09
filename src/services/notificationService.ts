import axios from 'axios';
import type {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
  SearchNotificationDto,
  NotificationApiResponse,
  SingleNotificationApiResponse,
} from '../types/notification';
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

export const notificationService = {
  /**
   * Listar notificaciones con filtros opcionales (paginado)
   * Endpoint: GET /notifications
   */
  async getNotifications(filters?: SearchNotificationDto): Promise<NotificationApiResponse> {
    const response = await apiClient.get<NotificationApiResponse>('/notifications', { params: filters });
    return response.data;
  },

  /**
   * Obtener notificación por ID
   * Endpoint: GET /notifications/:id
   */
  async getNotificationById(id: number): Promise<Notification> {
    const response = await apiClient.get<SingleNotificationApiResponse>(`/notifications/${id}`);
    return response.data.data;
  },

  /**
   * Crear nueva notificación
   * Endpoint: POST /notifications
   */
  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const response = await apiClient.post<SingleNotificationApiResponse>('/notifications', dto);
    return response.data.data;
  },

  /**
   * Actualizar notificación existente
   * Endpoint: PATCH /notifications/:id
   */
  async updateNotification(id: number, dto: UpdateNotificationDto): Promise<Notification> {
    const response = await apiClient.patch<SingleNotificationApiResponse>(`/notifications/${id}`, dto);
    return response.data.data;
  },

  /**
   * Marcar notificación como leída
   * Endpoint: PATCH /notifications/:id/read
   */
  async markAsRead(id: number): Promise<Notification> {
    const response = await apiClient.patch<SingleNotificationApiResponse>(`/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Eliminar notificación
   * Endpoint: DELETE /notifications/:id
   */
  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
