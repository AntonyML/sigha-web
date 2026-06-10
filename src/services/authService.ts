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

    if (!config.features.enable2FA) {
      requestBody.twoFactorCode = import.meta.env.VITE_2FA_DUMMY_CODE || '000000';
    }

    const response = await apiClient.post<LoginResponse>('/auth/login', requestBody);
    const { requiresTwoFactor, accessToken, user, tempToken } = response.data;

    if (!config.features.enable2FA) {
      if (accessToken && user) {
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      return response.data;
    }

    if (requiresTwoFactor && tempToken) {
      localStorage.setItem('tempToken', tempToken);
      localStorage.setItem('tempCredentials', JSON.stringify({
        uEmail: credentials.uEmail,
        uPassword: credentials.uPassword
      }));
      return response.data;
    }

    if (accessToken && user) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  verify2FA: async (twoFactorCode: string): Promise<LoginResponse> => {
    const tempCredentials = authService.getTempCredentials();
    if (!tempCredentials) {
      throw new Error('No se encontraron credenciales temporales. Inicia sesión nuevamente.');
    }

    const response = await apiClient.post<LoginResponse>('/auth/login', {
      uEmail: tempCredentials.uEmail,
      uPassword: tempCredentials.uPassword,
      twoFactorCode: twoFactorCode.replace(/[\s-]/g, ''),
    });

    const { accessToken, refreshToken, user } = response.data;

    if (accessToken && refreshToken && user) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('tempToken');
      localStorage.removeItem('tempCredentials');
      window.dispatchEvent(new CustomEvent('authTokenChanged'));
    }

    return response.data;
  },

  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/auth/profile');
    return response.data;
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

  getTempCredentials: (): { uEmail: string; uPassword: string } | null => {
    const creds = localStorage.getItem('tempCredentials');
    return creds ? JSON.parse(creds) : null;
  },

  getStoredUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
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
