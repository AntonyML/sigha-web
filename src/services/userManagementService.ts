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
    return response.data;
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
