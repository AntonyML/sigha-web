import axios from 'axios';
import type {
  LoginCredentials,
  LoginResponse,
  AuthUser,
} from '../types/auth';
import type { TwoFactorVerificationRequest } from '../types/twoFactor';

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

// Interceptor para manejar errores 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpiar tokens y redirigir a login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
      window.location.href = '/login';
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

    const { requiresTwoFactor, accessToken, user, tempToken } = response.data;

    // Si requiere 2FA, solo guardamos el tempToken temporalmente
    if (requiresTwoFactor && tempToken) {
      localStorage.setItem('tempToken', tempToken);
      return response.data;
    }

    // Si no requiere 2FA, guardamos el token y usuario
    if (accessToken && user) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * Verifica código 2FA y completa el login
   */
  verify2FA: async (data: TwoFactorVerificationRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/verify-2fa', data);

    const { accessToken, user } = response.data;

    if (accessToken && user) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('tempToken');
    }

    return response.data;
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