// ==================== Login & Auth ====================

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
  role?: string | number;
}

export interface AuthUserRole {
  id: number;
  name: string;
  permissions?: string[];
}

// ==================== Token Management ====================

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ==================== Password Management ====================

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

// ==================== Email Verification ====================

export interface VerifyEmailData {
  token: string;
}

// ==================== Session Management ====================

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

// ==================== Error Handling ====================

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}