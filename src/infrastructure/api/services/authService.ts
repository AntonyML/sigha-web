import axios from 'axios';
import type { LoginResponse, AuthUser } from '@/shared/types/auth'
import type { ActiveOrganizationResponse, OrganizationSummary } from '@/shared/types/organization';
import { createApiClient } from '@/infrastructure/api/organizationAccessRedirect';
import { navigateTo, getCurrentPath } from '@/shared/lib/navigationUtils'
import { config } from '@/shared/config/app.config';

const ORGANIZATION_SELECTION_KEY = 'organizationSelectionPending';

const apiClient = createApiClient({
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
  orgId?: number | null;
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
    authService.setOrganizationSelectionPending(false);

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
      authService.setOrganizationSelectionPending((response.data.organizations?.length ?? 0) > 1);
      window.dispatchEvent(new CustomEvent('authTokenChanged'));
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
      authService.setOrganizationSelectionPending((response.data.organizations?.length ?? 0) > 1);
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

  requestUserAccount: async (data: { fullName: string; email: string; phone: string; reason: string }): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post<{ success: boolean; message: string }>(
      `${config.api.baseUrl}/user-requests`,
      data,
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

  getOrganizations: async (): Promise<OrganizationSummary[]> => {
    const response = await apiClient.get<OrganizationSummary[]>('/auth/organizations');
    return response.data;
  },

  getActiveOrganizationId: (): number | null => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const orgId = decodeJwtPayload(token)?.orgId;
    return typeof orgId === 'number' ? orgId : null;
  },

  hasPendingOrganizationSelection: (): boolean =>
    typeof window !== 'undefined' && sessionStorage.getItem(ORGANIZATION_SELECTION_KEY) === 'true',

  setOrganizationSelectionPending: (pending: boolean): void => {
    if (typeof window === 'undefined') return;
    if (pending) sessionStorage.setItem(ORGANIZATION_SELECTION_KEY, 'true');
    else sessionStorage.removeItem(ORGANIZATION_SELECTION_KEY);
  },

  switchActiveOrganization: async (organizationId: number): Promise<ActiveOrganizationResponse> => {
    const response = await apiClient.post<ActiveOrganizationResponse>('/auth/active-organization', {
      organizationId,
    });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('authToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
    const tokenPayload = decodeJwtPayload(accessToken);
    const currentUser = authService.getStoredUser();
    if (currentUser && tokenPayload) {
      const updatedUser: AuthUser = {
        ...currentUser,
        ...(Array.isArray(tokenPayload.roles)
          ? { roles: tokenPayload.roles.filter((role): role is string => typeof role === 'string') }
          : {}),
        ...(Array.isArray(tokenPayload.roleIds)
          ? { roleIds: tokenPayload.roleIds.filter((roleId): roleId is number => typeof roleId === 'number') }
          : {}),
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    authService.setOrganizationSelectionPending(false);
    window.dispatchEvent(new CustomEvent('authTokenChanged'));
    return response.data;
  },

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
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
    authService.setOrganizationSelectionPending(false);
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      authService.clearLocalSession();
    }
  },
};
