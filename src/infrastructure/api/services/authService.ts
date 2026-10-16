import axios from 'axios';
import type { LoginResponse, AuthUser } from '@/shared/types/auth'
import type { ActiveOrganization, ActiveOrganizationResponse, OrganizationSummary } from '@/shared/types/organization';
import { createApiClient } from '@/infrastructure/api/organizationAccessRedirect';
import { navigateTo, getCurrentPath } from '@/shared/lib/navigationUtils'
import { config } from '@/shared/config/app.config';

const ORGANIZATION_SELECTION_KEY = 'organizationSelectionPending';

function mapOrganizationSummary(organization: OrganizationSummary): OrganizationSummary {
  return {
    ...organization,
    status: organization.status ?? 'ACTIVE',
    planTier: organization.planTier ?? 'BASIC',
    brandingOverrides: organization.brandingOverrides ?? null,
  };
}

function mapActiveOrganization(organization: ActiveOrganization): ActiveOrganization {
  return {
    ...organization,
    status: organization.status ?? 'ACTIVE',
    planTier: organization.planTier ?? 'BASIC',
    brandingOverrides: organization.brandingOverrides ?? null,
  };
}

function mapActiveOrganizationResponse(response: ActiveOrganizationResponse): ActiveOrganizationResponse {
  return {
    ...response,
    activeOrganization: mapActiveOrganization(response.activeOrganization),
    organizations: response.organizations.map(mapOrganizationSummary),
  };
}

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
  orgRoleIds?: number[];
  orgRoles?: string[];
  platformRole?: string | null;
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

const isNumber = (value: unknown): value is number => typeof value === 'number';
const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Effective organization role ids of the active membership. Prefers the
 * canonical `orgRoleIds` claim and falls back to the legacy `roleIds` claim
 * while the API still emits both.
 */
function extractOrgRoleIdsFromToken(token: string): number[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];
  if (Array.isArray(payload.orgRoleIds)) return payload.orgRoleIds.filter(isNumber);
  return Array.isArray(payload.roleIds) ? payload.roleIds.filter(isNumber) : [];
}

/** Effective organization roles of the active membership (canonical `orgRoles`, legacy `roles`). */
function extractOrgRolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];
  if (Array.isArray(payload.orgRoles)) return payload.orgRoles.filter(isString);
  return Array.isArray(payload.roles) ? payload.roles.filter(isString) : [];
}

/** Platform-plane role claim, or null when the user has no platform role. */
function extractPlatformRoleFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return typeof payload?.platformRole === 'string' ? payload.platformRole : null;
}

/**
 * Builds the persisted user from an API user payload and its access token,
 * resolving the effective (organization-scoped) roles and the platform role.
 */
function buildAuthUser(
  user: AuthUser,
  accessToken: string,
): AuthUser {
  const orgRoles = Array.isArray(user.orgRoles) && user.orgRoles.length > 0
    ? user.orgRoles
    : extractOrgRolesFromToken(accessToken);
  const orgRoleIds = Array.isArray(user.orgRoleIds) && user.orgRoleIds.length > 0
    ? user.orgRoleIds
    : extractOrgRoleIdsFromToken(accessToken);
  const platformRole = user.platformRole ?? extractPlatformRoleFromToken(accessToken);

  return {
    ...user,
    // Effective (organization-scoped) roles drive existing permission checks.
    roles: orgRoles,
    roleIds: orgRoleIds,
    orgRoles,
    orgRoleIds,
    platformRole,
  };
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
      const enrichedUser = buildAuthUser(user, accessToken);

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
      const enrichedUser = buildAuthUser(user, accessToken);

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
    const response = await apiClient.get<{
      user: {
        id?: number;
        userId?: number;
        sub?: number;
        uEmail?: string;
        email?: string;
        uName?: string;
        roleIds?: number[];
        roles?: string[];
        orgRoleIds?: number[];
        orgRoles?: string[];
        platformRole?: string | null;
        twoFactorVerified?: boolean;
      };
    }>('/auth/profile');
    const u = response.data.user;
    const orgRoles = Array.isArray(u.orgRoles) ? u.orgRoles : undefined;
    const orgRoleIds = Array.isArray(u.orgRoleIds) ? u.orgRoleIds : undefined;
    return {
      id: u.id ?? u.userId ?? u.sub ?? 0,
      uEmail: u.uEmail ?? u.email ?? '',
      uName: u.uName ?? '',
      roles: orgRoles ?? (Array.isArray(u.roles) ? u.roles : []),
      roleIds: orgRoleIds ?? (Array.isArray(u.roleIds) ? u.roleIds : []),
      orgRoles,
      orgRoleIds,
      platformRole: u.platformRole ?? null,
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
    return response.data.map(mapOrganizationSummary);
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
    const response = await apiClient.post<ActiveOrganizationResponse>('/auth/context', {
      organizationId,
    });
    const mappedResponse = mapActiveOrganizationResponse(response.data);
    const { accessToken, refreshToken } = mappedResponse;
    localStorage.setItem('authToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
    const currentUser = authService.getStoredUser();
    if (currentUser) {
      const orgRoles = extractOrgRolesFromToken(accessToken);
      const orgRoleIds = extractOrgRoleIdsFromToken(accessToken);
      const updatedUser: AuthUser = {
        ...currentUser,
        roles: orgRoles,
        roleIds: orgRoleIds,
        orgRoles,
        orgRoleIds,
        platformRole: extractPlatformRoleFromToken(accessToken) ?? currentUser.platformRole ?? null,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    authService.setOrganizationSelectionPending(false);
    window.dispatchEvent(new CustomEvent('authTokenChanged'));
    return mappedResponse;
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
        orgRoles: Array.isArray(parsed.orgRoles) ? parsed.orgRoles : undefined,
        orgRoleIds: Array.isArray(parsed.orgRoleIds) ? parsed.orgRoleIds : undefined,
        platformRole: parsed.platformRole ?? null,
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
