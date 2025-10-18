// ==================== Two-Factor Authentication Types ====================

export interface Setup2FAResponse {
    qrCode: string;
    backupCodes: string[];
    secret: string;
}

export interface Enable2FARequest {
    verificationCode: string;
}

export interface Enable2FAResponse {
    success: boolean;
    backupCodes: string[];
}

export interface TwoFactorVerificationRequest {
    tempToken: string;
    twoFactorCode: string;
}

export interface TwoFactorStatusResponse {
    enabled: boolean;
    lastUsed?: Date | null;
    hasBackupCodes: boolean;
}

export interface Disable2FAResponse {
    success: boolean;
}
