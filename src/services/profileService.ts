import axios from 'axios';
import type {
  User,
  UpdateUserData,
  UserChangePasswordData
} from '../types/user';
import { config } from '../config/app.config';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

export const profileService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<UpdateUserData>): Promise<User> => {
    const response = await apiClient.patch<User>('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: UserChangePasswordData): Promise<void> => {
    await apiClient.post('/users/change-password', data);
  },
};
