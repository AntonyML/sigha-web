/**
 * Obtiene el mensaje de error específico para operaciones de role-changes
 *
 * @param error - Error de la operación
 * @returns Mensaje de error formateado
 */
export function getRoleChangesErrorMessage(error: any): string { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Si es un error de axios con respuesta del servidor
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
            case 400:
                return data.message || 'Datos inválidos para el cambio de rol';
            case 401:
                return 'No autorizado. Token de autenticación inválido o expirado';
            case 403:
                return 'No tiene permisos suficientes para realizar esta operación';
            case 404:
                return data.message || 'Cambio de rol no encontrado';
            case 409:
                return data.message || 'Conflicto en la operación de cambio de rol';
            case 422:
                return data.message || 'Datos de cambio de rol inválidos';
            case 500:
                return 'Error interno del servidor. Intente nuevamente más tarde';
            default:
                return data.message || `Error del servidor (${status})`;
        }
    }

    // Si es un error de red
    if (error.request) {
        return 'Error de conexión. Verifique su conexión a internet';
    }

    // Otros errores
    return error.message || 'Error desconocido en la operación de cambios de rol';
}