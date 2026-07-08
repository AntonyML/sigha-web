// src/services/settingsService.ts
import { httpClient } from './httpClient';

export interface InterfaceSettings {
  theme: string;
  density: string;
  typography: string;
  brandColor: string;
}

export const settingsService = {
  /** GET /settings/interface */
  getInterfaceSettings: async (): Promise<InterfaceSettings> => {
    // Backend returns Settings entity { id, category, settings }
    const resp = await httpClient.get<{ message: string; data: { settings: InterfaceSettings } }>('/settings/interface');
    return resp.data.data.settings;
  },

  /** PUT /settings/interface */
  updateInterfaceSettings: async (payload: InterfaceSettings): Promise<InterfaceSettings> => {
    const resp = await httpClient.put<{ message: string; data: { settings: InterfaceSettings } }>('/settings/interface', payload);
    return resp.data.data.settings;
  },
};
