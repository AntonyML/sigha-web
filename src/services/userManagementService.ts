import type {
  User,
  CreateUserData,
  UpdateUserData
} from '../types/user';
import { httpClient } from './httpClient';

export const userManagementService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await httpClient.get<User[]>('/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await httpClient.get<User>(`/users/${id}`);
    const user = response.data;

    // GET /users/:id no incluye el rol; se complementa con /users/:id/roles
    // para que el detalle/edición puedan mostrar el rol (roleId/roleIds/roles).
    try {
      const rolesRes = await httpClient.get<{
        userId?: number;
        roles?: Array<{ roleId: number; roleName: string; isPrimary: boolean }>;
      }>(`/users/${id}/roles`);
      const roles = rolesRes.data?.roles ?? [];
      const roleIds = roles.map((r) => r.roleId);
      const primary = roles.find((r) => r.isPrimary)?.roleId ?? roleIds[0];
      return {
        ...user,
        roleId: primary,
        roleIds,
        roles: roles.map((r) => r.roleName),
      };
    } catch {
      return user;
    }
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const backendData = {
      uIdentification: data.uIdentification,
      uName: data.uName,
      uFLastName: data.uFLastName,
      uSLastName: data.uSLastName || undefined,
      uEmail: data.uEmail,
      uPassword: data.uPassword,
      roleId: data.roleId
    };

    const response = await httpClient.post<User>('/users', backendData);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await httpClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await httpClient.delete(`/users/${id}`);
  },

  searchUsers: async (searchTerm: string): Promise<User[]> => {
    const response = await httpClient.get<User[]>('/users/search', {
      params: { term: searchTerm }
    });
    return response.data;
  },

  getUsersByRole: async (roleId: number): Promise<User[]> => {
    const response = await httpClient.get<User[]>(`/users/by-role/${roleId}`);
    return response.data;
  },

  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await httpClient.patch<User>(`/users/${id}/toggle-status`);
    return response.data;
  },
};
