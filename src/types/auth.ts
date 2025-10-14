// ==================== Login & Auth ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  roleId?: number;
}

export interface AuthUserRole {
  id: number;
  name: string;
  permissions: string[];
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