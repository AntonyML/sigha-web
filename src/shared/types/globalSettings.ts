export interface GlobalSettings {
  appName: string;
  logoUrl: string | null;
}

export interface GlobalSettingsRecord {
  id: number;
  category: 'global';
  settings: GlobalSettings;
}

export interface GlobalSettingsUpdate {
  appName: string;
  logoUrl?: string | null;
}

export interface GlobalSettingsStepUpGrant {
  accessToken: string;
  expiresAt: string;
}
