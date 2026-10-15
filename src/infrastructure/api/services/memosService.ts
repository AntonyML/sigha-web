import { createApiClient } from '@/infrastructure/api/organizationAccessRedirect';
import { config } from '@/shared/config/app.config';
import type { ResidentMemo, CreateMemoPayload, MemoStatus } from '@/shared/types/memos';

const apiClient = createApiClient({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((reqConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
  }
  return reqConfig;
});

export const memosService = {
  getByOlderAdult: async (olderAdultId: number): Promise<ResidentMemo[]> => {
    try {
      const response = await apiClient.get<{ success?: boolean; data?: ResidentMemo[] } | ResidentMemo[]>(
        `/memos/older-adult/${olderAdultId}`
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return (response.data as { data?: ResidentMemo[] })?.data ?? [];
    } catch {
      return [];
    }
  },

  createMemo: async (payload: CreateMemoPayload): Promise<ResidentMemo> => {
    const response = await apiClient.post<{ success?: boolean; data: ResidentMemo } | ResidentMemo>(
      '/memos',
      payload
    );
    if ('data' in response.data && response.data.data) {
      return response.data.data;
    }
    return response.data as ResidentMemo;
  },

  updateStatus: async (memoId: number, status: MemoStatus): Promise<ResidentMemo> => {
    const response = await apiClient.patch<{ success?: boolean; data: ResidentMemo } | ResidentMemo>(
      `/memos/${memoId}/status`,
      { status }
    );
    if ('data' in response.data && response.data.data) {
      return response.data.data;
    }
    return response.data as ResidentMemo;
  },

  replyMemo: async (parentMemoId: number, payload: Omit<CreateMemoPayload, 'parentMemoId'>): Promise<ResidentMemo> => {
    return memosService.createMemo({
      ...payload,
      parentMemoId,
    });
  },

  getAvailableRecipients: async (): Promise<{
    users: Array<{ id: number; name: string; roleName: string }>;
    roles: Array<{ id: number; name: string }>;
  }> => {
    try {
      const [usersRes, rolesRes] = await Promise.allSettled([
        apiClient.get('/users'),
        apiClient.get('/roles'),
      ]);

      const users: Array<{ id: number; name: string; roleName: string }> = [];
      const roles: Array<{ id: number; name: string }> = [];

      if (usersRes.status === 'fulfilled') {
        const rawUsers = Array.isArray(usersRes.value.data)
          ? usersRes.value.data
          : usersRes.value.data?.data ?? [];
        rawUsers.forEach((u: { id?: number; u_name?: string; u_f_last_name?: string; role_id?: { r_name?: string }; r_name?: string }) => {
          if (u.id) {
            const fullName = `${u.u_name ?? ''} ${u.u_f_last_name ?? ''}`.trim() || `Usuario #${u.id}`;
            const roleName = u.role_id?.r_name ?? u.r_name ?? 'Personal';
            users.push({ id: u.id, name: fullName, roleName });
          }
        });
      }

      if (rolesRes.status === 'fulfilled') {
        const rawRoles = Array.isArray(rolesRes.value.data)
          ? rolesRes.value.data
          : rolesRes.value.data?.data ?? [];
        rawRoles.forEach((r: { id?: number; r_name?: string; name?: string }) => {
          if (r.id) {
            roles.push({ id: r.id, name: r.r_name ?? r.name ?? `Rol #${r.id}` });
          }
        });
      }

      return { users, roles };
    } catch {
      return { users: [], roles: [] };
    }
  },
};
