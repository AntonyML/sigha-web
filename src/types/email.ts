// src/types/email.ts
// Tipos para el modulo de email transaccional (Resend-backed).
// Reemplaza los antiguos tipos de Notifuse usados por el legacy `notifuseService` y `notifuseFlow`.

export interface EmailContact {
  email: string;
  firstName: string;
  lastName?: string;
}

export interface SendPasswordResetEmailRequest {
  contact: EmailContact;
  code: string;
  expirationLabel?: string;
}

export interface SendBackupCodesEmailRequest {
  contact: EmailContact;
  codes: string[];
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
