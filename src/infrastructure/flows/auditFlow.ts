import { auditService } from '../../services/auditService';
import type {
  Audit,
  CreateAuditData,
  AuditSearchParams,
  AuditListResponse,
  AuditStats,
  AuditChangeSummary,
} from '../../types/audit';

/**
 * Resultado genérico de operaciones de auditoría
 */
export interface AuditFlowResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Resultado de obtener un registro de auditoría
 */
export interface GetAuditFlowResult extends AuditFlowResult {
  audit?: Audit;
}

/**
 * Resultado de obtener lista de auditorías
 */
export interface GetAuditsFlowResult extends AuditFlowResult {
  audits?: Audit[];
  total?: number;
  page?: number;
  totalPages?: number;
}

/**
 * Resultado de crear un registro de auditoría
 */
export interface CreateAuditFlowResult extends AuditFlowResult {
  audit?: Audit;
}

/**
 * Resultado de obtener estadísticas
 */
export interface GetAuditStatsFlowResult extends AuditFlowResult {
  stats?: AuditStats;
}

/**
 * AuditFlow - Flujo de gestión de auditoría
 * 
 * Encapsula toda la lógica de consulta y análisis de registros de auditoría,
 * incluyendo búsquedas, filtrado, estadísticas y exportación.
 */
export const auditFlow = {
  /**
   * Flujo para obtener todos los registros de auditoría
   * 
   * Maneja:
   * - Obtención de auditorías con paginación
   * - Manejo de errores
   * - Validación de respuesta
   * 
   * @param params - Parámetros de paginación y filtros
   * @returns GetAuditsFlowResult con la lista de auditorías
   */
  async getAllAudits(params?: AuditSearchParams): Promise<GetAuditsFlowResult> {
    try {
      const response: AuditListResponse = await auditService.getAllAudits(params);

      return {
        success: true,
        audits: response.data,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        message: `${response.data.length} registros de auditoría encontrados`,
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getAllAudits:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener registros de auditoría',
      };
    }
  },

  /**
   * Flujo para obtener un registro de auditoría por ID
   * 
   * Maneja:
   * - Validación del ID
   * - Obtención del registro
   * - Manejo de errores 404
   * 
   * @param id - ID del registro de auditoría
   * @returns GetAuditFlowResult con el registro encontrado
   */
  async getAuditById(id: number): Promise<GetAuditFlowResult> {
    try {
      if (!id || id <= 0) {
        return {
          success: false,
          error: 'ID de auditoría inválido',
        };
      }

      const audit = await auditService.getAuditById(id);

      return {
        success: true,
        audit,
        message: 'Registro de auditoría obtenido exitosamente',
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getAuditById:', error);

      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Registro de auditoría no encontrado',
        };
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener el registro de auditoría',
      };
    }
  },

  /**
   * Flujo para crear un registro de auditoría manual
   * 
   * Maneja:
   * - Validación de datos requeridos
   * - Creación del registro
   * - Manejo de errores
   * 
   * @param data - Datos del registro de auditoría
   * @returns CreateAuditFlowResult con el registro creado
   */
  async createAudit(data: CreateAuditData): Promise<CreateAuditFlowResult> {
    try {
      // Validar datos requeridos
      if (!data.aAction || !data.aEntity || !data.aDescription) {
        return {
          success: false,
          error: 'Acción, entidad y descripción son requeridas',
        };
      }

      const audit = await auditService.createAudit(data);

      return {
        success: true,
        audit,
        message: 'Registro de auditoría creado exitosamente',
      };
    } catch (error: any) {
      console.error('Error en auditFlow.createAudit:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear el registro de auditoría',
      };
    }
  },

  /**
   * Flujo para buscar auditorías con filtros
   * 
   * Maneja:
   * - Validación de parámetros de búsqueda
   * - Búsqueda con filtros avanzados
   * - Manejo de resultados vacíos
   * - Manejo de errores
   * 
   * @param params - Parámetros de búsqueda
   * @returns GetAuditsFlowResult con auditorías encontradas
   */
  async searchAudits(params: AuditSearchParams): Promise<GetAuditsFlowResult> {
    try {
      // Validar fechas si se proporcionan
      if (params.startDate && params.endDate) {
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);

        if (start > end) {
          return {
            success: false,
            error: 'La fecha de inicio no puede ser mayor que la fecha de fin',
          };
        }
      }

      const response: AuditListResponse = await auditService.searchAudits(params);

      if (!response.data || response.data.length === 0) {
        return {
          success: true,
          audits: [],
          total: 0,
          message: 'No se encontraron registros que coincidan con los criterios de búsqueda',
        };
      }

      return {
        success: true,
        audits: response.data,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        message: `${response.data.length} registros encontrados`,
      };
    } catch (error: any) {
      console.error('Error en auditFlow.searchAudits:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al buscar registros de auditoría',
      };
    }
  },

  /**
   * Flujo para obtener auditorías de un usuario específico
   * 
   * @param userId - ID del usuario
   * @param params - Parámetros adicionales
   * @returns GetAuditsFlowResult con auditorías del usuario
   */
  async getAuditsByUser(
    userId: number,
    params?: AuditSearchParams
  ): Promise<GetAuditsFlowResult> {
    try {
      if (!userId || userId <= 0) {
        return {
          success: false,
          error: 'ID de usuario inválido',
        };
      }

      const response: AuditListResponse = await auditService.getAuditsByUser(userId, params);

      return {
        success: true,
        audits: response.data,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        message: `${response.data.length} acciones realizadas por el usuario`,
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getAuditsByUser:', error);
      return {
        success: false,
        error:
          error.response?.data?.message || 'Error al obtener auditorías del usuario',
      };
    }
  },

  /**
   * Flujo para obtener auditorías de una entidad específica
   * 
   * @param entity - Nombre de la entidad
   * @param entityId - ID de la entidad
   * @param params - Parámetros adicionales
   * @returns GetAuditsFlowResult con auditorías de la entidad
   */
  async getAuditsByEntity(
    entity: string,
    entityId: number,
    params?: AuditSearchParams
  ): Promise<GetAuditsFlowResult> {
    try {
      if (!entity || !entityId || entityId <= 0) {
        return {
          success: false,
          error: 'Entidad e ID de entidad son requeridos',
        };
      }

      const response: AuditListResponse = await auditService.getAuditsByEntity(
        entity,
        entityId,
        params
      );

      return {
        success: true,
        audits: response.data,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        message: `${response.data.length} cambios registrados para ${entity} #${entityId}`,
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getAuditsByEntity:', error);
      return {
        success: false,
        error:
          error.response?.data?.message || 'Error al obtener auditorías de la entidad',
      };
    }
  },

  /**
   * Flujo para obtener estadísticas de auditoría
   * 
   * Maneja:
   * - Obtención de estadísticas
   * - Validación de fechas
   * - Manejo de errores
   * 
   * @param startDate - Fecha de inicio (opcional)
   * @param endDate - Fecha de fin (opcional)
   * @returns GetAuditStatsFlowResult con estadísticas
   */
  async getAuditStats(
    startDate?: string,
    endDate?: string
  ): Promise<GetAuditStatsFlowResult> {
    try {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
          return {
            success: false,
            error: 'La fecha de inicio no puede ser mayor que la fecha de fin',
          };
        }
      }

      const stats = await auditService.getAuditStats(startDate, endDate);

      return {
        success: true,
        stats,
        message: 'Estadísticas de auditoría obtenidas exitosamente',
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getAuditStats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas de auditoría',
      };
    }
  },

  /**
   * Flujo para exportar auditorías
   * 
   * Maneja:
   * - Exportación con filtros
   * - Descarga del archivo
   * - Manejo de errores
   * 
   * @param params - Parámetros de filtrado
   * @param filename - Nombre del archivo a descargar
   * @returns AuditFlowResult indicando éxito o error
   */
  async exportAudits(
    params?: AuditSearchParams,
    filename: string = 'auditorias.csv'
  ): Promise<AuditFlowResult> {
    try {
      const blob = await auditService.exportAudits(params);

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Auditorías exportadas exitosamente',
      };
    } catch (error: any) {
      console.error('Error en auditFlow.exportAudits:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al exportar auditorías',
      };
    }
  },

  // ==================== Helpers ====================

  /**
   * Formatea la fecha de un registro de auditoría
   */
  formatAuditDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  },

  /**
   * Obtiene una descripción amigable de la acción
   */
  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      CREATE: 'Creación',
      UPDATE: 'Actualización',
      DELETE: 'Eliminación',
      LOGIN: 'Inicio de sesión',
      LOGOUT: 'Cierre de sesión',
      LOGIN_FAILED: 'Intento de inicio de sesión fallido',
      PASSWORD_CHANGE: 'Cambio de contraseña',
      PASSWORD_RESET: 'Restablecimiento de contraseña',
      '2FA_ENABLED': 'Autenticación 2FA habilitada',
      '2FA_DISABLED': 'Autenticación 2FA deshabilitada',
      EXPORT: 'Exportación de datos',
      IMPORT: 'Importación de datos',
      VIEW: 'Visualización',
      OTHER: 'Otra acción',
    };

    return labels[action] || action;
  },

  /**
   * Obtiene una descripción amigable de la entidad
   */
  getEntityLabel(entity: string): string {
    const labels: Record<string, string> = {
      USER: 'Usuario',
      ROLE: 'Rol',
      VIRTUAL_FILE: 'Ficha virtual',
      ENTRANCE_EXIT: 'Entrada/Salida',
      PROGRAM: 'Programa',
      CLINICAL_HISTORY: 'Historia clínica',
      FAMILY: 'Familiar',
      MEDICATION: 'Medicación',
      AUTH: 'Autenticación',
      SYSTEM: 'Sistema',
      OTHER: 'Otro',
    };

    return labels[entity] || entity;
  },

  /**
   * Obtiene la clase CSS para el badge de acción
   */
  getActionBadgeClass(action: string): string {
    const classes: Record<string, string> = {
      CREATE: 'bg-success',
      UPDATE: 'bg-primary',
      DELETE: 'bg-danger',
      LOGIN: 'bg-info',
      LOGOUT: 'bg-secondary',
      LOGIN_FAILED: 'bg-warning',
      PASSWORD_CHANGE: 'bg-primary',
      PASSWORD_RESET: 'bg-warning',
      '2FA_ENABLED': 'bg-success',
      '2FA_DISABLED': 'bg-danger',
      EXPORT: 'bg-info',
      IMPORT: 'bg-info',
      VIEW: 'bg-secondary',
      OTHER: 'bg-secondary',
    };

    return classes[action] || 'bg-secondary';
  },

  /**
   * Compara valores antiguos y nuevos para generar resumen de cambios
   */
  getChangeSummary(oldValues: Record<string, any>, newValues: Record<string, any>): AuditChangeSummary[] {
    const changes: AuditChangeSummary[] = [];

    if (!oldValues || !newValues) {
      return changes;
    }

    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    allKeys.forEach((key) => {
      const oldValue = oldValues[key];
      const newValue = newValues[key];
      const changed = JSON.stringify(oldValue) !== JSON.stringify(newValue);

      if (changed) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          changed: true,
        });
      }
    });

    return changes;
  },

  /**
   * Determina si una auditoría es crítica (requiere atención)
   */
  isCriticalAudit(audit: Audit): boolean {
    const criticalActions = ['DELETE', 'LOGIN_FAILED', '2FA_DISABLED', 'PASSWORD_RESET'];
    return criticalActions.includes(audit.aAction);
  },
};
