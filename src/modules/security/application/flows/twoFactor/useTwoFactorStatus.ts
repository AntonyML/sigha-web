import { useContext } from 'react';
import { TwoFactorContext } from '@/modules/security/application/flows/twoFactor/TwoFactorContext';

export const useTwoFactorStatus = () => {
    const context = useContext(TwoFactorContext);
    if (!context) {
        throw new Error('useTwoFactorStatus must be used within a TwoFactorProvider');
    }
    return context;
};