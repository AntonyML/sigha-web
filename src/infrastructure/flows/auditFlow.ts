import { auditService } from '../../services/auditService';
import type {
  DigitalRecord,
  CreateDigitalRecordDto,
  SearchDigitalRecordsDto,
  PaginatedDigitalRecordsResponse,
  AuditStatistics,
  AuditAction,
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
 * Resultado de obtener un registro digital
 */
export interface GetDigitalRecordFlowResult extends AuditFlowResult {
  record?: DigitalRecord;
}

/**
 * Resultado de obtener lista de registros digitales
 */
export interface GetDigitalRecordsFlowResult extends AuditFlowResult {
  records?: DigitalRecord[];
  total?: number;
  page?: number;
  totalPages?: number;
}

/**
 * Resultado de crear un registro digital
 */
export interface CreateDigitalRecordFlowResult extends AuditFlowResult {
  record?: DigitalRecord;
}

/**
 * Resultado de obtener estadísticas
 */
export interface GetAuditStatisticsFlowResult extends AuditFlowResult {
  stats?: AuditStatistics;
}

/**
 * AuditFlow - Flujo de gestión de auditoría
 * 
 * SINCRONIZADO CON BACKEND NestJS audit.service.ts
 * Endpoints disponibles:
 * - POST /audit/digital-records
 * - GET /audit/digital-records/search
 * - GET /audit/digital-records/:id
 * - GET /audit/statistics
 * 
 * Encapsula toda la lógica de consulta y análisis de registros de auditoría (digital records),
 * incluyendo búsquedas, filtrado, estadísticas y exportación.
 */
export const auditFlow = {
  /**
   * Flujo para buscar registros digitales con filtros
   * Backend: searchDigitalRecords()
   * 
   * Maneja:
   * - Búsqueda con filtros (userId, action, tableName, recordId, fechas)
   * - Paginación
   * - Validación de fechas
   * - Manejo de errores
   * 
   * @param params - Parámetros de búsqueda
   * @returns GetDigitalRecordsFlowResult con registros encontrados
   */
  async searchDigitalRecords(params?: SearchDigitalRecordsDto): Promise<GetDigitalRecordsFlowResult> {
    try {
      // Validar fechas si se proporcionan
      if (params?.startDate && params?.endDate) {
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);

        if (start > end) {
          return {
            success: false,
            error: 'La fecha de inicio no puede ser mayor que la fecha de fin',
          };
        }
      }

      const response: PaginatedDigitalRecordsResponse = await auditService.searchDigitalRecords(params);

      // Backend SIEMPRE retorna: { records, total, page, limit, totalPages }
      const records = response.records || [];
      const total = response.total || 0;
      const page = response.page || 1;
      const totalPages = response.totalPages || 1;

      if (records.length === 0) {
        return {
          success: true,
          records: [],
          total: 0,
          page,
          totalPages,
          message: 'No se encontraron registros que coincidan con los criterios de búsqueda',
        };
      }

      return {
        success: true,
        records,
        total,
        page,
        totalPages,
        message: `${records.length} registros encontrados`,
      };
    } catch (error: any) {
      console.error('Error en auditFlow.searchDigitalRecords:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al buscar registros de auditoría',
      };
    }
  },

  /**
   * Flujo para obtener un registro digital por ID
   * Backend: getDigitalRecordById()
   * 
   * Maneja:
   * - Validación del ID
   * - Obtención del registro
   * - Manejo de errores 404
   * 
   * @param id - ID del registro digital
   * @returns GetDigitalRecordFlowResult con el registro encontrado
   */
  async getDigitalRecordById(id: number): Promise<GetDigitalRecordFlowResult> {
    try {
      if (!id || id <= 0) {
        return {
          success: false,
          error: 'ID de auditoría inválido',
        };
      }

      const record = await auditService.getDigitalRecordById(id);

      return {
        success: true,
        record,
        message: 'Registro de auditoría obtenido exitosamente',
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getDigitalRecordById:', error);

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
   * Flujo para crear un registro digital manual
   * Backend: createDigitalRecord()
   * 
   * Maneja:
   * - Validación de datos requeridos
   * - Creación del registro (backend obtiene userId del token JWT)
   * - Manejo de errores
   * 
   * @param data - Datos del registro digital
   * @returns CreateDigitalRecordFlowResult con el registro creado
   */
  async createDigitalRecord(data: CreateDigitalRecordDto): Promise<CreateDigitalRecordFlowResult> {
    try {
      // Validar datos requeridos
      if (!data.action) {
        return {
          success: false,
          error: 'La acción es requerida',
        };
      }

      // Backend obtiene userId automáticamente del token JWT
      const record = await auditService.createDigitalRecord(data);

      return {
        success: true,
        record,
        message: 'Registro de auditoría creado exitosamente',
      };
    } catch (error: any) {
      console.error('Error en auditFlow.createDigitalRecord:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear el registro de auditoría',
      };
    }
  },

  /**
   * Flujo para obtener estadísticas de auditoría
   * Backend: getAuditStatistics()
   * 
   * Maneja:
   * - Obtención de estadísticas con filtro de fechas opcional
   * - Validación de fechas
   * - Formateo de estadísticas
   * - Manejo de errores
   * 
   * @param startDate - Fecha de inicio (opcional)
   * @param endDate - Fecha de fin (opcional)
   * @returns GetAuditStatisticsFlowResult con estadísticas
   */
  async getAuditStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<GetAuditStatisticsFlowResult> {
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

      const stats = await auditService.getAuditStatistics(startDate, endDate);

      // Backend retorna: { totalActions, actionsByType, actionsByEntity, topUsers, recentActivity }
      // Validación defensiva
      const safeStats: AuditStatistics = {
        totalActions: stats?.totalActions || 0,
        actionsByType: stats?.actionsByType || {},
        actionsByEntity: stats?.actionsByEntity || {},
        topUsers: Array.isArray(stats?.topUsers) ? stats.topUsers : [],
        recentActivity: Array.isArray(stats?.recentActivity) ? stats.recentActivity : [],
      };

      return {
        success: true,
        stats: safeStats,
        message: 'Estadísticas de auditoría obtenidas exitosamente',
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getAuditStatistics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas de auditoría',
      };
    }
  },

  /**
   * Flujo para exportar registros digitales a CSV
   * 
   * Maneja:
   * - Exportación con filtros
   * - Generación de CSV en frontend
   * - Descarga del archivo
   * - Manejo de errores
   * 
   * @param params - Parámetros de filtrado
   * @param filename - Nombre del archivo a descargar
   * @returns AuditFlowResult indicando éxito o error
   */
  async exportDigitalRecords(
    params?: SearchDigitalRecordsDto,
    filename: string = 'auditorias.csv'
  ): Promise<AuditFlowResult> {
    try {
      const blob = await auditService.exportDigitalRecords(params);

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
      console.error('Error en auditFlow.exportDigitalRecords:', error);
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
      return date.toLocaleString('es-CR', {
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
   * Sincronizado con backend enum AuditAction
   */
  getActionLabel(action: AuditAction): string {
    const labels: Record<AuditAction, string> = {
      login: 'Inicio de sesión',
      logout: 'Cierre de sesión',
      create: 'Creación',
      update: 'Actualización',
      delete: 'Eliminación',
      view: 'Visualización',
      export: 'Exportación',
      other: 'Otra acción',
    };

    return labels[action] || action;
  },

  /**
   * Obtiene una descripción amigable de la tabla
   * Backend usa nombres de tabla MySQL directamente
   */
  getTableLabel(tableName: string | null): string {
    if (!tableName) return 'Sistema';

    const labels: Record<string, string> = {
      users: 'Usuarios',
      roles: 'Roles',
      older_adult: 'Adultos Mayores',
      older_adult_family: 'Familiares',
      programs: 'Programas',
      sub_programs: 'Subprogramas',
      clinical_history: 'Historia Clínica',
      clinical_medication: 'Medicación',
      entrances_exits: 'Entradas/Salidas',
      specialized_area: 'Áreas Especializadas',
      specialized_appointment: 'Citas',
      nursing_records: 'Registros de Enfermería',
      physiotherapy_sessions: 'Sesiones de Fisioterapia',
      psychology_sessions: 'Sesiones de Psicología',
      social_work_reports: 'Reportes de Trabajo Social',
      medical_record: 'Expediente Médico',
      digital_record: 'Registros Digitales',
      audit_reports: 'Reportes de Auditoría',
      notifications: 'Notificaciones',
    };

    return labels[tableName] || tableName;
  },

  /**
   * Obtiene la clase CSS para el badge de acción
   */
  getActionBadgeClass(action: AuditAction): string {
    const classes: Record<AuditAction, string> = {
      create: 'bg-success',
      update: 'bg-primary',
      delete: 'bg-danger',
      login: 'bg-info',
      logout: 'bg-secondary',
      view: 'bg-secondary',
      export: 'bg-info',
      other: 'bg-secondary',
    };

    return classes[action] || 'bg-secondary';
  },

  /**
   * Flujo para obtener auditorías de un usuario específico
   * Backend: getAuditsByUser()
   * Endpoint: GET /audits/user/:userId
   * 
   * @param userId - ID del usuario
   * @returns GetDigitalRecordsFlowResult con los registros del usuario
   */
  async getAuditsByUser(userId: number): Promise<GetDigitalRecordsFlowResult> {
    try {
      if (!userId || userId <= 0) {
        return {
          success: false,
          error: 'ID de usuario inválido',
        };
      }

      const records = await auditService.getAuditsByUser(userId);

      return {
        success: true,
        records,
        total: records.length,
        page: 1,
        totalPages: 1,
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getAuditsByUser:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener auditorías del usuario',
      };
    }
  },

  /**
   * Flujo para obtener auditorías de una entidad específica
   * Backend: getAuditsByEntity()
   * Endpoint: GET /audits/entity/:entity/:entityId
   * 
   * @param entity - Nombre de la tabla (users, older_adult, etc.)
   * @param entityId - ID del registro
   * @returns GetDigitalRecordsFlowResult con los registros de la entidad
   */
  async getAuditsByEntity(entity: string, entityId: number): Promise<GetDigitalRecordsFlowResult> {
    try {
      if (!entity || !entityId || entityId <= 0) {
        return {
          success: false,
          error: 'Entidad o ID inválido',
        };
      }

      const records = await auditService.getAuditsByEntity(entity, entityId);

      return {
        success: true,
        records,
        total: records.length,
        page: 1,
        totalPages: 1,
      };
    } catch (error: any) {
      console.error('Error en auditFlow.getAuditsByEntity:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener auditorías de la entidad',
      };
    }
  },

  /**
   * Determina si una auditoría es crítica (requiere atención)
   */
  isCriticalAudit(record: DigitalRecord): boolean {
    const criticalActions: AuditAction[] = ['delete'];
    const criticalTables = ['users', 'roles', 'older_adult'];
    
    return (
      criticalActions.includes(record.action) ||
      (record.tableName !== null && criticalTables.includes(record.tableName))
    );
  },

  /**
   * Obtiene icono para la acción
   */
  getActionIcon(action: AuditAction): string {
    const icons: Record<AuditAction, string> = {
      login: '🔓',
      logout: '🔒',
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      view: '👁️',
      export: '📤',
      other: '📋',
    };

    return icons[action] || '📋';
  },
};
