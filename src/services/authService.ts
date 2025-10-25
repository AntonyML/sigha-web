import axios from 'axios';
import type { AuthUser, LoginResponse } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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
      const requestUrl = error.config?.url || '';
      const currentPath = window.location.pathname;
      console.log('Interceptor 401 activado para URL:', requestUrl);
      console.log('Path actual:', currentPath);
      console.log('¿Incluye /auth/verify-2fa?:', requestUrl.includes('/auth/verify-2fa'));
      console.log('¿Está en página de login?:', currentPath === '/login');

      // No redirigir si estamos en la página de login o si es verify-2fa
      if (!requestUrl.includes('/auth/verify-2fa') && currentPath !== '/login') {
        console.log('Redirigiendo a /login');
        // Limpiar tokens y redirigir a login solo para otros endpoints
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tempToken');
        window.location.href = '/login';
      } else {
        console.log('NO redirigiendo porque es verify-2fa o estamos en login');
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
  login: async (credentials: { uEmail: string; uPassword: string }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    const { requiresTwoFactor, accessToken, user, tempToken } = response.data;

    // Si requiere 2FA, guardamos el tempToken temporalmente
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
  verify2FA: async (data: { tempToken: string; code: string }): Promise<LoginResponse> => {
    console.log('Iniciando authService.verify2FA con data:', data);

    try {
      console.log('Enviando POST request a /auth/verify-2fa');
      const response = await apiClient.post<LoginResponse>('/auth/verify-2fa', data);
      console.log('Respuesta completa del servidor:', response);
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