import React, { createContext, useState, useEffect, useCallback } from 'react';
import { twoFactorService } from '../../../services/twoFactorService';

interface TwoFactorContextType {
    isEnabled: boolean;
    loading: boolean;
    refresh: () => Promise<void>;
}

const TwoFactorContext = createContext<TwoFactorContextType | undefined>(undefined);

export { TwoFactorContext };

interface TwoFactorProviderProps {
    children: React.ReactNode;
}

export const TwoFactorProvider: React.FC<TwoFactorProviderProps> = ({ children }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    const check2FAStatus = useCallback(async () => {
        try {
            const result = await twoFactorService.get2FAStatus();
            setIsEnabled(result.enabled || false);
        } catch (error) {
            console.error('Error checking 2FA status:', error);
            setIsEnabled(false);
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

        // Verificar cada 30 segundos
        const interval = setInterval(check2FAStatus, 30000);

        // Verificar cuando la ventana gane foco
        const handleFocus = () => check2FAStatus();
        window.addEventListener('focus', handleFocus);

        // Verificar cuando cambie el token de autenticación
        const handleAuthTokenChanged = () => check2FAStatus();
        window.addEventListener('authTokenChanged', handleAuthTokenChanged);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('authTokenChanged', handleAuthTokenChanged);
        };
    }, [check2FAStatus]);

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