import { authStorage } from '../infrastructure/storage/authStorage';
import { roleFlow } from '../infrastructure/flows/role';

/**
 * PermissionUtils - Utilidades para verificar permisos del usuario actual
 *
 * Proporciona funciones para verificar si el usuario actual tiene permisos
 * para realizar operaciones específicas en el sistema.
 */

export class PermissionUtils {
    /**
     * Verifica si el usuario actual es SUPER_ADMIN
     */
    static async isSuperAdmin(): Promise<boolean> {
        try {
            const currentUser = authStorage.getUser();
            if (!currentUser || !currentUser.role) {
                return false;
            }

            // Si role es un número (ID del rol), verificar si es admin
            if (typeof currentUser.role === 'number') {
                const result = await roleFlow.isAdminRole(currentUser.role);
                return result.success && result.isAdmin === true;
            }

            // Si role es un string, verificar si contiene "SUPER" o "ADMIN"
            if (typeof currentUser.role === 'string') {
                const roleName = currentUser.role.toUpperCase();
                return roleName.includes('SUPER') || roleName.includes('ADMIN');
            }

            return false;
        } catch (error) {
            console.error('Error verificando permisos de SUPER_ADMIN:', error);
            return false;
        }
    }

    /**
     * Verifica si el usuario actual puede crear usuarios
     */
    static async canCreateUsers(): Promise<boolean> {
        return await this.isSuperAdmin();
    }

    /**
     * Verifica si el usuario actual puede editar usuarios
     */
    static async canEditUsers(): Promise<boolean> {
        return await this.isSuperAdmin();
    }

    /**
     * Verifica si el usuario actual puede eliminar usuarios
     */
    static async canDeleteUsers(): Promise<boolean> {
        return await this.isSuperAdmin();
    }

    /**
     * Verifica si el usuario actual puede gestionar roles
     */
    static async canManageRoles(): Promise<boolean> {
        return await this.isSuperAdmin();
    }

    /**
     * Verifica si el usuario actual puede ver todos los usuarios
     */
    static async canViewAllUsers(): Promise<boolean> {
        return await this.isSuperAdmin();
    }

    /**
     * Verifica si el usuario actual puede cambiar el estado de usuarios (activar/desactivar)
     */
    static async canToggleUserStatus(): Promise<boolean> {
        return await this.isSuperAdmin();
    }

    /**
     * Obtiene el rol del usuario actual como string
     */
    static getCurrentUserRole(): string | null {
        const currentUser = authStorage.getUser();
        if (!currentUser) return null;

        if (typeof currentUser.role === 'string') {
            return currentUser.role;
        }

        if (typeof currentUser.role === 'number') {
            return `ID: ${currentUser.role}`;
        }

        return null;
    }

    /**
     * Verifica si el usuario está autenticado
     */
    static isAuthenticated(): boolean {
        return authStorage.isAuthenticated();
    }

    /**
     * Obtiene el rol del usuario actual como string en minúsculas
     */
    static getRole(): string | null {
        const currentUser = authStorage.getUser();
        if (!currentUser || !currentUser.role) {
            return null;
        }
        return typeof currentUser.role === 'string' ? currentUser.role.toLowerCase() : null;
    }

    static isSuperAdminSync(): boolean {
        const role = this.getRole();
        return role === 'super admin';
    }

    static isAdminSync(): boolean {
        const role = this.getRole();
        return role === 'admin';
    }

    static isDirectorSync(): boolean {
        const role = this.getRole();
        return role === 'director';
    }

    static isNurseSync(): boolean {
        const role = this.getRole();
        return role === 'nurse';
    }

    static isPhysiotherapistSync(): boolean {
        const role = this.getRole();
        return role === 'physiotherapist';
    }

    static isPsychologistSync(): boolean {
        const role = this.getRole();
        return role === 'psychologist';
    }

    static isSocialWorkerSync(): boolean {
        const role = this.getRole();
        return role === 'social worker';
    }

    static isNotSpecifiedSync(): boolean {
        const role = this.getRole();
        return role === 'not specified' || role === null;
    }

    static isAdminOrDirectorSync(): boolean {
        const role = this.getRole();
        return role === 'super admin' || role === 'admin' || role === 'director';
    }

    /**
     * Verifica si el usuario actual tiene acceso a un módulo específico del sistema
     */
    static canAccessModule(moduleName: string): boolean {
        const role = this.getRole();
        if (!role || role === 'not specified') {
            // Módulos públicos que cualquier usuario puede acceder (como twoFactor y profile)
            return moduleName === 'twoFactor' || moduleName === 'profile' || moduleName === 'main';
        }

        switch (moduleName) {
            // Administración avanzada: sólo super admin y admin
            case 'users':
            case 'roles':
            case 'permissions':
            case 'audits':
                return role === 'super admin' || role === 'admin';

            // Módulos clínicos y operativos generales
            case 'virtualFiles':
            case 'programs':
            case 'subPrograms':
            case 'entranceExit':
            case 'dashboard':
                return [
                    'super admin',
                    'admin',
                    'director',
                    'nurse',
                    'physiotherapist',
                    'psychologist',
                    'social worker'
                ].includes(role);

            // Módulos clínicos restringidos a enfermería
            case 'vaccines':
            case 'nursing':
                return [
                    'super admin',
                    'admin',
                    'director',
                    'nurse'
                ].includes(role);

            // Módulos generales
            case 'twoFactor':
            case 'profile':
            case 'main':
                return true;

            default:
                return false;
        }
    }
}