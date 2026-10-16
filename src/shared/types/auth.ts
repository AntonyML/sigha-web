import type { OrganizationSummary } from '@/shared/types/organization';

export interface LoginCredentials {
  uEmail: string;
  uPassword: string;
  twoFactorCode?: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
  requiresTwoFactor?: boolean;
  tempToken?: string;
  organizations?: OrganizationSummary[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  uEmail: string;
  uName: string;
  uFLastName?: string;
  uSLastName?: string;
  /**
   * Effective organization roles (from the active membership). Kept as `roles`
   * for backwards compatibility with existing permission checks.
   */
  roles: string[];
  /** Effective organization role ids (active membership); same note as `roles`. */
  roleIds: number[];
  /** Organization roles of the active membership (canonical claim). */
  orgRoles?: string[];
  /** Organization role ids of the active membership (canonical claim). */
  orgRoleIds?: number[];
  /** SaaS platform-plane role (PLATFORM_OWNER | PLATFORM_SUPPORT | null). */
  platformRole?: string | null;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface UserSession {
  id: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

export interface SessionsResponse {
  sessions: UserSession[];
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
