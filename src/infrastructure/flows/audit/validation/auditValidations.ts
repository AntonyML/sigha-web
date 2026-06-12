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

  // Validar nombre de tabla (opcional)
  if (data.tableName !== undefined) {
    if (typeof data.tableName !== 'string') {
      return 'El nombre de la tabla debe ser un texto válido.';
    }
    if (data.tableName.trim() !== data.tableName) {
      return 'El nombre de la tabla no debe tener espacios al inicio o final.';
    }
    if (data.tableName.length < 1) {
      return 'El nombre de la tabla no puede estar vacío.';
    }
    if (data.tableName.length > 100) {
      return 'El nombre de la tabla es demasiado largo.';
    }
  }

  // Validar ID de registro (opcional)
  if (data.recordId !== undefined) {
    if (typeof data.recordId !== 'number') {
      return 'El ID del registro debe ser un número.';
    }
    if (data.recordId <= 0) {
      return 'El ID del registro debe ser un número positivo.';
    }
    if (!Number.isInteger(data.recordId)) {
      return 'El ID del registro debe ser un número entero.';
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

  // Validar nombre de tabla (opcional)
  if (params.tableName !== undefined) {
    if (typeof params.tableName !== 'string') {
      return 'El nombre de la tabla debe ser un texto válido.';
    }
    if (params.tableName.trim() !== params.tableName) {
      return 'El nombre de la tabla no debe tener espacios al inicio o final.';
    }
    if (params.tableName.length < 1) {
      return 'El nombre de la tabla no puede estar vacío.';
    }
    if (params.tableName.length > 100) {
      return 'El nombre de la tabla es demasiado largo.';
    }
  }

  // Validar ID de registro (opcional)
  if (params.recordId !== undefined) {
    if (typeof params.recordId !== 'number') {
      return 'El ID del registro debe ser un número.';
    }
    if (params.recordId <= 0) {
      return 'El ID del registro debe ser un número positivo.';
    }
    if (!Number.isInteger(params.recordId)) {
      return 'El ID del registro debe ser un número entero.';
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
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const data = axiosError?.response?.data as { message?: string | string[] } | undefined;
  if (axiosError?.response?.status === 400) {
    const msg = data?.message;
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
  if (data?.message) {
    return Array.isArray(data.message) ? data.message.join(' ') : data.message;
  }
  return 'Error desconocido en el sistema de auditoría. Intenta nuevamente.';
}