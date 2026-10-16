import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { config } from '@/shared/config/app.config';
import { authStorage } from '@/infrastructure/storage/authStorage';
import type {
  CreatePlatformOrganizationPayload,
  PlatformOrganization,
  PlatformStepUpResponse,
  UpdatePlatformOrganizationPayload,
} from '@/shared/types/platform';

/**
 * Dedicated client for the SaaS platform plane. It intentionally does NOT use
 * `createApiClient`: the workspace client redirects 403s to the organization
 * picker, which is meaningless here. Platform authorization is still enforced
 * server-side by `PlatformGuard`.
 */
const platformClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

platformClient.interceptors.request.use((reqConfig) => {
  const token = authStorage.getAuthToken();
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

/**
 * Short-lived, purpose-bound step-up token (5 min). Kept in memory only: it is
 * re-obtained by re-verifying TOTP and must never be persisted to localStorage.
 */
let stepUpToken: string | null = null;

function stepUpHeaders(): AxiosRequestConfig['headers'] {
  return stepUpToken ? { 'x-platform-step-up-token': stepUpToken } : {};
}

export interface PlatformOrganizationMember {
  userId: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  isPrimary: boolean;
  /** Account creation date of the user (not membership join date). */
  joinedAt: string;
}

export interface CreatePlatformOrganizationMemberPayload {
  userId: number;
  roleId: number;
}

export interface UpdatePlatformOrganizationMemberPayload {
  roleId: number;
}

export interface RemovePlatformOrganizationMemberResponse {
  removed: boolean;
  promotedUserId: number | null;
}

export const platformOrganizationsService = {
  list: async (): Promise<PlatformOrganization[]> => {
    const response = await platformClient.get<PlatformOrganization[]>('/platform/organizations');
    return response.data;
  },

  get: async (id: number): Promise<PlatformOrganization> => {
    const response = await platformClient.get<PlatformOrganization>(
      `/platform/organizations/${id}`,
    );
    return response.data;
  },

  create: async (
    payload: CreatePlatformOrganizationPayload,
  ): Promise<PlatformOrganization> => {
    const response = await platformClient.post<PlatformOrganization>(
      '/platform/organizations',
      payload,
      { headers: stepUpHeaders() },
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: UpdatePlatformOrganizationPayload,
  ): Promise<PlatformOrganization> => {
    const response = await platformClient.patch<PlatformOrganization>(
      `/platform/organizations/${id}`,
      payload,
      { headers: stepUpHeaders() },
    );
    return response.data;
  },

  listMembers: async (organizationId: number): Promise<PlatformOrganizationMember[]> => {
    const response = await platformClient.get<PlatformOrganizationMember[]>(
      `/platform/organizations/${organizationId}/members`,
    );
    return response.data;
  },

  addMember: async (
    organizationId: number,
    payload: CreatePlatformOrganizationMemberPayload,
  ): Promise<PlatformOrganizationMember> => {
    const response = await platformClient.post<PlatformOrganizationMember>(
      `/platform/organizations/${organizationId}/members`,
      payload,
      { headers: stepUpHeaders() },
    );
    return response.data;
  },

  updateMemberRole: async (
    organizationId: number,
    userId: number,
    payload: UpdatePlatformOrganizationMemberPayload,
  ): Promise<PlatformOrganizationMember> => {
    const response = await platformClient.patch<PlatformOrganizationMember>(
      `/platform/organizations/${organizationId}/members/${userId}`,
      payload,
      { headers: stepUpHeaders() },
    );
    return response.data;
  },

  removeMember: async (
    organizationId: number,
    userId: number,
  ): Promise<RemovePlatformOrganizationMemberResponse> => {
    const response = await platformClient.delete<RemovePlatformOrganizationMemberResponse>(
      `/platform/organizations/${organizationId}/members/${userId}`,
      { headers: stepUpHeaders() },
    );
    return response.data;
  },

  /** Re-verifies TOTP and stores the returned step-up token in memory. */
  requestStepUp: async (code: string): Promise<PlatformStepUpResponse> => {
    const response = await platformClient.post<PlatformStepUpResponse>('/platform/step-up', {
      code,
    });
    stepUpToken = response.data.accessToken;
    return response.data;
  },

  hasStepUpToken: (): boolean => stepUpToken !== null,

  clearStepUpToken: (): void => {
    stepUpToken = null;
  },
};
