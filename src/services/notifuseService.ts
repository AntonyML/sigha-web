// src/services/notifuseService.ts

import axios from 'axios';
import type {
  SendCodeVerifyRequest,
  SendBackupCodesRequest,
  NotifuseResponse,
} from '../types/notifuse';
import { config } from '../config/app.config';

/**
 * Axios instance configured for Notifuse API calls
 * Includes interceptors for token management and error handling
 */
const notifuseClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to automatically add authentication token to requests
 * Retrieves token from localStorage and adds it to Authorization header
 */
notifuseClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors
 */
notifuseClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Notifuse API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Service class for Notifuse notifications
 */
export class NotifuseService {
  /**
   * Send verification code email
   */
  static async sendCodeVerify(request: SendCodeVerifyRequest): Promise<NotifuseResponse> {
    try {
      const response = await notifuseClient.post('/notifications/send-code-verify', request);
      return {
        success: true,
        message: response.data.message || 'Código enviado exitosamente',
      };
    } catch (error: unknown) {
      console.error('Error sending code verify:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || 'Error al enviar código de verificación',
        };
      }
      return {
        success: false,
        error: 'Error desconocido al enviar código de verificación',
      };
    }
  }

  /**
   * Send backup codes email
   */
  static async sendBackupCodes(request: SendBackupCodesRequest): Promise<NotifuseResponse> {
    try {
      const response = await notifuseClient.post('/notifications/send-6-codes', request);
      return {
        success: true,
        message: response.data.message || 'Códigos de respaldo enviados exitosamente',
      };
    } catch (error: unknown) {
      console.error('Error sending backup codes:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || 'Error al enviar códigos de respaldo',
        };
      }
      return {
        success: false,
        error: 'Error desconocido al enviar códigos de respaldo',
      };
    }
  }
}