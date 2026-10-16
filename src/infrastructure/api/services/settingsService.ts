import { httpClient } from '@/infrastructure/api/httpClient';
import type {
  GlobalSettings,
  GlobalSettingsRecord,
  GlobalSettingsStepUpGrant,
  GlobalSettingsUpdate,
} from '@/shared/types/globalSettings';

export interface InterfaceSettings {
  theme: string;
  density: string;
  typography: string;
  brandColor: string;
}

export interface GeneralSettings {
  appName: string;
  language: string;
  timezone: string;
  logoUrl?: string;
}

export const settingsService = {
  /** GET /settings/global/public — branding SaaS disponible en superficies públicas. */
  getPublicGlobalSettings: async (): Promise<GlobalSettings> => {
    const resp = await httpClient.get<GlobalSettings>('/settings/global/public');
    return resp.data;
  },

  /** GET /settings/interface */
  getInterfaceSettings: async (): Promise<InterfaceSettings> => {
    const resp = await httpClient.get<{ id: number; category: string; settings: InterfaceSettings }>('/settings/interface');
    return resp.data.settings;
  },

  /** PUT /settings/interface */
  updateInterfaceSettings: async (payload: InterfaceSettings): Promise<InterfaceSettings> => {
    const resp = await httpClient.put<{ id: number; category: string; settings: InterfaceSettings }>('/settings/interface', { settings: payload });
    return resp.data.settings;
  },

  /** GET /settings/general — returns { id, category, settings: GeneralSettings, ... } */
  getGeneralSettings: async (): Promise<GeneralSettings> => {
    const resp = await httpClient.get<{ id: number; category: string; settings: GeneralSettings }>('/settings/general');
    return resp.data.settings;
  },

  /** PUT /settings/general — envía body envuelto en { settings: {...} } para coincidir con UpsertSettingsDto */
  updateGeneralSettings: async (payload: GeneralSettings): Promise<GeneralSettings> => {
    const resp = await httpClient.put<{ id: number; category: string; settings: GeneralSettings }>('/settings/general', { settings: payload });
    return resp.data.settings;
  },

  /** POST /settings/general/logo (multipart) */
  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await httpClient.post<{ logoUrl: string }>('/settings/general/logo', formData, {
      headers: { 'Content-Type': undefined },
    });
    return resp.data;
  },

  /** Reautentica al usuario con TOTP y devuelve un token de acceso de cinco minutos. */
  verifyGlobalSettingsAccess: async (twoFactorCode: string): Promise<GlobalSettingsStepUpGrant> => {
    const resp = await httpClient.post<GlobalSettingsStepUpGrant>(
      '/settings/global/verify-2fa',
      { twoFactorCode },
    );
    return resp.data;
  },

  /** Lectura protegida por el token temporal de step-up; el token vive en memoria del componente. */
  getGlobalSettings: async (stepUpToken: string): Promise<GlobalSettings> => {
    const resp = await httpClient.get<GlobalSettingsRecord>('/settings/global', {
      headers: { 'x-global-settings-token': stepUpToken },
    });
    return resp.data.settings;
  },

  updateGlobalSettings: async (
    stepUpToken: string,
    payload: GlobalSettingsUpdate,
  ): Promise<GlobalSettings> => {
    const resp = await httpClient.put<GlobalSettingsRecord>('/settings/global', payload, {
      headers: { 'x-global-settings-token': stepUpToken },
    });
    return resp.data.settings;
  },

  uploadGlobalLogo: async (stepUpToken: string, file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await httpClient.post<{ logoUrl: string }>('/settings/global/logo', formData, {
      headers: {
        'Content-Type': undefined,
        'x-global-settings-token': stepUpToken,
      },
    });
    return resp.data;
  },
};
