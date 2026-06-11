// auditValidations.ts
// Centraliza las validaciones y mensajes de error para los flujos de auditoría

import type { LogAuditRequest, SearchAuditReportsDto } from '../../../../types/audit';
import { AuditReportType, AuditAction } from '../../../../types/audit';
import type { AxiosError } from 'axios';


// Validaciones de negocio para registrar auditoría
export function validateLogAuditRequest(data: LogAuditRequest): string | null {
  if (!data || typeof data !== 'object') {
    return 'Error interno: los datos de auditoría no son válidos.';
  }

  // Validar tipo de reporte
  if (!data.type || typeof data.type !== 'string') {
    return 'El tipo de reporte de auditoría es requerido.';
  }
  const validTypes = Object.values(AuditReportType);
  if (!validTypes.includes(data.type as any)) {
    return `El tipo de reporte debe ser uno de: ${validTypes.join(', ')}.`;
  }

  // Validar acción
  if (!data.action || typeof data.action !== 'string') {
    return 'La acción de auditoría es requerida.';
  }
  const validActions = Object.values(AuditAction);
  if (!validActions.includes(data.action as any)) {
    return `La acción debe ser una de: ${validActions.join(', ')}.`;
  }

  // Validar nombre de entidad (opcional)
  if (data.entityName !== undefined) {
    if (typeof data.entityName !== 'string') {
      return 'El nombre de la entidad debe ser un texto válido.';
    }
    if (data.entityName.trim() !== data.entityName) {
      return 'El nombre de la entidad no debe tener espacios al inicio o final.';
    }
    if (data.entityName.length < 1) {
      return 'El nombre de la entidad no puede estar vacío.';
    }
    if (data.entityName.length > 100) {
      return 'El nombre de la entidad es demasiado largo.';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(data.entityName)) {
      return 'El nombre de la entidad solo puede contener letras, números y guiones bajos.';
    }
  }

  // Validar ID de entidad (opcional)
  if (data.entityId !== undefined) {
    if (typeof data.entityId !== 'number') {
      return 'El ID de la entidad debe ser un número.';
    }
    if (data.entityId <= 0) {
      return 'El ID de la entidad debe ser un número positivo.';
    }
    if (!Number.isInteger(data.entityId)) {
      return 'El ID de la entidad debe ser un número entero.';
    }
  }

  // Validar valor anterior (opcional)
  if (data.oldValue !== undefined) {
    if (typeof data.oldValue !== 'string') {
      return 'El valor anterior debe ser un texto válido.';
    }
    if (data.oldValue.length > 10000) {
      return 'El valor anterior es demasiado largo (máximo 10000 caracteres).';
    }
    // Intentar validar que sea JSON válido
    try {
      if (data.oldValue.trim()) {
        JSON.parse(data.oldValue);
      }
    } catch {
      return 'El valor anterior debe ser un JSON válido.';
    }
  }

  // Validar valor nuevo (opcional)
  if (data.newValue !== undefined) {
    if (typeof data.newValue !== 'string') {
      return 'El valor nuevo debe ser un texto válido.';
    }
    if (data.newValue.length > 10000) {
      return 'El valor nuevo es demasiado largo (máximo 10000 caracteres).';
    }
    // Intentar validar que sea JSON válido
    try {
      if (data.newValue.trim()) {
        JSON.parse(data.newValue);
      }
    } catch {
      return 'El valor nuevo debe ser un JSON válido.';
    }
  }

  // Validar dirección IP (opcional)
  if (data.ipAddress !== undefined) {
    if (typeof data.ipAddress !== 'string') {
      return 'La dirección IP debe ser un texto válido.';
    }
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(data.ipAddress)) {
      return 'La dirección IP no tiene un formato válido.';
    }
  }

  // Validar user agent (opcional)
  if (data.userAgent !== undefined) {
    if (typeof data.userAgent !== 'string') {
      return 'El user agent debe ser un texto válido.';
    }
    if (data.userAgent.length > 500) {
      return 'El user agent es demasiado largo (máximo 500 caracteres).';
    }
  }

  // Validar observaciones (opcional)
  if (data.observations !== undefined) {
    if (typeof data.observations !== 'string') {
      return 'Las observaciones deben ser un texto válido.';
    }
    if (data.observations.trim() !== data.observations) {
      return 'Las observaciones no deben tener espacios al inicio o final.';
    }
    if (data.observations.length < 1) {
      return 'Las observaciones no pueden estar vacías.';
    }
    if (data.observations.length > 1000) {
      return 'Las observaciones son demasiado largas (máximo 1000 caracteres).';
    }
  }

  return null;
}


// Validaciones de negocio para búsqueda de reportes de auditoría
export function validateSearchAuditReportsDto(params: SearchAuditReportsDto): string | null {
  if (!params || typeof params !== 'object') {
    return 'Error interno: los parámetros de búsqueda no son válidos.';
  }

  // Validar tipo (opcional)
  if (params.type !== undefined) {
    if (typeof params.type !== 'string') {
      return 'El tipo debe ser un texto válido.';
    }
    const validTypes = Object.values(AuditReportType);
    if (!validTypes.includes(params.type as any)) {
      return `El tipo debe ser uno de: ${validTypes.join(', ')}.`;
    }
  }

  // Validar nombre de entidad (opcional)
  if (params.entityName !== undefined) {
    if (typeof params.entityName !== 'string') {
      return 'El nombre de la entidad debe ser un texto válido.';
    }
    if (params.entityName.trim() !== params.entityName) {
      return 'El nombre de la entidad no debe tener espacios al inicio o final.';
    }
    if (params.entityName.length < 1) {
      return 'El nombre de la entidad no puede estar vacío.';
    }
    if (params.entityName.length > 100) {
      return 'El nombre de la entidad es demasiado largo.';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(params.entityName)) {
      return 'El nombre de la entidad solo puede contener letras, números y guiones bajos.';
    }
  }

  // Validar ID de entidad (opcional)
  if (params.entityId !== undefined) {
    if (typeof params.entityId !== 'number') {
      return 'El ID de la entidad debe ser un número.';
    }
    if (params.entityId <= 0) {
      return 'El ID de la entidad debe ser un número positivo.';
    }
    if (!Number.isInteger(params.entityId)) {
      return 'El ID de la entidad debe ser un número entero.';
    }
  }

  // Validar acción (opcional)
  if (params.action !== undefined) {
    if (typeof params.action !== 'string') {
      return 'La acción debe ser un texto válido.';
    }
    const validActions = Object.values(AuditAction);
    if (!validActions.includes(params.action as any)) {
      return `La acción debe ser una de: ${validActions.join(', ')}.`;
    }
  }

  // Validar fecha de inicio (opcional)
  if (params.startDate !== undefined) {
    if (typeof params.startDate !== 'string') {
      return 'La fecha de inicio debe ser un texto válido.';
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    if (!dateRegex.test(params.startDate)) {
      return 'La fecha de inicio debe tener formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ).';
    }
    const startDate = new Date(params.startDate);
    if (isNaN(startDate.getTime())) {
      return 'La fecha de inicio no es una fecha válida.';
    }
  }

  // Validar fecha de fin (opcional)
  if (params.endDate !== undefined) {
    if (typeof params.endDate !== 'string') {
      return 'La fecha de fin debe ser un texto válido.';
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    if (!dateRegex.test(params.endDate)) {
      return 'La fecha de fin debe tener formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ).';
    }
    const endDate = new Date(params.endDate);
    if (isNaN(endDate.getTime())) {
      return 'La fecha de fin no es una fecha válida.';
    }

    // Validar que fecha fin sea posterior a fecha inicio
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      if (endDate < startDate) {
        return 'La fecha de fin debe ser posterior a la fecha de inicio.';
      }
    }
  }

  return null;
}


// Reglas de red/Axios para auditoría
function isNetworkError(error: AxiosError | Error | unknown): boolean {
  return (
    (error as any)?.code === 'ERR_NETWORK' ||
    (error as any)?.message === 'Network Error' ||
    (error as any)?.isAxiosError && !(error as any).response
  );
}

export function getAuditErrorMessage(error: AxiosError | Error | unknown): string {
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión de red o que el backend esté disponible.';
  }
  const axiosError = error as AxiosError;
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
    return 'No tienes permisos para acceder a la información de auditoría.';
  }
  if (axiosError?.response?.status === 404) {
    return 'Registro de auditoría no encontrado.';
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
  return 'Error desconocido en el sistema de auditoría. Intenta nuevamente.';
}