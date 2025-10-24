// ==================== Two-Factor Authentication Types ====================

export interface Setup2FAResponse {
    qrCode: string;
    backupCodes: string[];
    secret: string;
}

export interface Enable2FARequest {
    code: string;
    backupCodes?: string[];
}

export interface Enable2FAResponse {
    success: boolean;
    message: string;
    backupCodes: string[];
}

export interface Verify2FARequest {
    code: string;
}

export interface Verify2FAResponse {
    success: boolean;
    token: string;
}

export interface TwoFactorStatusResponse {
    enabled: boolean;
    lastUsed?: Date | null;
    hasBackupCodes: boolean;
}

export interface Disable2FAResponse {
    success: boolean;
    message: string;
}

export interface TwoFactorVerificationRequest {
    tempToken: string;
    twoFactorCode: string;
}
