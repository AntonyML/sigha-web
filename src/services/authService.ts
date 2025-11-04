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
      if (!requestUrl.includes('/auth/login') && currentPath !== '/login') {
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
    // Clear any existing invalid tokens before login
    localStorage.removeItem('tempToken');

    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    const { requiresTwoFactor, accessToken, user, tempToken } = response.data;

    // Store temporary token for 2FA verification if required
    if (requiresTwoFactor && tempToken) {
      localStorage.setItem('tempToken', tempToken);
      // Store credentials for 2FA verification
      localStorage.setItem('tempCredentials', JSON.stringify({
        uEmail: credentials.uEmail,
        uPassword: credentials.uPassword
      }));
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
   * Uses the direct login flow with twoFactorCode included
   * @param twoFactorCode The 2FA verification code
   * @returns Complete login response with access tokens
   */
  verify2FA: async (twoFactorCode: string): Promise<LoginResponse> => {
    console.log('Starting authService.verify2FA with code:', twoFactorCode.replace(/[\s-]/g, ''));

    // Get stored credentials
    const tempCredentials = authService.getTempCredentials();
    if (!tempCredentials) {
      throw new Error('No se encontraron credenciales temporales. Inicia sesión nuevamente.');
    }

    try {
      console.log('Sending POST request to /auth/login with 2FA code');
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        uEmail: tempCredentials.uEmail,
        uPassword: tempCredentials.uPassword,
        twoFactorCode: twoFactorCode.replace(/[\s-]/g, '') // Clean the code
      });
      console.log('Complete server response:', response);
      console.log('Respuesta data:', response.data);
      console.log('Respuesta status:', response.status);

      const { accessToken, refreshToken, user } = response.data;
      console.log('AccessToken recibido:', accessToken ? 'PRESENT' : 'MISSING');
      console.log('RefreshToken recibido:', refreshToken ? 'PRESENT' : 'MISSING');
      console.log('User recibido:', user);

      if (accessToken && refreshToken && user) {
        console.log('Guardando tokens en localStorage');
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        // Clean up temporary data
        localStorage.removeItem('tempToken');
        localStorage.removeItem('tempCredentials');
        console.log('Tokens guardados correctamente');

        // Notificar cambio de token para actualizar contextos
        window.dispatchEvent(new CustomEvent('authTokenChanged'));
      }

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown; status?: number }; message?: string };
      console.error('Error en authService.verify2FA:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error message:', err.message);
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
   * Solicitar recuperación de contraseña
   * Envía código de recuperación al email (NO requiere autenticación)
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(
      `${config.api.baseUrl}/auth/forgot-password`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Resetear contraseña usando token de recuperación
   * (NO requiere autenticación)
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(
      `${config.api.baseUrl}/auth/reset-password`,
      { token, newPassword },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
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
   * Obtener credenciales temporales almacenadas (para 2FA)
   */
  getTempCredentials: (): { uEmail: string; uPassword: string } | null => {
    const creds = localStorage.getItem('tempCredentials');
    return creds ? JSON.parse(creds) : null;
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