import { httpClient } from './httpClient';

// ═══════════════════════════════════════════════════════════
//  Tipos — Política de contraseñas
// ═══════════════════════════════════════════════════════════

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpirationDays: number; // 0 = sin expiración
  preventPasswordReuse: number;   // 0 = no prevenir
}

// ═══════════════════════════════════════════════════════════
//  Tipos — 2FA obligatorio
// ═══════════════════════════════════════════════════════════

export interface TwoFactorPolicy {
  enforceForAll: boolean;          // 2FA obligatorio para todos
  enforceForRoles: string[];       // roles que deben tener 2FA
  gracePeriodHours: number;        // horas de gracia antes de forzar
}

// ═══════════════════════════════════════════════════════════
//  Tipos — Sesiones
// ═══════════════════════════════════════════════════════════

export interface SessionPolicy {
  maxConcurrentSessions: number;   // 0 = ilimitadas
  sessionTimeoutMinutes: number;   // minutos de inactividad
  maxSessionDurationHours: number; // 0 = sin límite
}

export interface ActiveSession {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  ipAddress: string;
  deviceInfo: string;
  loginAt: string;
  lastActivity: string;
  current: boolean;
}

// ═══════════════════════════════════════════════════════════
//  Tipos — Intentos de login
// ═══════════════════════════════════════════════════════════

export interface LoginAttemptsPolicy {
  maxAttempts: number;             // intentos antes de bloquear
  lockoutDurationMinutes: number;   // minutos de bloqueo
  attemptWindowMinutes: number;     // ventana de intentos
  resetAttemptsOnSuccess: boolean;
}

export interface LoginAttemptRecord {
  id: number;
  userEmail: string;
  ipAddress: string;
  success: boolean;
  attemptedAt: string;
  failureReason?: string;
}

// ═══════════════════════════════════════════════════════════
//  Respuesta conjunta (settings category = "security")
// ═══════════════════════════════════════════════════════════

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  twoFactorPolicy: TwoFactorPolicy;
  sessionPolicy: SessionPolicy;
  loginAttemptsPolicy: LoginAttemptsPolicy;
}

// ═══════════════════════════════════════════════════════════
//  Servicio
// ═══════════════════════════════════════════════════════════

export const securityService = {
  /** GET /settings/security — obtiene toda la configuración de seguridad de system_settings JSONB */
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const resp = await httpClient.get<{ id: number; category: string; settings: SecuritySettings }>(
      '/settings/security',
    );
    return resp.data.settings;
  },

  /** PUT /settings/security — actualiza toda la configuración de seguridad en JSONB */
  updateSecuritySettings: async (payload: SecuritySettings): Promise<SecuritySettings> => {
    const resp = await httpClient.put<{ id: number; category: string; settings: SecuritySettings }>(
      '/settings/security',
      payload,
    );
    return resp.data.settings;
  },

  /**
   * Wrapper para actualizar solo política de contraseñas
   * Realmente usa updateSecuritySettings, pero conserva la interfaz
   */
  updatePasswordPolicy: async (payload: PasswordPolicy): Promise<PasswordPolicy> => {
    const data = await securityService.getSecuritySettings();
    const updated = await securityService.updateSecuritySettings({
      ...data,
      passwordPolicy: payload,
    });
    return updated.passwordPolicy;
  },

  /**
   * Wrapper para actualizar solo política 2FA
   */
  updateTwoFactorPolicy: async (payload: TwoFactorPolicy): Promise<TwoFactorPolicy> => {
    const data = await securityService.getSecuritySettings();
    const updated = await securityService.updateSecuritySettings({
      ...data,
      twoFactorPolicy: payload,
    });
    return updated.twoFactorPolicy;
  },

  /**
   * Wrapper para actualizar solo política de sesiones
   */
  updateSessionPolicy: async (payload: SessionPolicy): Promise<SessionPolicy> => {
    const data = await securityService.getSecuritySettings();
    const updated = await securityService.updateSecuritySettings({
      ...data,
      sessionPolicy: payload,
    });
    return updated.sessionPolicy;
  },

  /**
   * Wrapper para actualizar solo política de intentos
   */
  updateLoginAttemptsPolicy: async (payload: LoginAttemptsPolicy): Promise<LoginAttemptsPolicy> => {
    const data = await securityService.getSecuritySettings();
    const updated = await securityService.updateSecuritySettings({
      ...data,
      loginAttemptsPolicy: payload,
    });
    return updated.loginAttemptsPolicy;
  },

  // ── Sesiones activas (no implementado en backend) ──────────────────

  /**
   * API no implementada — tabla user_sessions existe pero no hay endpoint.
   * Devolver array vacío para permitir renderizado de UI stub.
   */
  getActiveSessions: async (): Promise<ActiveSession[]> => {
    // @todo: implementar cuando backend exponga /auth/sessions
    return [];
  },

  /**
   * API no implementada — tabla user_sessions existe pero no hay endpoint.
   * Solo simular resultado ok para stubs de UI.
   */
  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    console.warn(`[stub] revokeSession(${sessionId}) — API no implementada`);
    return { message: "API no implementada" };
  },

  /**
   * API no implementada — tabla user_sessions existe pero no hay endpoint.
   * Solo simular resultado ok para stubs de UI.
   */
  revokeAllSessions: async (): Promise<{ message: string }> => {
    console.warn("[stub] revokeAllSessions — API no implementada");
    return { message: "API no implementada" };
  },

  // ── Intentos de login (no implementado en backend) ────────────────

  /**
   * API no implementada — tabla login_attempts existe pero no hay endpoint.
   * Devolver array vacío para stub de UI.
   */
  getLoginAttempts: async (): Promise<{ attempts: LoginAttemptRecord[]; total: number }> => {
    return { attempts: [], total: 0 };
  },
};
