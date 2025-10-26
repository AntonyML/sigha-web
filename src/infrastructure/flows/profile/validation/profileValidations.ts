// profileValidations.ts
// Centraliza las validaciones y mensajes de error para los flujos de perfil de usuario

import type { UpdateUserData, UserChangePasswordData } from '../../../../types/user';


// Validaciones de negocio para actualizar perfil
export function validateUpdateProfileData(data: Partial<UpdateUserData>): string | null {
  if (!data || typeof data !== 'object') {
    return 'Error interno: los datos del perfil no son válidos.';
  }

  // Verificar que al menos un campo esté presente
  const hasFields = Object.keys(data).some(key =>
    data[key as keyof UpdateUserData] !== undefined
  );
  if (!hasFields) {
    return 'Debe proporcionar al menos un campo para actualizar.';
  }

  // Validar nombre (opcional)
  if (data.uName !== undefined) {
    if (typeof data.uName !== 'string') {
      return 'El nombre debe ser un texto válido.';
    }
    if (data.uName.trim() !== data.uName) {
      return 'El nombre no debe tener espacios al inicio o final.';
    }
    if (data.uName.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }
    if (data.uName.length > 50) {
      return 'El nombre no puede tener más de 50 caracteres.';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.uName)) {
      return 'El nombre solo puede contener letras y espacios.';
    }
  }

  // Validar apellido paterno (opcional)
  if (data.uFLastName !== undefined) {
    if (typeof data.uFLastName !== 'string') {
      return 'El apellido paterno debe ser un texto válido.';
    }
    if (data.uFLastName.trim() !== data.uFLastName) {
      return 'El apellido paterno no debe tener espacios al inicio o final.';
    }
    if (data.uFLastName.length < 2) {
      return 'El apellido paterno debe tener al menos 2 caracteres.';
    }
    if (data.uFLastName.length > 50) {
      return 'El apellido paterno no puede tener más de 50 caracteres.';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.uFLastName)) {
      return 'El apellido paterno solo puede contener letras y espacios.';
    }
  }

  // Validar apellido materno (opcional)
  if (data.uSLastName !== undefined) {
    if (data.uSLastName && typeof data.uSLastName !== 'string') {
      return 'El apellido materno debe ser un texto válido.';
    }
    if (data.uSLastName && data.uSLastName.trim() !== data.uSLastName) {
      return 'El apellido materno no debe tener espacios al inicio o final.';
    }
    if (data.uSLastName && data.uSLastName.length < 2) {
      return 'El apellido materno debe tener al menos 2 caracteres.';
    }
    if (data.uSLastName && data.uSLastName.length > 50) {
      return 'El apellido materno no puede tener más de 50 caracteres.';
    }
    if (data.uSLastName && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.uSLastName)) {
      return 'El apellido materno solo puede contener letras y espacios.';
    }
  }

  // Validar email (opcional)
  if (data.uEmail !== undefined) {
    if (typeof data.uEmail !== 'string') {
      return 'El correo electrónico debe ser un texto válido.';
    }
    if (data.uEmail.trim() !== data.uEmail) {
      return 'El correo electrónico no debe tener espacios al inicio o final.';
    }
    if (data.uEmail.length < 5) {
      return 'El correo electrónico es demasiado corto.';
    }
    if (data.uEmail.length > 100) {
      return 'El correo electrónico es demasiado largo.';
    }
    if (data.uEmail.includes(' ')) {
      return 'El correo electrónico no debe contener espacios.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.uEmail)) {
      return 'El formato del correo electrónico no es válido.';
    }
  }

  return null;
}


// Validaciones de negocio para cambio de contraseña
export function validateChangePasswordData(data: UserChangePasswordData): string | null {
  if (!data || typeof data !== 'object') {
    return 'Error interno: los datos de cambio de contraseña no son válidos.';
  }

  // Validar contraseña actual
  if (!data.currentPassword || typeof data.currentPassword !== 'string') {
    return 'La contraseña actual es requerida.';
  }
  if (data.currentPassword.trim() !== data.currentPassword) {
    return 'La contraseña actual no debe tener espacios al inicio o final.';
  }
  if (data.currentPassword.length < 1) {
    return 'La contraseña actual no puede estar vacía.';
  }

  // Validar nueva contraseña
  if (!data.newPassword || typeof data.newPassword !== 'string') {
    return 'La nueva contraseña es requerida.';
  }
  if (data.newPassword.trim() !== data.newPassword) {
    return 'La nueva contraseña no debe tener espacios al inicio o final.';
  }
  if (data.newPassword.length < 8) {
    return 'La nueva contraseña debe tener al menos 8 caracteres.';
  }
  if (data.newPassword.length > 100) {
    return 'La nueva contraseña es demasiado larga.';
  }
  if (/^\d+$/.test(data.newPassword)) {
    return 'La nueva contraseña no puede ser solo números.';
  }
  if (/^[a-zA-Z]+$/.test(data.newPassword)) {
    return 'La nueva contraseña debe contener al menos un número.';
  }
  if (data.newPassword.toLowerCase() === 'password' || data.newPassword === '123456' || data.newPassword === 'contraseña') {
    return 'La nueva contraseña es demasiado común. Elige una más segura.';
  }

  // Verificar que no sea igual a la contraseña actual
  if (data.currentPassword === data.newPassword) {
    return 'La nueva contraseña no puede ser igual a la contraseña actual.';
  }

  return null;
}


// Reglas de red/Axios para perfil
function isNetworkError(error: any): boolean {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    error?.isAxiosError && !error.response
  );
}

export function getProfileErrorMessage(error: any): string {
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
    return 'No tienes permisos para realizar esta acción.';
  }
  if (error?.response?.status === 404) {
    return 'Perfil no encontrado.';
  }
  if (error?.response?.status === 409) {
    return 'Conflicto de datos. Es posible que el email ya esté en uso.';
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
  return 'Error desconocido en la gestión del perfil. Intenta nuevamente.';
}