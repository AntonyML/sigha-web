// permissions.ts
// Sistema de permisos dinámico para el Hogar de Ancianos

/**
 * Acciones básicas disponibles en el sistema
 */
export const PermissionAction = {
  VIEW: 'view',      // Ver/listar
  CREATE: 'create',  // Crear
  EDIT: 'edit',      // Editar/modificar
  DELETE: 'delete',  // Eliminar
} as const;

export type PermissionActionType = typeof PermissionAction[keyof typeof PermissionAction];

/**
 * Módulos del sistema (basados en las páginas/rutas disponibles)
 */
export const PermissionModule = {
  USERS: 'users',           // Gestión de usuarios
  ROLES: 'roles',           // Gestión de roles
  AUDITS: 'audits',         // Auditorías
  DASHBOARD: 'dashboard',   // Dashboard principal
  VIRTUAL_FILES: 'virtualFiles', // Archivos virtuales (adultos mayores)
  PROGRAMS: 'programs',     // Programas
  VACCINES: 'vaccines',     // Vacunas
  SUB_PROGRAMS: 'subPrograms', // Sub-programas
  ENTRANCE_EXIT: 'entranceExit', // Entrada/Salida
  TWO_FACTOR: 'twoFactor',  // Configuración 2FA
  // CONFIGURATIONS = 'configurations', // Futuro: Configuraciones del sistema
  // PROFILE = 'profile', // Futuro: Perfil de usuario
} as const;

export type PermissionModuleType = typeof PermissionModule[keyof typeof PermissionModule];

/**
 * Estructura de un permiso individual
 */
export interface Permission {
  module: PermissionModuleType;
  action: PermissionActionType;
  enabled: boolean;
}

/**
 * Permisos por rol
 */
export interface RolePermissions {
  roleId: number;
  roleName: string;
  permissions: Permission[];
}

/**
 * Resultado de verificación de permisos
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  requiredPermission?: Permission;
  userPermissions?: Permission[];
}

/**
 * Configuración completa de permisos del sistema
 */
export interface PermissionsConfig {
  roles: RolePermissions[];
  defaultPermissions: Permission[]; // Permisos por defecto para roles nuevos
  publicModules: PermissionModuleType[]; // Módulos accesibles sin autenticación
}