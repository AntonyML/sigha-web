/**
 * User Management Flow - Flujo de gestión de usuarios
 *
 * SINCRONIZADO CON BACKEND NestJS user.service.ts
 * Endpoints disponibles:
 * - GET /users
 * - GET /users/:id
 * - POST /users
 * - PUT /users/:id
 * - DELETE /users/:id
 * - POST /users/:id/toggle-status
 * - GET /users/search
 *
 * Encapsula toda la lógica de gestión de usuarios del sistema.
 */

export { userManagementFlow } from './userManagementFlow';
export type {
  GetUsersFlowResult,
  GetUserFlowResult,
  CreateUserFlowResult,
  UpdateUserFlowResult,
  DeleteUserFlowResult,
  SearchUsersFlowResult,
  ToggleUserStatusFlowResult
} from './userManagementFlow';