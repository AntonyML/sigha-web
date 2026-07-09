import { httpClient } from './httpClient';

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
  /** GET /settings/interface */
  getInterfaceSettings: async (): Promise<InterfaceSettings> => {
    const resp = await httpClient.get<{ message: string; data: { settings: InterfaceSettings } }>('/settings/interface');
    return resp.data.data.settings;
  },

  /** PUT /settings/interface */
  updateInterfaceSettings: async (payload: InterfaceSettings): Promise<InterfaceSettings> => {
    const resp = await httpClient.put<{ message: string; data: { settings: InterfaceSettings } }>('/settings/interface', payload);
    return resp.data.data.settings;
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
};
