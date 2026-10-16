import axios, { type AxiosError, type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { getCurrentPath, navigateTo } from '@/shared/lib/navigationUtils';

const registeredClients = new WeakSet<object>();

const ORGANIZATION_ACCESS_PATTERNS = [
  /organizaci[oó]n/i,
  /miembro/i,
  /pertenec/i,
  /tenant/i,
];

function extractResponseMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const raw = (data as { message?: unknown }).message;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    const joined = raw.filter((item): item is string => typeof item === 'string').join(' ');
    return joined || null;
  }
  return null;
}

export function isOrganizationAccessError(status: number | undefined, data?: unknown): boolean {
  if (status !== 403) return false;
  const message = extractResponseMessage(data);
  if (message === null) return true;
  return ORGANIZATION_ACCESS_PATTERNS.some((pattern) => pattern.test(message));
}

export function redirectForOrganizationAccessError(status: number | undefined, data?: unknown): void {
  if (!isOrganizationAccessError(status, data) || typeof window === 'undefined') return;

  const currentPath = getCurrentPath();
  const hasSession = !!localStorage.getItem('authToken');
  const target = hasSession ? '/seleccionar-organizacion' : '/login';

  if (currentPath !== target) {
    navigateTo(hasSession ? `${target}?reason=access-denied` : target);
  }
}

export function registerOrganizationAccessRedirect(client: AxiosInstance): void {
  if (registeredClients.has(client)) return;
  registeredClients.add(client);

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      redirectForOrganizationAccessError(error.response?.status, error.response?.data);
      return Promise.reject(error);
    },
  );
}

export function createApiClient(config?: CreateAxiosDefaults): AxiosInstance {
  const client = axios.create(config);
  registerOrganizationAccessRedirect(client);
  return client;
}

