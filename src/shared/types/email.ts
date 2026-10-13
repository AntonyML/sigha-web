// Tipos sincronizados con backend: controller/email/email.controller.ts
// Endpoints:
//   POST /email/password-reset
//   POST /email/backup-codes

export interface EmailContact {
  email: string;
  firstName: string;
  lastName?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
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
