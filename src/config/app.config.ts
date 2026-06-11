/**
 * Centralized application configuration
 * API URL comes from VITE_API_URL env variable.
 * Set it in .env (dev) or in the hosting platform env vars (prod).
 */

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const nodeEnv = (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'production' | 'test';

export const config = {
    api: {
        baseUrl: apiBaseUrl,
        timeout: 10000,
    },

    app: {
        name: 'Hogar de Ancianos',
        version: '1.0.0',
        environment: nodeEnv,
    },

    features: {
        enableDebugLogs: nodeEnv !== 'production',
        enableMockData: false,
    },
} as const;

export const getApiUrl = (endpoint: string): string => {
    const baseUrl = config.api.baseUrl;
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const isDevelopment = (): boolean => config.app.environment === 'development';
export const isProduction = (): boolean => config.app.environment === 'production';
