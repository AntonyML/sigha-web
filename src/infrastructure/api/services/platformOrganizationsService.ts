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
