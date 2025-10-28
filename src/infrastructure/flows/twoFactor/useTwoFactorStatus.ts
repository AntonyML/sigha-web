import { useContext } from 'react';
import { TwoFactorContext } from './TwoFactorContext';

export const useTwoFactorStatus = () => {
    const context = useContext(TwoFactorContext);
    if (!context) {
        throw new Error('useTwoFactorStatus must be used within a TwoFactorProvider');
    }
    return context;
};