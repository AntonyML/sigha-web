// src/services/httpClient.ts
// Tiny Axios wrapper used by every service. Centralizes:
//   - baseURL from app.config
//   - Authorization header from localStorage
//   - 401 -> redirect to /login (clears token)

import axios, { AxiosInstance } from 'axios';
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

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tempToken');
      } catch {
        /* ignore */
      }
      navigateTo('/login');
    }
    return Promise.reject(error);
  },
);

export { httpClient };
