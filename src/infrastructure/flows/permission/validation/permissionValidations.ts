// permissionValidations.ts
// Centraliza las validaciones y mensajes de error para los flujos de permisos


// Reglas de red/Axios para permisos
function isNetworkError(error: unknown): boolean {
  const err = error as any;
  return (
    err?.code === 'ERR_NETWORK' ||
    err?.message === 'Network Error' ||
    err?.isAxiosError && !err.response
  );
}

export function getPermissionErrorMessage(error: unknown): string {
  const err = error as any;
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión de red o que el backend esté disponible.';
  }
  if (err?.response?.status === 400) {
    const msg = err?.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(' ');
    return 'Datos enviados no válidos.';
  }
  if (err?.response?.status === 401) {
    return 'No autorizado. Verifica que estés autenticado.';
  }
  if (err?.response?.status === 403) {
    return 'No tienes permisos para acceder a la información de permisos.';
  }
  if (err?.response?.status === 404) {
    return 'Permiso no encontrado.';
  }
  if (err?.response?.status === 422) {
    return 'Datos inválidos. Verifica la información proporcionada.';
  }
  if (err?.response?.status === 429) {
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
  }
  if (err?.response?.status >= 500) {
    return 'Error interno del servidor. Intenta más tarde o contacta al soporte.';
  }
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  return 'Error desconocido en la gestión de permisos. Intenta nuevamente.';
}