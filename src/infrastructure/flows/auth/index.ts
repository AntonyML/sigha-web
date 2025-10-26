/**
 * Auth Flow - Flujo de gestión de autenticación
 *
 * SINCRONIZADO CON BACKEND NestJS auth.service.ts
 * Endpoints disponibles:
 * - POST /auth/login
 * - POST /auth/verify-2fa
 * - POST /auth/refresh
 * - POST /auth/logout
 * - GET /auth/me
 *
 * Encapsula toda la lógica de autenticación incluyendo login, 2FA,
 * refresh tokens y gestión de sesión.
 */

export { authFlow } from './authFlow';
export type { LoginFlowResult, Verify2FAFlowResult, LogoutFlowResult } from './authFlow';