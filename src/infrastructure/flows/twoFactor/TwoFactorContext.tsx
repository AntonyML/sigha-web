import React, { createContext, useState, useEffect, useCallback } from 'react';
import { twoFactorService } from '../../../services/twoFactorService';

interface TwoFactorContextType {
    isEnabled: boolean | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

const TwoFactorContext = createContext<TwoFactorContextType | undefined>(undefined);

export { TwoFactorContext };

interface TwoFactorProviderProps {
    children: React.ReactNode;
}

export const TwoFactorProvider: React.FC<TwoFactorProviderProps> = ({ children }) => {
    const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    const check2FAStatus = useCallback(async () => {
        // No hay sesión activa: no llamar a un endpoint que requiere JWT.
        if (!localStorage.getItem('authToken')) {
            setIsEnabled(false);
            setLoading(false);
            return;
        }

        try {
            const result = await twoFactorService.get2FAStatus();
            setIsEnabled(result.enabled || false);
        } catch (error) {
            // Error transitorio (429/red): conservar el último estado conocido
            // en lugar de marcar 2FA como deshabilitado (evita redirecciones
            // falsas a /two-factor cuando el backend throttlea el endpoint).
            console.error('Error checking 2FA status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        await check2FAStatus();
    }, [check2FAStatus]);

    useEffect(() => {
            check2FAStatus();

            // Verificar cada 60 segundos (reducido de 30s para evitar throttling)
            const interval = setInterval(check2FAStatus, 60000);

        // Verificar cuando la ventana gane foco
        const handleFocus = () => check2FAStatus();
        window.addEventListener('focus', handleFocus);

        // Verificar cuando cambie el token de autenticación. Usar refresh()
        // (que marca loading = true) para que el TwoFactorGuard muestre el
        // spinner mientras se re-chequea el estado y no redirija a /two-factor
        // con un isEnabled obsoleto tras el login con 2FA.
        const handleAuthTokenChanged = () => refresh();
        window.addEventListener('authTokenChanged', handleAuthTokenChanged);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('authTokenChanged', handleAuthTokenChanged);
        };
    }, [check2FAStatus, refresh]);

    const value: TwoFactorContextType = {
        isEnabled,
        loading,
        refresh,
    };

    return (
        <TwoFactorContext.Provider value={value}>
            {children}
        </TwoFactorContext.Provider>
    );
};