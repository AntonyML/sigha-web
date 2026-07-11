// src/services/httpClient.ts
import axios, { type AxiosInstance, type AxiosError, AxiosHeaders } from 'axios';
import { config } from '../config/app.config';
import { navigateTo } from '../utils/navigationUtils';

// ── Concurrency limiter ──────────────────────────────────────────────────────
// Prevents too many simultaneous requests (avoids 429 rate limits on startup).
const MAX_CONCURRENT = 2;
let activeCount = 0;
const pendingQueue: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return;
  }
  return new Promise<void>((resolve) => {
    pendingQueue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function releaseSlot(): void {
  activeCount--;
  const next = pendingQueue.shift();
  if (next) next();
}

// ── Axios instance ───────────────────────────────────────────────────────────

const httpClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(async (reqConfig) => {
  const token = localStorage.getItem('authToken');
  if (token && reqConfig.headers) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  // Acquire concurrency slot before sending
  await acquireSlot();
  return reqConfig;
});

// Auth endpoints que NO deben disparar redirect al recibir 401
const AUTH_ENDPOINTS = ['/auth/login', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-2fa', '/auth/enable-2fa', '/auth/disable-2fa', '/auth/setup-2fa'];

// Retry config for 429/5xx errors
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatuses: [429, 500, 502, 503, 504],
};

function isRetryableError(error: AxiosError): boolean {
  return error.response != null && RETRY_CONFIG.retryableStatuses.includes(error.response.status);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

httpClient.interceptors.response.use(
  (response) => {
    releaseSlot();
    return response;
  },
  async (error: AxiosError) => {
    releaseSlot();
    const { config, response } = error;
    
    // Handle 401 - auth redirect (existing logic)
    if (response?.status === 401) {
      const requestUrl: string = config?.url || '';
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
      return Promise.reject(error);
    }
    
    // Handle retryable errors (429, 5xx) with exponential backoff
    if (config && isRetryableError(error)) {
      const retryCount = Number(config.headers['x-retry-count']) || 0;
      
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount),
          RETRY_CONFIG.maxDelayMs
        );
        
        // Add jitter (±25%)
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        const finalDelay = Math.floor(delay + jitter);
        
        console.warn(`[httpClient] Retrying ${config.url} (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries}) after ${finalDelay}ms due to status ${response?.status}`);
        
        await sleep(finalDelay);
        
        // Increment retry count and retry
        const newConfig = { ...config };
        const headers = new AxiosHeaders(config.headers);
        headers.set('x-retry-count', retryCount + 1);
        newConfig.headers = headers;
        
        return httpClient.request(newConfig);
      }
    }
    
    return Promise.reject(error);
  },
);

export { httpClient };
