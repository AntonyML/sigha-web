// src/infrastructure/flows/notifuse/validation/notifuseValidations.ts

import type { SendCodeVerifyRequest, SendBackupCodesRequest } from '../../../../types/notifuse';

/**
 * Valida los datos para enviar código de verificación
 */
export function validateSendCodeVerifyRequest(request: SendCodeVerifyRequest): string | null {
  if (!request || typeof request !== 'object') {
    return 'Los datos de la solicitud no son válidos.';
  }

  // Validar workspace_id
  if (!request.workspace_id || typeof request.workspace_id !== 'string') {
    return 'El workspace_id es requerido.';
  }
  if (request.workspace_id.trim().length === 0) {
    return 'El workspace_id no puede estar vacío.';
  }

  // Validar notification
  if (!request.notification || typeof request.notification !== 'object') {
    return 'Los datos de la notificación son requeridos.';
  }

  const { notification } = request;

  // Validar id
  if (!notification.id || typeof notification.id !== 'string') {
    return 'El id de la notificación es requerido.';
  }
  if (notification.id !== 'code_verifiy_email') {
    return 'El id de la notificación debe ser "code_verifiy_email".';
  }

  // Validar contact
  if (!notification.contact || typeof notification.contact !== 'object') {
    return 'Los datos de contacto son requeridos.';
  }

  const { contact } = notification;

  // Validar email
  if (!contact.email || typeof contact.email !== 'string') {
    return 'El email es requerido.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return 'El email no tiene un formato válido.';
  }

  // Validar first_name
  if (!contact.first_name || typeof contact.first_name !== 'string') {
    return 'El nombre es requerido.';
  }
  if (contact.first_name.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }
  if (contact.first_name.length > 50) {
    return 'El nombre no puede tener más de 50 caracteres.';
  }

  // Validar data
  if (!notification.data || typeof notification.data !== 'object') {
    return 'Los datos de la notificación son requeridos.';
  }

  const { data } = notification;

  // Validar campos requeridos en data
  const requiredFields = [
    'titulo_principal',
    'nombre_usuario',
    'mensaje_contexto',
    'codigo_verificacion',
    'tiempo_expiracion',
    'ubicacion',
    'fecha_hora',
    'url_privacidad',
    'url_terminos',
    'url_soporte'
  ];

  for (const field of requiredFields) {
    if (!data[field as keyof typeof data] || typeof data[field as keyof typeof data] !== 'string') {
      return `El campo ${field} es requerido.`;
    }
    if ((data[field as keyof typeof data] as string).trim().length === 0) {
      return `El campo ${field} no puede estar vacío.`;
    }
  }

  // Validar código de verificación (debe ser numérico)
  if (!/^\d{6}$/.test(data.codigo_verificacion)) {
    return 'El código de verificación debe ser un número de 6 dígitos.';
  }

  return null; // Sin errores
}

/**
 * Valida los datos para enviar códigos de respaldo
 */
export function validateSendBackupCodesRequest(request: SendBackupCodesRequest): string | null {
  if (!request || typeof request !== 'object') {
    return 'Los datos de la solicitud no son válidos.';
  }

  // Validar workspace_id
  if (!request.workspace_id || typeof request.workspace_id !== 'string') {
    return 'El workspace_id es requerido.';
  }
  if (request.workspace_id.trim().length === 0) {
    return 'El workspace_id no puede estar vacío.';
  }

  // Validar notification
  if (!request.notification || typeof request.notification !== 'object') {
    return 'Los datos de la notificación son requeridos.';
  }

  const { notification } = request;

  // Validar id
  if (!notification.id || typeof notification.id !== 'string') {
    return 'El id de la notificación es requerido.';
  }
  if (notification.id !== '6_codes_2fa_email') {
    return 'El id de la notificación debe ser "6_codes_2fa_email".';
  }

  // Validar contact
  if (!notification.contact || typeof notification.contact !== 'object') {
    return 'Los datos de contacto son requeridos.';
  }

  const { contact } = notification;

  // Validar email
  if (!contact.email || typeof contact.email !== 'string') {
    return 'El email es requerido.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return 'El email no tiene un formato válido.';
  }

  // Validar first_name
  if (!contact.first_name || typeof contact.first_name !== 'string') {
    return 'El nombre es requerido.';
  }
  if (contact.first_name.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }
  if (contact.first_name.length > 50) {
    return 'El nombre no puede tener más de 50 caracteres.';
  }

  // Validar data
  if (!notification.data || typeof notification.data !== 'object') {
    return 'Los datos de la notificación son requeridos.';
  }

  const { data } = notification;

  // Validar campos requeridos en data
  const requiredFields = [
    'titulo_principal',
    'nombre_usuario',
    'mensaje_contexto',
    'tiempo_expiracion',
    'ubicacion',
    'fecha_hora'
  ];

  for (const field of requiredFields) {
    if (!data[field as keyof typeof data] || typeof data[field as keyof typeof data] !== 'string') {
      return `El campo ${field} es requerido.`;
    }
    if ((data[field as keyof typeof data] as string).trim().length === 0) {
      return `El campo ${field} no puede estar vacío.`;
    }
  }

  // Validar que al menos algunos códigos estén presentes
  const codes = [
    data.codigo_1,
    data.codigo_2,
    data.codigo_3,
    data.codigo_4,
    data.codigo_5,
    data.codigo_6
  ];

  const hasValidCodes = codes.some(code => code && typeof code === 'string' && code.trim().length > 0);
  if (!hasValidCodes) {
    return 'Debe proporcionar al menos un código de respaldo válido.';
  }

  // Validar formato de códigos (opcional, pero recomendado)
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    if (code && typeof code === 'string' && code.trim().length > 0) {
      if (!/^\d{6,8}$/.test(code.trim())) {
        return `El código ${i + 1} debe ser un número de 6 u 8 dígitos.`;
      }
    }
  }

  return null; // Sin errores
}