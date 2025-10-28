import { useState, useEffect, useCallback } from 'react';
import { twoFactorService } from '../../services/twoFactorService';
import type { TwoFactorStatusResponse } from '../../types/twoFactor';

/**
 * Hook personalizado para verificar el estado del 2FA del usuario actual
 */
export function useTwoFactorStatus() {
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const check2FAStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: TwoFactorStatusResponse = await twoFactorService.get2FAStatus();
      setIs2FAEnabled(response.enabled);
    } catch (err) {
      console.error('Error checking 2FA status:', err);
      setError('Error al verificar estado del 2FA');
      // En caso de error, asumimos que no está activado para mayor seguridad
      setIs2FAEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Verificación inicial
    check2FAStatus();

    // Verificar cada 30 segundos para detectar cambios automáticos
    const interval = setInterval(check2FAStatus, 30000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [check2FAStatus]);

  return {
    is2FAEnabled,
    isLoading,
    error,
    // Helper para saber si el usuario tiene acceso limitado
    hasLimitedAccess: is2FAEnabled === false,
    // Función para refrescar manualmente el estado
    refresh2FAStatus: check2FAStatus,
  };
}