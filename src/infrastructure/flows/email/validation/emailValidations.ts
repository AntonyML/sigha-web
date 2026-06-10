// src/infrastructure/flows/email/validation/emailValidations.ts

import type { SendBackupCodesEmailRequest, SendPasswordResetEmailRequest } from '../../../../types/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_8_DIGITS_REGEX = /^\d{8}$/;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSendPasswordResetRequest(
  request: SendPasswordResetEmailRequest,
): ValidationError | null {
  if (!request || typeof request !== 'object') {
    return { field: '_', message: 'Los datos de la solicitud no son válidos.' };
  }
  if (!request.contact || typeof request.contact !== 'object') {
    return { field: 'contact', message: 'Los datos de contacto son requeridos.' };
  }
  if (!request.contact.email || !EMAIL_REGEX.test(request.contact.email)) {
    return { field: 'contact.email', message: 'El email no tiene un formato válido.' };
  }
  if (!request.contact.firstName || request.contact.firstName.trim().length < 2) {
    return { field: 'contact.firstName', message: 'El nombre debe tener al menos 2 caracteres.' };
  }
  if (request.contact.firstName.trim().length > 100) {
    return { field: 'contact.firstName', message: 'El nombre no puede tener más de 100 caracteres.' };
  }
  if (!request.code || !CODE_8_DIGITS_REGEX.test(request.code)) {
    return { field: 'code', message: 'El código debe ser un número de 8 dígitos.' };
  }
  if (request.expirationLabel && request.expirationLabel.length > 50) {
    return { field: 'expirationLabel', message: 'La etiqueta de expiración es demasiado larga.' };
  }
  return null;
}

export function validateSendBackupCodesRequest(
  request: SendBackupCodesEmailRequest,
): ValidationError | null {
  if (!request || typeof request !== 'object') {
    return { field: '_', message: 'Los datos de la solicitud no son válidos.' };
  }
  if (!request.contact || typeof request.contact !== 'object') {
    return { field: 'contact', message: 'Los datos de contacto son requeridos.' };
  }
  if (!request.contact.email || !EMAIL_REGEX.test(request.contact.email)) {
    return { field: 'contact.email', message: 'El email no tiene un formato válido.' };
  }
  if (!request.contact.firstName || request.contact.firstName.trim().length < 2) {
    return { field: 'contact.firstName', message: 'El nombre debe tener al menos 2 caracteres.' };
  }
  if (request.contact.firstName.trim().length > 100) {
    return { field: 'contact.firstName', message: 'El nombre no puede tener más de 100 caracteres.' };
  }
  if (!Array.isArray(request.codes) || request.codes.length === 0) {
    return { field: 'codes', message: 'Se requiere al menos un código de respaldo.' };
  }
  if (request.codes.length !== 8) {
    return { field: 'codes', message: 'Se esperan exactamente 8 códigos de respaldo.' };
  }
  for (let i = 0; i < request.codes.length; i += 1) {
    const code = request.codes[i];
    if (typeof code !== 'string' || code.trim().length === 0) {
      return { field: `codes[${i}]`, message: `El código ${i + 1} es requerido.` };
    }
  }
  return null;
}
