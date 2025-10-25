import axios from 'axios';
import type { AuthUser, LoginResponse } from '../types/auth';
import { config } from '../config/app.config';

/**
 * Axios instance configured for authentication API calls
 * Includes interceptors for token management and error handling
 */
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to automatically add authentication token to requests
 * Retrieves token from localStorage and adds it to Authorization header
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle authentication errors globally
 * Automatically redirects to login page on 401 errors (except during login/2FA flow)
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const currentPath = window.location.pathname;

      // Debug logging for troubleshooting authentication issues
      console.log('401 Interceptor triggered for URL:', requestUrl);
      console.log('Current path:', currentPath);
      console.log('Is verify-2fa request:', requestUrl.includes('/auth/verify-2fa'));
      console.log('Is on login page:', currentPath === '/login');

      // Prevent redirect during login flow or 2FA verification to avoid interrupting user experience
      if (!requestUrl.includes('/auth/verify-2fa') && currentPath !== '/login') {
        console.log('Redirecting to login page');
        // Clear all authentication data and redirect to login for other endpoints
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tempToken');
        window.location.href = '/login';
      } else {
        console.log('Skipping redirect for login/2FA flow');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Authenticates user with email and password
   * Returns access token directly or temp token if 2FA is required
   * @param credentials User login credentials
   * @returns Login response with tokens and user data
   */
  login: async (credentials: { uEmail: string; uPassword: string }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    const { requiresTwoFactor, accessToken, user, tempToken } = response.data;

    // Store temporary token for 2FA verification if required
    if (requiresTwoFactor && tempToken) {
      localStorage.setItem('tempToken', tempToken);
      return response.data;
    }

    // Store permanent tokens and user data if no 2FA required
    if (accessToken && user) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * Verifies 2FA code and completes the login process
   * Exchanges temporary token for permanent access token
   * @param data Temporary token and 2FA verification code
   * @returns Complete login response with access tokens
   */
  verify2FA: async (data: { tempToken: string; code: string }): Promise<LoginResponse> => {
    console.log('Starting authService.verify2FA with data:', data);

    try {
      console.log('Sending POST request to /auth/verify-2fa');
      const response = await apiClient.post<LoginResponse>('/auth/verify-2fa', data);
      console.log('Complete server response:', response);
      console.log('Respuesta data:', response.data);
      console.log('Respuesta status:', response.status);

      const { accessToken, user } = response.data;
      console.log('AccessToken recibido:', accessToken);
      console.log('User recibido:', user);

      if (accessToken && user) {
        console.log('Guardando tokens en localStorage');
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('tempToken');
        console.log('Tokens guardados correctamente');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error en authService.verify2FA:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error;
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/auth/profile');
    return response.data;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
    }
  },

  // ==================== Helpers ====================

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Obtener token almacenado
   */
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  /**
   * Obtener tempToken almacenado (para 2FA)
   */
  getTempToken: (): string | null => {
    return localStorage.getItem('tempToken');
  },

  /**
   * Obtener usuario almacenado en localStorage
   */
  getStoredUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Limpiar sesión local
   */
  clearLocalSession: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
  },
};