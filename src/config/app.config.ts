/**
 * Centralized application configuration
 * All configurations are centralized here for easy management and environment switching
 *
 * TO CHANGE API URL:
 * 1. Modify api.baseUrl with your backend URL
 * 2. For backend on another PC: 'http://192.168.1.XXX:3000'
 * 3. For production: 'https://your-domain.com'
 */

export const ipv4Localhost = 'http://10.124.14.250:3000'; // esta es la ip de mi pc portatil donde corro el backend
export const localhost = 'http://localhost:3000';
export const tunnelHost = 'http://localhost:3000'; // por si creo un tunel con cloudflare mas adelante
export const config = {
    api: {
        baseUrl: ipv4Localhost, // Cambiado para usar ipv4Localhost
        timeout: 10000,
    },

    app: {
        name: 'Hogar de Ancianos',
        version: '1.0.0',
        environment: 'development' as 'development' | 'production' | 'test',
    },

    features: {
        enableDebugLogs: true,
        enableMockData: false,
    },
} as const;

/**
 * Configuration utilities
 */
export const getApiUrl = (endpoint: string): string => {
    const baseUrl = config.api.baseUrl;
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const isDevelopment = (): boolean => config.app.environment === 'development';
export const isProduction = (): boolean => config.app.environment === 'production';