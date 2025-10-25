// authValidations.ts
// Centraliza las validaciones y mensajes de error para los flujos de autenticación


// Validaciones de negocio para login
export function validateLoginCredentials(email: string, password: string): string | null {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return 'Error interno: los datos de acceso no son válidos.';
  }
  if (!email && !password) {
    return 'Por favor ingresa tu correo electrónico y contraseña.';
  }
  if (!email) {
    return 'El correo electrónico es requerido.';
  }
  if (!password) {
    return 'La contraseña es requerida.';
  }
  if (email.trim() !== email) {
    return 'El correo electrónico no debe tener espacios al inicio o final.';
  }
  if (password.trim() !== password) {
    return 'La contraseña no debe tener espacios al inicio o final.';
  }
  if (email.length < 5) {
    return 'El correo electrónico es demasiado corto.';
  }
  if (email.length > 100) {
    return 'El correo electrónico es demasiado largo.';
  }
  if (email.includes(' ')) {
    return 'El correo electrónico no debe contener espacios.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'El formato del correo electrónico no es válido.';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (password.length > 100) {
    return 'La contraseña es demasiado larga.';
  }
  if (/^\d+$/.test(password)) {
    return 'La contraseña no puede ser solo números.';
  }
  if (/^[a-zA-Z]+$/.test(password)) {
    return 'La contraseña debe contener al menos un número.';
  }
  if (password.toLowerCase() === 'password' || password === '123456' || password === 'contraseña') {
    return 'La contraseña es demasiado común. Elige una más segura.';
  }
  if (email === password) {
    return 'La contraseña no puede ser igual al correo electrónico.';
  }
  return null;
}


// Reglas de red/Axios para login
function isNetworkError(error: any): boolean {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    error?.isAxiosError && !error.response
  );
}

export function getLoginErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión de red o que el backend esté disponible.';
  }
  if (error?.response?.status === 400) {
    // Validación de datos desde backend
    const msg = error?.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(' ');
    return 'Datos enviados no válidos.';
  }
  if (error?.response?.status === 401) {
    return 'Credenciales inválidas. Verifica tu correo y contraseña.';
  }
  if (error?.response?.status === 403) {
    return 'Usuario inactivo, bloqueado o sin permisos.';
  }
  if (error?.response?.status === 404) {
    return 'El recurso solicitado no existe o el endpoint es incorrecto.';
  }
  if (error?.response?.status === 409) {
    return 'Conflicto de datos. Es posible que el usuario ya exista o haya un problema de duplicidad.';
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
  return 'Error desconocido al iniciar sesión. Intenta nuevamente.';
}


// Validaciones de negocio para 2FA
export function validate2FACode(code: string): string | null {
  if (typeof code !== 'string') {
    return 'Error interno: el código no es válido.';
  }
  const cleanCode = code.replace(/[\s-]/g, '');
  if (!cleanCode) {
    return 'El código de verificación es requerido.';
  }
  if (code !== code.trim()) {
    return 'El código no debe tener espacios al inicio o final.';
  }
  if (cleanCode.length !== code.length) {
    return 'El código no debe contener espacios ni guiones.';
  }
  if (!/^[0-9]+$/.test(cleanCode)) {
    return 'El código solo debe contener números.';
  }
  if (cleanCode.length !== 6 && cleanCode.length !== 8) {
    return 'El código debe tener 6 dígitos (TOTP) o 8 dígitos (código de respaldo).';
  }
  if (/^(.)\1+$/.test(cleanCode)) {
    return 'El código no puede ser una secuencia repetida.';
  }
  return null;
}


// Reglas de red/Axios para 2FA
export function get2FAErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión de red o que el backend esté disponible.';
  }
  if (error?.response?.status === 400) {
    const msg = error?.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(' ');
    return 'Código enviado no válido.';
  }
  if (error?.response?.status === 401) {
    const msg = error?.response?.data?.message || '';
    if (msg.includes('Token temporal') || msg.includes('expirado')) {
      return 'El tiempo para verificar el código ha expirado (5 minutos desde el login inicial). La hora del servidor puede estar desincronizada. Por favor, inicia sesión nuevamente.';
    }
    return 'Código 2FA inválido. Verifica que el código sea correcto.';
  }
  if (error?.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (error?.response?.status === 404) {
    return 'No se encontró la sesión o el recurso para la verificación.';
  }
  if (error?.response?.status === 429) {
    return 'Demasiados intentos de verificación. Espera unos minutos antes de volver a intentar.';
  }
  if (error?.response?.status >= 500) {
    return 'Error interno del servidor. Intenta más tarde o contacta al soporte.';
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Error desconocido al verificar el código 2FA. Intenta nuevamente.';
}