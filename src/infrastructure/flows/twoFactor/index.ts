/**
 * Two Factor Flow - Flujo de gestión de autenticación de dos factores
 *
 * SINCRONIZADO CON BACKEND NestJS two-factor.service.ts
 * Endpoints disponibles:
 * - GET /2fa/status
 * - POST /2fa/setup
 * - POST /2fa/enable
 * - POST /2fa/verify
 * - POST /2fa/disable
 *
 * Encapsula toda la lógica de gestión de 2FA.
 */

export { twoFactorFlow } from './twoFactorFlow';
export type {
  Get2FAStatusFlowResult,
  Setup2FAFlowResult,
  Enable2FAFlowResult,
  Verify2FAFlowResult,
  Disable2FAFlowResult
} from './twoFactorFlow';

// Context and hooks for global 2FA state management
export { TwoFactorProvider } from './TwoFactorContext';
export { useTwoFactorStatus } from './useTwoFactorStatus';