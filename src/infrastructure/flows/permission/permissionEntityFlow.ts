import { permissionEntityService } from '../../../services/permissionEntityService';
import type { PermissionEntity, CreatePermissionData, UpdatePermissionData } from '../../../types/permissionEntity';
import { getPermissionErrorMessage } from './validation/permissionValidations';

/**
 * Resultado del flujo de obtención de permisos
 */
export interface GetPermissionsFlowResult {
    success: boolean;
    permissions?: PermissionEntity[];
    error?: string;
}

/**
 * Resultado del flujo de obtención de un permiso
 */
export interface GetPermissionFlowResult {
    success: boolean;
    permission?: PermissionEntity;
    error?: string;
}

/**
 * Resultado del flujo de creación de permiso
 */
export interface CreatePermissionFlowResult {
    success: boolean;
    permission?: PermissionEntity;
    error?: string;
}

/**
 * Resultado del flujo de actualización de permiso
 */
export interface UpdatePermissionFlowResult {
    success: boolean;
    permission?: PermissionEntity;
    error?: string;
}

/**
 * Resultado del flujo de eliminación de permiso
 */
export interface DeletePermissionFlowResult {
    success: boolean;
    error?: string;
}

/**
 * Resultado del flujo de exportación de permisos
 */
export interface ExportPermissionsFlowResult {
    success: boolean;
    jsonData?: string;
    error?: string;
}

/**
 * PermissionEntityFlow - Flujo de gestión de permisos como entidades
 *
 * Maneja todas las operaciones CRUD relacionadas con permisos
 */
export const permissionEntityFlow = {
    /**
     * Inicializa el flujo asegurando que el servicio esté listo
     */
    async initialize(): Promise<void> {
        await permissionEntityService.initialize();
    },

    /**
     * Obtener todos los permisos
     *
     * @returns GetPermissionsFlowResult con la lista de permisos
     */
    async getAllPermissions(): Promise<GetPermissionsFlowResult> {
        try {
            const permissions = await permissionEntityService.getAllPermissions();

            return {
                success: true,
                permissions,
            };
        } catch (error: any) {
            console.error('Error en permissionEntityFlow.getAllPermissions:', error);
            return {
                success: false,
                error: getPermissionErrorMessage(error),
            };
        }
    },

    /**
     * Obtener un permiso por ID
     *
     * @param id - ID del permiso
     * @returns GetPermissionFlowResult con el permiso
     */
    async getPermissionById(id: number): Promise<GetPermissionFlowResult> {
        try {
            const permission = await permissionEntityService.getPermissionById(id);

            return {
                success: true,
                permission,
            };
        } catch (error: any) {
            console.error('Error en permissionEntityFlow.getPermissionById:', error);
            return {
                success: false,
                error: getPermissionErrorMessage(error),
            };
        }
    },

    /**
     * Crear un nuevo permiso
     *
     * @param data - Datos del permiso a crear
     * @returns CreatePermissionFlowResult con el permiso creado
     */
    async createPermission(data: CreatePermissionData): Promise<CreatePermissionFlowResult> {
        try {
            const permission = await permissionEntityService.createPermission(data);

            return {
                success: true,
                permission,
            };
        } catch (error: any) {
            console.error('Error en permissionEntityFlow.createPermission:', error);
            return {
                success: false,
                error: getPermissionErrorMessage(error),
            };
        }
    },

    /**
     * Actualizar un permiso existente
     *
     * @param id - ID del permiso
     * @param data - Datos a actualizar
     * @returns UpdatePermissionFlowResult con el permiso actualizado
     */
    async updatePermission(id: number, data: UpdatePermissionData): Promise<UpdatePermissionFlowResult> {
        try {
            const permission = await permissionEntityService.updatePermission(id, data);

            return {
                success: true,
                permission,
            };
        } catch (error: any) {
            console.error('Error en permissionEntityFlow.updatePermission:', error);
            return {
                success: false,
                error: getPermissionErrorMessage(error),
            };
        }
    },

    /**
     * Eliminar un permiso
     *
     * @param id - ID del permiso a eliminar
     * @returns DeletePermissionFlowResult
     */
    async deletePermission(id: number): Promise<DeletePermissionFlowResult> {
        try {
            await permissionEntityService.deletePermission(id);

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Error en permissionEntityFlow.deletePermission:', error);
            return {
                success: false,
                error: getPermissionErrorMessage(error),
            };
        }
    },

    /**
     * Exportar permisos como JSON
     *
     * @returns ExportPermissionsFlowResult con los datos JSON
     */
    async exportPermissionsToJson(): Promise<ExportPermissionsFlowResult> {
        try {
            const jsonData = await permissionEntityService.exportToJson();

            return {
                success: true,
                jsonData,
            };
        } catch (error: any) {
            console.error('Error en permissionEntityFlow.exportPermissionsToJson:', error);
            return {
                success: false,
                error: getPermissionErrorMessage(error),
            };
        }
    },

    /**
     * Descargar permisos como archivo JSON
     *
     * @param filename - Nombre del archivo (opcional)
     * @returns ExportPermissionsFlowResult
     */
    async downloadPermissionsAsJson(filename?: string): Promise<ExportPermissionsFlowResult> {
        try {
            await permissionEntityService.downloadAsJson(filename);

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Error en permissionEntityFlow.downloadPermissionsAsJson:', error);
            return {
                success: false,
                error: getPermissionErrorMessage(error),
            };
        }
    },
};