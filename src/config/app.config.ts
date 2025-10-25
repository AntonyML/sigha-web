/**
 * Configuración centralizada de la aplicación
 * Todas las configuraciones se centralizan aquí
 *
 * PARA CAMBIAR LA URL DEL API:
 * 1. Modifica api.baseUrl con la URL de tu backend
 * 2. Para backend en otra PC: 'http://192.168.1.XXX:3000'
 * 3. Para producción: 'https://tu-dominio.com'
 */

export const config = {
    // API Configuration
    api: {
        baseUrl: 'http://localhost:3000', // ← CAMBIA ESTA URL SEGÚN TU ENTORNO
        timeout: 10000,
    },

    // App Configuration
    app: {
        name: 'Hogar de Ancianos',
        version: '1.0.0',
        environment: 'development' as 'development' | 'production' | 'test',
    },

    // Feature Flags
    features: {
        enableDebugLogs: true, // Cambia a false en producción
        enableMockData: false,
    },
} as const;

/**
 * Utilidades para configuración
 */
export const getApiUrl = (endpoint: string): string => {
    const baseUrl = config.api.baseUrl;
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const isDevelopment = (): boolean => config.app.environment === 'development';
export const isProduction = (): boolean => config.app.environment === 'production';