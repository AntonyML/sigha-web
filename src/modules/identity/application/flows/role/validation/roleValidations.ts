// roleValidations.ts
// Centraliza las validaciones y mensajes de error para los flujos de roles


// Reglas de red/Axios para roles
function isNetworkError(error: any): boolean {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    error?.isAxiosError && !error.response
  );
}

export function getRoleErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión de red o que el backend esté disponible.';
  }
  if (error?.response?.status === 400) {
    const msg = error?.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(' ');
    return 'Datos enviados no válidos.';
  }
  if (error?.response?.status === 401) {
    return 'No autorizado. Verifica que estés autenticado.';
  }
  if (error?.response?.status === 403) {
    return 'No tienes permisos para acceder a la información de roles.';
  }
  if (error?.response?.status === 404) {
    return 'Rol no encontrado.';
  }
  if (error?.response?.status === 422) {
    return 'Datos inválidos. Verifica la información proporcionada.';
  }
  if (error?.response?.status === 429) {
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
  }
  if (error?.response?.status >= 500) {
    return 'Error interno del servidor. Intenta más tarde o contacta al soporte.';
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Error desconocido en la gestión de roles. Intenta nuevamente.';
}