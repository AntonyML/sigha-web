import type { User } from '../types/user';

/**
 * Utilidades para usuarios
 */

/**
 * Obtiene el nombre completo de un usuario
 * @param user Usuario
 * @returns Nombre completo formateado
 */
export const getFullName = (user: User): string => {
    if (!user) return '';

    const parts = [user.uName, user.uFLastName];
    if (user.uSLastName) {
        parts.push(user.uSLastName);
    }

    return parts.filter(Boolean).join(' ');
};