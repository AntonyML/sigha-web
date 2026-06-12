// src/services/emailService.ts
// Servicio HTTP para los endpoints `/email/*` del backend (Resend).
// Reemplaza al legacy `notifuseService`.

import axios from 'axios';
import { getApiUrl, config } from '../config/app.config';
import type {
  EmailContact,
  EmailSendResult,
  SendBackupCodesEmailRequest,
  SendPasswordResetEmailRequest,
} from '../types/email';

const emailClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

emailClient.interceptors.request.use(
  (reqConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error),
);

emailClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (config.features.enableDebugLogs) {
      console.error('[emailService] error:', error);
    }
    return Promise.reject(error);
  },
);

function normalizeContact(contact: EmailContact): EmailContact {
  return {
    email: contact.email.trim().toLowerCase(),
    firstName: contact.firstName.trim(),
    lastName: contact.lastName?.trim() || undefined,
  };
}

export const emailService = {
  async sendPasswordReset(request: SendPasswordResetEmailRequest): Promise<EmailSendResult> {
    try {
      const response = await emailClient.post(
        getApiUrl('/email/password-reset'),
        {
          contact: normalizeContact(request.contact),
          code: request.code,
          expirationLabel: request.expirationLabel,
        },
      );
      return {
        success: true,
        messageId: response.data?.messageId,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            error.message ||
            'Error al enviar el código de recuperación',
        };
      }
      return { success: false, error: 'Error desconocido al enviar el código de recuperación' };
    }
  },

  async sendBackupCodes(request: SendBackupCodesEmailRequest): Promise<EmailSendResult> {
    try {
      const response = await emailClient.post(
        getApiUrl('/email/backup-codes'),
        {
          contact: normalizeContact(request.contact),
          codes: request.codes,
        },
      );
      return {
        success: true,
        messageId: response.data?.messageId,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            error.message ||
            'Error al enviar los códigos de respaldo',
        };
      }
      return { success: false, error: 'Error desconocido al enviar los códigos de respaldo' };
    }
  },
};
