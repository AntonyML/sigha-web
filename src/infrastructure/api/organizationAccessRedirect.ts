import axios, { type AxiosError, type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { getCurrentPath, navigateTo } from '@/shared/lib/navigationUtils';

const registeredClients = new WeakSet<object>();

export function redirectForOrganizationAccessError(status: number | undefined): void {
  if (status !== 403 || typeof window === 'undefined') return;

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
      redirectForOrganizationAccessError(error.response?.status);
      return Promise.reject(error);
    },
  );
}

export function createApiClient(config?: CreateAxiosDefaults): AxiosInstance {
  const client = axios.create(config);
  registerOrganizationAccessRedirect(client);
  return client;
}
