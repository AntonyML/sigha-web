import axios from 'axios';
import type { LoginResponse, AuthUser } from '../types/auth'
import { navigateTo, getCurrentPath } from '../utils/navigationUtils'
import { config } from '../config/app.config';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (reqConfig) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const currentPath = getCurrentPath();

      if (!requestUrl.includes('/auth/login') && currentPath !== '/login') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tempToken');
        navigateTo('/login');
      }
    }
    return Promise.reject(error);
  }
);

interface JwtPayload {
  sub?: number;
  email?: string;
  roleIds?: number[];
  roles?: string[];
  twoFactorVerified?: boolean;
  [key: string]: unknown;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function extractRoleIdsFromToken(token: string): number[] {
  const payload = decodeJwtPayload(token);
  if (!payload || !Array.isArray(payload.roleIds)) return [];
  return payload.roleIds.filter((n): n is number => typeof n === 'number');
}

function extractRolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload || !Array.isArray(payload.roles)) return [];
  return payload.roles.filter((s): s is string => typeof s === 'string');
}

export const authService = {
  login: async (credentials: { uEmail: string; uPassword: string }): Promise<LoginResponse> => {
    localStorage.removeItem('tempToken');

    const requestBody: {
      uEmail: string;
      uPassword: string;
      twoFactorCode?: string;
    } = {
      uEmail: credentials.uEmail,
      uPassword: credentials.uPassword,
    };

    const response = await apiClient.post<LoginResponse>('/auth/login', requestBody);
    const { requiresTwoFactor, accessToken, user, tempToken } = response.data;

    if (requiresTwoFactor && tempToken) {
      localStorage.setItem('tempToken', tempToken);
      return response.data;
    }

    if (accessToken && user) {
      const roleIds = extractRoleIdsFromToken(accessToken);
      const roles = Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles
        : extractRolesFromToken(accessToken);

      const enrichedUser: AuthUser = {
        ...user,
        roles,
        roleIds,
      };

      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }

    return response.data;
  },

  verify2FA: async (twoFactorCode: string): Promise<LoginResponse> => {
    const tempToken = authService.getTempToken();
    if (!tempToken) {
      throw new Error('No se encontró un token temporal de verificación. Inicia sesión nuevamente.');
    }

    const response = await apiClient.post<LoginResponse>('/auth/verify-2fa', {
      tempToken,
      twoFactorCode: twoFactorCode.replace(/[\s-]/g, ''),
    });

    const { accessToken, refreshToken, user } = response.data;

    if (accessToken && refreshToken && user) {
      const roleIds = extractRoleIdsFromToken(accessToken);
      const roles = Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles
        : extractRolesFromToken(accessToken);

      const enrichedUser: AuthUser = {
        ...user,
        roles,
        roleIds,
      };

      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      localStorage.removeItem('tempToken');
      window.dispatchEvent(new CustomEvent('authTokenChanged'));
    }

    return response.data;
  },

  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<{ user: { sub: number; email: string; roleIds: number[]; roles: string[]; twoFactorVerified: boolean } }>('/auth/profile');
    const u = response.data.user;
    return {
      id: u.sub,
      uEmail: u.email,
      uName: '',
      roles: Array.isArray(u.roles) ? u.roles : [],
      roleIds: Array.isArray(u.roleIds) ? u.roleIds : [],
    };
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(
      `${config.api.baseUrl}/auth/forgot-password`,
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(
      `${config.api.baseUrl}/auth/reset-password`,
      { token, newPassword },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getToken: (): string | null => localStorage.getItem('authToken'),

  getTempToken: (): string | null => localStorage.getItem('tempToken'),

  getStoredUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const parsed = JSON.parse(userStr) as Partial<AuthUser>;
      if (!parsed || !Array.isArray(parsed.roles)) return null;
      return {
        id: parsed.id ?? 0,
        uEmail: parsed.uEmail ?? '',
        uName: parsed.uName ?? '',
        uFLastName: parsed.uFLastName,
        uSLastName: parsed.uSLastName,
        roles: parsed.roles,
        roleIds: Array.isArray(parsed.roleIds) ? parsed.roleIds : [],
      };
    } catch {
      return null;
    }
  },

  clearLocalSession: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      authService.clearLocalSession();
    }
  },
};
