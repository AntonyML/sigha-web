/**
 * Centralized application configuration
 * Browser-visible configuration is read from NEXT_PUBLIC_* variables.
 * Set values in .env.local (development) or hosting environment variables.
 */

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/backend';
const nodeEnv = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

export const config = {
    api: {
        baseUrl: apiBaseUrl,
        timeout: 10000,
    },

    app: {
        name: 'Sistema Integral de Gestión Holística y de Asistencia',
        version: '1.0.0',
        environment: nodeEnv,
    },

    site: {
        // Public origin used for canonical URLs, sitemap and robots (no trailing slash).
        url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, ''),
    },

    features: {
        enableDebugLogs: nodeEnv !== 'production',
        enableMockData: false,
        enable2FA: process.env.NEXT_PUBLIC_ENABLE_2FA === 'true',
    },
} as const;

export const getApiUrl = (endpoint: string): string => {
    const baseUrl = config.api.baseUrl;
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const isDevelopment = (): boolean => config.app.environment === 'development';
export const isProduction = (): boolean => config.app.environment === 'production';
