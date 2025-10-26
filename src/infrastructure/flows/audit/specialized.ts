import { auditService } from '../../../services/auditService';
import type { SearchDigitalRecordsDto } from '../../../types/audit';
import type { GetDigitalRecordsFlowResult } from './interfaces';
import {
  validateUserId,
  validateEntityParams,
  validateRecordId
} from './validation/specializedValidations';

/**
 * Flujo para obtener auditorías de un usuario específico
 * Backend: getAuditsByUser()
 * Endpoint: GET /audits/user/:userId
 *
 * @param userId - ID del usuario
 * @param params - Parámetros adicionales de búsqueda (opcional)
 * @returns GetDigitalRecordsFlowResult con los registros del usuario
 */
export async function getAuditsByUser(userId: number, params?: SearchDigitalRecordsDto): Promise<GetDigitalRecordsFlowResult> {
  try {
    const validationError = validateUserId(userId);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const response = await auditService.getAuditsByUser(userId, params);

    return {
      success: true,
      records: response.records || [],
      total: response.total || 0,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error en auditFlow.getAuditsByUser:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener auditorías del usuario',
    };
  }
}

/**
 * Flujo para obtener auditorías de una entidad específica
 * Backend: getAuditsByEntity()
 * Endpoint: GET /audits/entity/:entity/:entityId
 *
 * @param entity - Nombre de la tabla (users, older_adult, etc.)
 * @param entityId - ID del registro
 * @param params - Parámetros adicionales de búsqueda (opcional)
 * @returns GetDigitalRecordsFlowResult con los registros de la entidad
 */
export async function getAuditsByEntity(entity: string, entityId: number, params?: SearchDigitalRecordsDto): Promise<GetDigitalRecordsFlowResult> {
  try {
    const validationError = validateEntityParams(entity, entityId);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const response = await auditService.getAuditsByEntity(entity, entityId, params);

    return {
      success: true,
      records: response.records || [],
      total: response.total || 0,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error en auditFlow.getAuditsByEntity:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener auditorías de la entidad',
    };
  }
}

/**
 * Flujo para obtener todos los registros de auditoría
 * Backend: getAllAudits()
 * Endpoint: GET /audits
 *
 * @param params - Parámetros de búsqueda (opcional)
 * @returns GetDigitalRecordsFlowResult con todos los registros
 */
export async function getAllAudits(params?: SearchDigitalRecordsDto): Promise<GetDigitalRecordsFlowResult> {
  try {
    const response = await auditService.getAllAudits(params);

    return {
      success: true,
      records: response.records || [],
      total: response.total || 0,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error en auditFlow.getAllAudits:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener registros de auditoría',
    };
  }
}

/**
 * Flujo para obtener historial de un registro digital
 * Backend: getDigitalRecordHistory()
 * Endpoint: GET /audits/digital-records/:recordId/history
 *
 * @param recordId - ID del registro digital
 * @param queryDto - Parámetros de consulta (opcional)
 * @returns Resultado con historial del registro
 */
export async function getDigitalRecordHistory(recordId: string, queryDto?: any): Promise<any> {
  try {
    const validationError = validateRecordId(recordId);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    const response = await auditService.getDigitalRecordHistory(recordId, queryDto);

    return {
      success: true,
      data: response.data || {},
    };
  } catch (error: any) {
    console.error('Error en auditFlow.getDigitalRecordHistory:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener historial del registro',
    };
  }
}

/**
 * Flujo para buscar actualizaciones de adultos mayores
 * Backend: searchOlderAdultUpdates()
 * Endpoint: GET /audits/older-adult-updates
 *
 * @param params - Parámetros de búsqueda (opcional)
 * @returns Resultado con actualizaciones encontradas
 */
export async function searchOlderAdultUpdates(params?: any): Promise<any> {
  try {
    const response = await auditService.searchOlderAdultUpdates(params);

    return {
      success: true,
      updates: response.records || [],
      total: response.total || 0,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error en auditFlow.searchOlderAdultUpdates:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al buscar actualizaciones de adultos mayores',
    };
  }
}