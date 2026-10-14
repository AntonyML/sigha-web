import { httpClient } from '@/infrastructure/api/httpClient';

/**
 * Contrato congelado de la Tarea 2 (sigha-api-20261013-tsf4, sobre el modelo
 * multi-tenant de la Tarea 1 sigha-db-20261013-9moj / migración 015).
 * La organización activa la resuelve el backend desde el JWT (@ActiveOrg()):
 * el navegador nunca envía ni decide el tenant.
 */
export interface ActiveOrganization {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export const organizationsService = {
  /** GET /organizations/current — { id, name, slug, logoUrl } */
  getCurrent: async (): Promise<ActiveOrganization> => {
    const resp = await httpClient.get<ActiveOrganization>('/organizations/current');
    return resp.data;
  },

  /** PATCH /organizations/current — body { name } (máx 200, espejo de UpdateOrganizationDto) */
  updateCurrent: async (name: string): Promise<ActiveOrganization> => {
    const resp = await httpClient.patch<ActiveOrganization>('/organizations/current', { name });
    return resp.data;
  },

  /** POST /organizations/current/logo (multipart file PNG/JPEG/WebP, máx 2MB) */
  uploadLogo: async (file: File): Promise<ActiveOrganization> => {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await httpClient.post<ActiveOrganization>('/organizations/current/logo', formData, {
      headers: { 'Content-Type': undefined },
    });
    return resp.data;
  },
};
