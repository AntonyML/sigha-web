// src/infrastructure/flows/passwordRecovery/validation/passwordRecoveryValidations.ts

/**
 * Valida el email para solicitud de recuperación de contraseña
 */
export function validatePasswordRecoveryRequest(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return 'El email es requerido.';
  }

  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    return 'El email no puede estar vacío.';
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return 'El email no tiene un formato válido.';
  }

  return null; // Sin errores
}

/**
 * Valida los datos para cambio de contraseña
 */
export function validatePasswordResetRequest(newPassword: string, confirmPassword: string): string | null {
  if (!newPassword || typeof newPassword !== 'string') {
    return 'La nueva contraseña es requerida.';
  }

  if (!confirmPassword || typeof confirmPassword !== 'string') {
    return 'La confirmación de contraseña es requerida.';
  }

  const trimmedPassword = newPassword.trim();
  if (trimmedPassword.length === 0) {
    return 'La nueva contraseña no puede estar vacía.';
  }

  if (trimmedPassword.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  // Validar complejidad de contraseña
  const hasUpperCase = /[A-Z]/.test(trimmedPassword);
  const hasLowerCase = /[a-z]/.test(trimmedPassword);
  const hasNumbers = /\d/.test(trimmedPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?/]/.test(trimmedPassword);

  if (!hasUpperCase) {
    return 'La contraseña debe contener al menos una letra mayúscula.';
  }

  if (!hasLowerCase) {
    return 'La contraseña debe contener al menos una letra minúscula.';
  }

  if (!hasNumbers) {
    return 'La contraseña debe contener al menos un número.';
  }

  if (!hasSpecialChar) {
    return 'La contraseña debe contener al menos un carácter especial.';
  }

  if (newPassword !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }

  return null; // Sin errores
}

/**
 * Obtiene mensaje de error amigable para recuperación de contraseña
 */
interface ErrorWithResponse {
  response?: {
    data?: { message?: string };
    status?: number;
  };
  message?: string;
}

export function getPasswordRecoveryErrorMessage(error: unknown): string {
  const err = error as ErrorWithResponse;

  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (err?.response?.status === 404) {
    return 'Usuario no encontrado.';
  }

  if (err?.response?.status === 429) {
    return 'Demasiados intentos. Inténtalo más tarde.';
  }

  if (err?.response?.status && err.response.status >= 500) {
    return 'Error del servidor. Inténtalo más tarde.';
  }

  if (err?.message) {
    return err.message;
  }

  return 'Error inesperado en la recuperación de contraseña.';
}