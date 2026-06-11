// src/services/httpClient.ts
import axios, { type AxiosInstance } from 'axios';
import { config } from '../config/app.config';
import { navigateTo } from '../utils/navigationUtils';

const httpClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('authToken');
  if (token && reqConfig.headers) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

// Auth endpoints que NO deben disparar redirect al recibir 401
const AUTH_ENDPOINTS = ['/auth/login', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-2fa'];

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl: string = error.config?.url || '';
      const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

      if (!isAuthEndpoint) {
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('tempToken');
        } catch {
          /* ignore */
        }
        navigateTo('/login');
      }
    }
    return Promise.reject(error);
  },
);

export { httpClient };
