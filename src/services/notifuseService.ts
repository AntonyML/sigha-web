// src/services/notifuseService.ts
// ⚠️ LEGACY — notifuse está siendo reemplazado por emailService (Resend).
// Conservado únicamente para integraciones que aún llamen al endpoint legacy.
// Endpoints verificados contra backend (auth requerido):
//   POST /notifuse/send-8-codes
//   POST /notifuse/send-code-verify

import axios from 'axios';
import type {
  SendCodeVerifyRequest,
  SendBackupCodesRequest,
  NotifuseResponse,
} from '../types/notifuse';
import { config } from '../config/app.config';

const notifuseClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

notifuseClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('authToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export class NotifuseService {
  static async sendCodeVerify(request: SendCodeVerifyRequest): Promise<NotifuseResponse> {
    try {
      const response = await notifuseClient.post('/notifuse/send-code-verify', request);
      return { success: true, message: response.data?.message ?? 'Código enviado' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message ?? 'Error al enviar código de verificación',
        };
      }
      return { success: false, error: 'Error desconocido al enviar código' };
    }
  }

  static async sendBackupCodes(request: SendBackupCodesRequest): Promise<NotifuseResponse> {
    try {
      const response = await notifuseClient.post('/notifuse/send-8-codes', request);
      return { success: true, message: response.data?.message ?? 'Códigos enviados' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message ?? 'Error al enviar códigos de respaldo',
        };
      }
      return { success: false, error: 'Error desconocido al enviar códigos' };
    }
  }
}
