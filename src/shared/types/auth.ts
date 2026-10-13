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
  roles: string[];
  roleIds: number[];
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
