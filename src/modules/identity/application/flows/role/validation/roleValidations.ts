// roleValidations.ts
// Centraliza las validaciones y mensajes de error para los flujos de roles

import { getApiAxiosError, isNetworkError } from '@/shared/lib/apiError';

// Reglas de red/Axios para roles
export function getRoleErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión de red o que el backend esté disponible.';
  }
  const response = getApiAxiosError(error)?.response;
  const status = response?.status;
  const message = response?.data?.message;
  if (status === 400) {
    const msg = message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(' ');
    return 'Datos enviados no válidos.';
  }
  if (status === 401) {
    return 'No autorizado. Verifica que estés autenticado.';
  }
  if (status === 403) {
    return 'No tienes permisos para acceder a la información de roles.';
  }
  if (status === 404) {
    return 'Rol no encontrado.';
  }
  if (status === 422) {
    return 'Datos inválidos. Verifica la información proporcionada.';
  }
  if (status === 429) {
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
  }
  if (status !== undefined && status >= 500) {
    return 'Error interno del servidor. Intenta más tarde o contacta al soporte.';
  }
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(' ');
  return 'Error desconocido en la gestión de roles. Intenta nuevamente.';
}
