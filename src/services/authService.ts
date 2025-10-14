import axios from 'axios';
import type {
  LoginCredentials,
  LoginResponse,
  AuthUser,
  RefreshTokenResponse,
  RefreshTokenRequest,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  VerifyEmailData,
  SessionsResponse,
} from '../types/auth';
import type { Verify2FARequest, Verify2FAResponse } from '../types/twoFactor';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
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

// Interceptor para manejar errores 401 y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post<RefreshTokenResponse>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data;
          localStorage.setItem('authToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Login de usuario
   * Puede retornar accessToken directamente o tempToken si requiere 2FA
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    const { requiresTwoFactor, accessToken, refreshToken, user, tempToken } = response.data;

    // Si requiere 2FA, solo guardamos el tempToken temporalmente
    if (requiresTwoFactor && tempToken) {
      localStorage.setItem('tempToken', tempToken);
      return response.data;
    }

    // Si no requiere 2FA, guardamos los tokens y usuario
    if (accessToken && refreshToken && user) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * Verifica código 2FA y completa el login
   */
  verify2FA: async (data: Verify2FARequest): Promise<Verify2FAResponse> => {
    const response = await apiClient.post<Verify2FAResponse>('/auth/verify-2fa', data);

    const { accessToken, refreshToken, user } = response.data;

    if (accessToken && refreshToken && user) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('tempToken');
    }

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
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
    }
  },

  /**
   * Renovar access token usando refresh token
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refreshToken };
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', request);

    localStorage.setItem('authToken', response.data.accessToken);

    return response.data;
  },

  /**
   * Obtener usuario autenticado actual
   */
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/auth/me');
    return response.data;
  },

  /**
   * Olvidé mi contraseña
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Restablecer contraseña
   */
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Verificar email
   */
  verifyEmail: async (data: VerifyEmailData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', data);
    return response.data;
  },

  /**
   * Reenviar email de verificación
   */
  resendVerificationEmail: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  },

  /**
   * Obtener sesiones activas del usuario
   */
  getActiveSessions: async (): Promise<SessionsResponse> => {
    const response = await apiClient.get<SessionsResponse>('/auth/sessions');
    return response.data;
  },

  /**
   * Cerrar todas las sesiones del usuario
   */
  logoutAllSessions: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      '/auth/sessions/all'
    );
    return response.data;
  },

  /**
   * Cerrar una sesión específica
   */
  logoutSession: async (sessionId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/auth/sessions/${sessionId}`
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
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
  },
};