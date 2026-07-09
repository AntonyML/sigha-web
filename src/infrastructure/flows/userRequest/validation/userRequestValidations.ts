// src/infrastructure/flows/userRequest/validation/userRequestValidations.ts

export interface UserRequestFormData {
  fullName: string;
  email: string;
  phone: string;
  reason: string;
}

/**
 * Valida el formulario completo de solicitud de creación de cuenta
 */
export function validateUserRequestForm(data: UserRequestFormData): string | null {
  if (!data.fullName || typeof data.fullName !== 'string') {
    return 'El nombre completo es requerido.';
  }
  const trimmedName = data.fullName.trim();
  if (trimmedName.length < 2) {
    return 'El nombre completo debe tener al menos 2 caracteres.';
  }
  if (trimmedName.length > 200) {
    return 'El nombre completo no puede exceder 200 caracteres.';
  }

  if (!data.email || typeof data.email !== 'string') {
    return 'El correo electrónico es requerido.';
  }
  const trimmedEmail = data.email.trim();
  if (trimmedEmail.length === 0) {
    return 'El correo electrónico no puede estar vacío.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return 'El correo electrónico no tiene un formato válido.';
  }
  if (trimmedEmail.length > 256) {
    return 'El correo electrónico no puede exceder 256 caracteres.';
  }

  if (!data.phone || typeof data.phone !== 'string') {
    return 'El teléfono es requerido.';
  }
  const trimmedPhone = data.phone.trim();
  if (trimmedPhone.length === 0) {
    return 'El teléfono no puede estar vacío.';
  }
  if (trimmedPhone.length > 30) {
    return 'El teléfono no puede exceder 30 caracteres.';
  }

  if (!data.reason || typeof data.reason !== 'string') {
    return 'El motivo de la solicitud es requerido.';
  }
  const trimmedReason = data.reason.trim();
  if (trimmedReason.length < 10) {
    return 'El motivo debe tener al menos 10 caracteres.';
  }
  if (trimmedReason.length > 2000) {
    return 'El motivo no puede exceder 2000 caracteres.';
  }

  return null; // Sin errores
}