import { roleChangesService } from '../../../services/roleChangesService';
import type {
  RoleChange,
  CreateRoleChangeData,
  SearchRoleChangesData,
  RoleChangeStatistics
} from '../../../types/roleChanges';
import { getRoleChangesErrorMessage } from './validation/roleChangesValidations';

/**
 * Resultado del flujo de creación de cambio de rol
 */
export interface CreateRoleChangeFlowResult {
    success: boolean;
    roleChange?: RoleChange;
    error?: string;
}

/**
 * Resultado del flujo de obtención de cambios de rol
 */
export interface GetRoleChangesFlowResult {
    success: boolean;
    data?: RoleChange[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    error?: string;
}

/**
 * Resultado del flujo de obtención de un cambio de rol
 */
export interface GetRoleChangeFlowResult {
    success: boolean;
    roleChange?: RoleChange;
    error?: string;
}

/**
 * Resultado del flujo de estadísticas de cambios de rol
 */
export interface GetRoleChangeStatisticsFlowResult {
    success: boolean;
    statistics?: RoleChangeStatistics;
    error?: string;
}

/**
 * RoleChangesFlow - Flujo de gestión de cambios de roles
 *
 * Maneja todas las operaciones relacionadas con el historial de cambios de roles
 */
export const roleChangesFlow = {
    /**
     * Crear un nuevo registro de cambio de rol
     *
     * @param changeData - Datos del cambio de rol
     * @returns CreateRoleChangeFlowResult
     */
    async createRoleChange(changeData: CreateRoleChangeData): Promise<CreateRoleChangeFlowResult> {
        try {
            const roleChange = await roleChangesService.createRoleChange(changeData);

            return {
                success: true,
                roleChange,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleChangesFlow.createRoleChange:', error);
            return {
                success: false,
                error: getRoleChangesErrorMessage(error),
            };
        }
    },

    /**
     * Obtener todos los cambios de roles con filtros opcionales
     *
     * @param searchData - Datos de búsqueda opcionales
     * @returns GetRoleChangesFlowResult
     */
    async getAllRoleChanges(searchData?: SearchRoleChangesData): Promise<GetRoleChangesFlowResult> {
        try {
            const result = await roleChangesService.getAllRoleChanges(searchData);

            return {
                success: true,
                data: result.data,
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleChangesFlow.getAllRoleChanges:', error);
            return {
                success: false,
                error: getRoleChangesErrorMessage(error),
            };
        }
    },

    /**
     * Obtener cambios de roles para un usuario específico
     *
     * @param userId - ID del usuario
     * @param searchData - Datos de búsqueda opcionales
     * @returns GetRoleChangesFlowResult
     */
    async getRoleChangesByUser(
        userId: number,
        searchData?: SearchRoleChangesData
    ): Promise<GetRoleChangesFlowResult> {
        try {
            const result = await roleChangesService.getRoleChangesByUser(userId, searchData);

            return {
                success: true,
                data: result.data,
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleChangesFlow.getRoleChangesByUser:', error);
            return {
                success: false,
                error: getRoleChangesErrorMessage(error),
            };
        }
    },

    /**
     * Obtener cambios de roles realizados por un admin específico
     *
     * @param adminId - ID del admin
     * @param searchData - Datos de búsqueda opcionales
     * @returns GetRoleChangesFlowResult
     */
    async getRoleChangesByAdmin(
        adminId: number,
        searchData?: SearchRoleChangesData
    ): Promise<GetRoleChangesFlowResult> {
        try {
            const result = await roleChangesService.getRoleChangesByAdmin(adminId, searchData);

            return {
                success: true,
                data: result.data,
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleChangesFlow.getRoleChangesByAdmin:', error);
            return {
                success: false,
                error: getRoleChangesErrorMessage(error),
            };
        }
    },

    /**
     * Obtener un cambio de rol específico por ID
     *
     * @param id - ID del cambio de rol
     * @returns GetRoleChangeFlowResult
     */
    async getRoleChangeById(id: number): Promise<GetRoleChangeFlowResult> {
        try {
            const roleChange = await roleChangesService.getRoleChangeById(id);

            return {
                success: true,
                roleChange,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleChangesFlow.getRoleChangeById:', error);
            return {
                success: false,
                error: getRoleChangesErrorMessage(error),
            };
        }
    },

    /**
     * Obtener estadísticas de cambios de roles
     *
     * @returns GetRoleChangeStatisticsFlowResult
     */
    async getRoleChangeStatistics(): Promise<GetRoleChangeStatisticsFlowResult> {
        try {
            const statistics = await roleChangesService.getRoleChangeStatistics();

            return {
                success: true,
                statistics,
            };
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error en roleChangesFlow.getRoleChangeStatistics:', error);
            return {
                success: false,
                error: getRoleChangesErrorMessage(error),
            };
        }
    },
};