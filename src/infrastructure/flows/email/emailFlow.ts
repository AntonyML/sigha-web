// src/infrastructure/flows/email/emailFlow.ts

import { emailService } from '../../../services/emailService';
import type {
  EmailSendResult,
  SendBackupCodesEmailRequest,
  SendPasswordResetEmailRequest,
} from '../../../types/email';
import {
  validateSendBackupCodesRequest,
  validateSendPasswordResetRequest,
} from './validation/emailValidations';

export const emailFlow = {
  async sendPasswordReset(request: SendPasswordResetEmailRequest): Promise<EmailSendResult> {
    const validationError = validateSendPasswordResetRequest(request);
    if (validationError) {
      return { success: false, error: validationError.message };
    }
    try {
      return await emailService.sendPasswordReset(request);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error inesperado al enviar el código de recuperación',
      };
    }
  },

  async sendBackupCodes(request: SendBackupCodesEmailRequest): Promise<EmailSendResult> {
    const validationError = validateSendBackupCodesRequest(request);
    if (validationError) {
      return { success: false, error: validationError.message };
    }
    try {
      return await emailService.sendBackupCodes(request);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error inesperado al enviar los códigos de respaldo',
      };
    }
  },
};
