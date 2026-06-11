// userValidations.ts
// Centraliza las validaciones y mensajes de error para los flujos de gestión de usuarios

import type { CreateUserData, UpdateUserData, UserChangePasswordData, UserSearchParams } from '../../../../types/user';
import { AxiosError } from 'axios';


// Validaciones de negocio para crear usuario
export function validateCreateUserData(data: CreateUserData): string | null {
  if (!data || typeof data !== 'object') {
    return 'Error interno: los datos del usuario no son válidos.';
  }

  // Validar identificación
  if (!data.uIdentification || typeof data.uIdentification !== 'string') {
    return 'La identificación es requerida.';
  }
  if (data.uIdentification.trim() !== data.uIdentification) {
    return 'La identificación no debe tener espacios al inicio o final.';
  }
  if (data.uIdentification.length < 5) {
    return 'La identificación debe tener al menos 5 caracteres.';
  }
  if (data.uIdentification.length > 20) {
    return 'La identificación no puede tener más de 20 caracteres.';
  }
  if (!/^[a-zA-Z0-9-_.]+$/.test(data.uIdentification)) {
    return 'La identificación solo puede contener letras, números, guiones, puntos y guiones bajos.';
  }

  // Validar nombre
  if (!data.uName || typeof data.uName !== 'string') {
    return 'El nombre es requerido.';
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

  // Validar apellido paterno
  if (!data.uFLastName || typeof data.uFLastName !== 'string') {
    return 'El apellido paterno es requerido.';
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

  // Validar apellido materno (opcional)
  if (data.uSLastName) {
    if (typeof data.uSLastName !== 'string') {
      return 'El apellido materno debe ser un texto válido.';
    }
    if (data.uSLastName.trim() !== data.uSLastName) {
      return 'El apellido materno no debe tener espacios al inicio o final.';
    }
    if (data.uSLastName.length < 2) {
      return 'El apellido materno debe tener al menos 2 caracteres.';
    }
    if (data.uSLastName.length > 50) {
      return 'El apellido materno no puede tener más de 50 caracteres.';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.uSLastName)) {
      return 'El apellido materno solo puede contener letras y espacios.';
    }
  }

  // Validar email
  if (!data.uEmail || typeof data.uEmail !== 'string') {
    return 'El correo electrónico es requerido.';
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

  // Validar contraseña
  if (!data.uPassword || typeof data.uPassword !== 'string') {
    return 'La contraseña es requerida.';
  }
  if (data.uPassword.trim() !== data.uPassword) {
    return 'La contraseña no debe tener espacios al inicio o final.';
  }
  if (data.uPassword.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (data.uPassword.length > 100) {
    return 'La contraseña es demasiado larga.';
  }
  if (/^\d+$/.test(data.uPassword)) {
    return 'La contraseña no puede ser solo números.';
  }
  if (/^[a-zA-Z]+$/.test(data.uPassword)) {
    return 'La contraseña debe contener al menos un número.';
  }
  if (data.uPassword.toLowerCase() === 'password' || data.uPassword === '123456' || data.uPassword === 'contraseña') {
    return 'La contraseña es demasiado común. Elige una más segura.';
  }

  // Validar rol
  if (!data.roleId || typeof data.roleId !== 'number') {
    return 'El rol es requerido.';
  }
  if (data.roleId <= 0) {
    return 'El ID del rol debe ser un número positivo.';
  }

  return null;
}


// Validaciones de negocio para actualizar usuario
export function validateUpdateUserData(data: UpdateUserData): string | null {
  if (!data || typeof data !== 'object') {
    return 'Error interno: los datos del usuario no son válidos.';
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

  // Validar rol (opcional)
  if (data.roleId !== undefined) {
    if (typeof data.roleId !== 'number') {
      return 'El ID del rol debe ser un número.';
    }
    if (data.roleId <= 0) {
      return 'El ID del rol debe ser un número positivo.';
    }
  }

  // Validar estado activo (opcional)
  if (data.uIsActive !== undefined) {
    if (typeof data.uIsActive !== 'boolean') {
      return 'El estado activo debe ser un valor booleano.';
    }
  }

  return null;
}


// Validaciones de negocio para cambiar contraseña
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


// Validaciones de negocio para parámetros de búsqueda
export function validateUserSearchParams(params: UserSearchParams): string | null {
  if (!params || typeof params !== 'object') {
    return 'Error interno: los parámetros de búsqueda no son válidos.';
  }

  // Validar término de búsqueda (opcional)
  if (params.term !== undefined) {
    if (typeof params.term !== 'string') {
      return 'El término de búsqueda debe ser un texto válido.';
    }
    if (params.term.trim() !== params.term) {
      return 'El término de búsqueda no debe tener espacios al inicio o final.';
    }
    if (params.term.length < 1) {
      return 'El término de búsqueda no puede estar vacío.';
    }
    if (params.term.length > 100) {
      return 'El término de búsqueda es demasiado largo.';
    }
  }

  // Validar ID de rol (opcional)
  if (params.roleId !== undefined) {
    if (typeof params.roleId !== 'number') {
      return 'El ID del rol debe ser un número.';
    }
    if (params.roleId <= 0) {
      return 'El ID del rol debe ser un número positivo.';
    }
  }

  return null;
}


// Reglas de red/Axios para user management
function isNetworkError(error: AxiosError | Error | unknown): boolean {
  return (
    (error as any)?.code === 'ERR_NETWORK' ||
    (error as any)?.message === 'Network Error' ||
    (error as any)?.isAxiosError && !(error as any).response
  );
}

export function getUserManagementErrorMessage(error: AxiosError | Error | unknown): string {
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión de red o que el backend esté disponible.';
  }
  const axiosError = error as AxiosError<any>;
  if (axiosError?.response?.status === 400) {
    const msg = axiosError?.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(' ');
    return 'Datos enviados no válidos.';
  }
  if (axiosError?.response?.status === 401) {
    return 'No autorizado. Verifica que estés autenticado.';
  }
  if (axiosError?.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (axiosError?.response?.status === 404) {
    return 'Usuario no encontrado.';
  }
  if (axiosError?.response?.status === 409) {
    return 'Conflicto de datos. Es posible que el usuario ya exista o haya un problema de duplicidad.';
  }
  if (axiosError?.response?.status === 422) {
    return 'Datos inválidos. Verifica la información proporcionada.';
  }
  if (axiosError?.response?.status === 429) {
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
  }
  if (axiosError?.response?.status && axiosError.response.status >= 500) {
    return 'Error interno del servidor. Intenta más tarde o contacta al soporte.';
  }
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }
  return 'Error desconocido en la gestión de usuarios. Intenta nuevamente.';
}