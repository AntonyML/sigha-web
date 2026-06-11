// twoFactorValidations.ts
// Centraliza las validaciones y mensajes de error para los flujos de autenticación de dos factores

import type { Enable2FARequest, Verify2FARequest } from '../../../../types/twoFactor';
import type { AxiosError } from 'axios';


// Validaciones de negocio para códigos TOTP
export function validateTOTPFCode(code: string): string | null {
  if (typeof code !== 'string') {
    return 'Error interno: el código no es válido.';
  }
  const cleanCode = code.replace(/[\s-]/g, '');
  if (!cleanCode) {
    return 'El código TOTP es requerido.';
  }
  if (code !== code.trim()) {
    return 'El código no debe tener espacios al inicio o final.';
  }
  if (cleanCode.length !== code.length) {
    return 'El código no debe contener espacios ni guiones.';
  }
  if (!/^[0-9]+$/.test(cleanCode)) {
    return 'El código TOTP solo debe contener números.';
  }
  if (cleanCode.length !== 6) {
    return 'El código TOTP debe tener exactamente 6 dígitos.';
  }
  if (/^(.)\1+$/.test(cleanCode)) {
    return 'El código TOTP no puede ser una secuencia repetida.';
  }
  return null;
}


// Validaciones de negocio para códigos de respaldo
export function validateBackupCode(code: string): string | null {
  if (typeof code !== 'string') {
    return 'Error interno: el código de respaldo no es válido.';
  }
  const cleanCode = code.replace(/[\s-]/g, '');
  if (!cleanCode) {
    return 'El código de respaldo es requerido.';
  }
  if (code !== code.trim()) {
    return 'El código de respaldo no debe tener espacios al inicio o final.';
  }
  if (cleanCode.length !== code.length) {
    return 'El código de respaldo no debe contener espacios ni guiones.';
  }
  if (!/^[0-9]+$/.test(cleanCode)) {
    return 'El código de respaldo solo debe contener números.';
  }
  if (cleanCode.length !== 8) {
    return 'El código de respaldo debe tener exactamente 8 dígitos.';
  }
  if (/^(.)\1+$/.test(cleanCode)) {
    return 'El código de respaldo no puede ser una secuencia repetida.';
  }
  return null;
}


// Validaciones de negocio para habilitar 2FA
export function validateEnable2FAData(data: Enable2FARequest): string | null {
  if (!data || typeof data !== 'object') {
    return 'Error interno: los datos de habilitación 2FA no son válidos.';
  }

  // Validar código
  if (!data.code || typeof data.code !== 'string') {
    return 'El código de verificación es requerido.';
  }

  // Verificar si es TOTP o código de respaldo
  const isTOTP = data.code.replace(/[\s-]/g, '').length === 6;
  const isBackupCode = data.code.replace(/[\s-]/g, '').length === 8;

  if (!isTOTP && !isBackupCode) {
    return 'El código debe tener 6 dígitos (TOTP) u 8 dígitos (código de respaldo).';
  }

  // Validar formato específico
  if (isTOTP) {
    const totpError = validateTOTPFCode(data.code);
    if (totpError) return totpError;
  } else {
    const backupError = validateBackupCode(data.code);
    if (backupError) return backupError;
  }

  // Validar códigos de respaldo (opcional)
  if (data.backupCodes !== undefined) {
    if (!Array.isArray(data.backupCodes)) {
      return 'Los códigos de respaldo deben ser un arreglo.';
    }
    if (data.backupCodes.length === 0) {
      return 'Debe proporcionar al menos un código de respaldo.';
    }
    if (data.backupCodes.length > 10) {
      return 'No puede proporcionar más de 10 códigos de respaldo.';
    }
    for (let i = 0; i < data.backupCodes.length; i++) {
      const code = data.backupCodes[i];
      if (typeof code !== 'string') {
        return `El código de respaldo ${i + 1} debe ser un texto válido.`;
      }
      const backupError = validateBackupCode(code);
      if (backupError) {
        return `Código de respaldo ${i + 1}: ${backupError}`;
      }
    }
  }

  return null;
}


// Validaciones de negocio para verificar 2FA
export function validateVerify2FAData(data: Verify2FARequest): string | null {
  if (!data || typeof data !== 'object') {
    return 'Error interno: los datos de verificación 2FA no son válidos.';
  }

  // Validar código
  if (!data.code || typeof data.code !== 'string') {
    return 'El código de verificación es requerido.';
  }

  // Verificar si es TOTP o código de respaldo
  const isTOTP = data.code.replace(/[\s-]/g, '').length === 6;
  const isBackupCode = data.code.replace(/[\s-]/g, '').length === 8;

  if (!isTOTP && !isBackupCode) {
    return 'Formato de código inválido. Debe tener 6 dígitos (TOTP) u 8 dígitos (código de respaldo).';
  }

  // Validar formato específico
  if (isTOTP) {
    const totpError = validateTOTPFCode(data.code);
    if (totpError) return totpError;
  } else {
    const backupError = validateBackupCode(data.code);
    if (backupError) return backupError;
  }

  return null;
}


// Reglas de red/Axios para 2FA
function isNetworkError(error: AxiosError | Error | unknown): boolean {
  return (
    (error as any)?.code === 'ERR_NETWORK' ||
    (error as any)?.message === 'Network Error' ||
    (error as any)?.isAxiosError && !(error as any).response
  );
}

export function getTwoFactorErrorMessage(error: AxiosError | Error | unknown): string {
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión de red o que el backend esté disponible.';
  }
  const axiosError = error as AxiosError;
  if (axiosError?.response?.status === 400) {
    const msg = axiosError?.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(' ');
    return 'Código inválido o expirado.';
  }
  if (axiosError?.response?.status === 401) {
    const msg = axiosError?.response?.data?.message || '';
    if (msg.includes('Token temporal') || msg.includes('expirado')) {
      return 'El tiempo para verificar el código ha expirado. La hora del servidor puede estar desincronizada.';
    }
    return 'Sesión expirada, por favor inicia sesión nuevamente.';
  }
  if (axiosError?.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (axiosError?.response?.status === 404) {
    return 'Recurso no encontrado o sesión expirada.';
  }
  if (axiosError?.response?.status === 409) {
    return 'Conflicto de datos. Es posible que el 2FA ya esté configurado.';
  }
  if (axiosError?.response?.status === 422) {
    return 'Datos inválidos. Verifica la información proporcionada.';
  }
  if (axiosError?.response?.status === 429) {
    return 'Demasiados intentos de verificación. Espera unos minutos antes de volver a intentar.';
  }
  if (axiosError?.response?.status && axiosError.response.status >= 500) {
    return 'Error interno del servidor. Intenta más tarde o contacta al soporte.';
  }
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }
  return 'Error desconocido en la autenticación de dos factores. Intenta nuevamente.';
}