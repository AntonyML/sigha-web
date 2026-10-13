/**
 * Profile Flow - Flujo de gestión de perfil de usuario
 *
 * SINCRONIZADO CON BACKEND NestJS profile.service.ts
 * Endpoints disponibles:
 * - GET /profile
 * - PUT /profile
 * - POST /profile/change-password
 *
 * Encapsula toda la lógica de gestión del perfil de usuario.
 */

export { profileFlow } from '@/modules/identity/application/flows/profile/profileFlow';
export type { GetProfileFlowResult, UpdateProfileFlowResult, ChangePasswordFlowResult } from '@/modules/identity/application/flows/profile/profileFlow';