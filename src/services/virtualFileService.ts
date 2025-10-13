import axios from 'axios';
import type {
  VirtualFile,
  CreateVirtualFileData,
  UpdateVirtualFileData,
  VirtualFileSearchParams,
  VirtualFileApiResponse
} from '../types/virtualFile';

const API_BASE_URL =  'http://localhost:9999/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const virtualFileService = {

  getAllVirtualFiles: async (): Promise<VirtualFile[]> => {
    const response = await apiClient.get<VirtualFileApiResponse>('/virtual-files');
    return response.data.data;
  },


  getVirtualFileById: async (id: number): Promise<VirtualFile> => {
    const response = await apiClient.get<VirtualFile>(`/virtual-files/${id}`);
    return response.data;
  },


  createVirtualFile: async (data: CreateVirtualFileData): Promise<VirtualFile> => {
    const response = await apiClient.post<VirtualFile>('/virtual-files', data);
    return response.data;
  },

  updateVirtualFile: async (id: number, data: UpdateVirtualFileData): Promise<VirtualFile> => {
    const response = await apiClient.put<VirtualFile>(`/virtual-files/${id}`, data);
    return response.data;
  },

  deleteVirtualFile: async (id: number): Promise<void> => {
    await apiClient.delete(`/virtual-files/${id}`);
  },

  searchVirtualFiles: async (params: VirtualFileSearchParams): Promise<VirtualFileApiResponse> => {
    const response = await apiClient.get<VirtualFileApiResponse>('/virtual-files/search', { params });
    return response.data;
  },
};