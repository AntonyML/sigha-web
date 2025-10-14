// ==================== Two-Factor Authentication Types ====================

export interface TwoFactorSetupResponse {
    message: string;
    qrCode: string;
    secret: string;
    backupCodes: string[];
    instructions: string[];
}

export interface TwoFactorStatusResponse {
    enabled: boolean;
    lastUsed?: Date | null;
    hasBackupCodes: boolean;
}

export interface Verify2FARequest {
    sessionToken: string;
    token: string;
}

export interface Verify2FAResponse {
    requiresTwoFactor: boolean;
    accessToken?: string;
    refreshToken?: string;
    user?: {
        id: number;
        email: string;
        name: string;
        roleId?: number;
    };
}

export interface Enable2FARequest {
    token: string;
}

export interface Enable2FAResponse {
    success: boolean;
    message: string;
}

export interface Disable2FAResponse {
    success: boolean;
    message: string;
}

export interface RegenerateBackupCodesResponse {
    success: boolean;
    message: string;
    backupCodes: string[];
}

export interface TwoFactorDebugResponse {
    userId: number;
    secret: string;
    enabled: boolean;
    serverTime: string;
    serverUnixTime: number;
    currentPeriod: number;
    validCodes: Array<{
        offset: string;
        code: string;
        timestamp: string;
        isCurrent: boolean;
    }>;
    backupCodes: string[];
    warning: string;
}
