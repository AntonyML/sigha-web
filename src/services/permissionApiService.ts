import { httpClient } from './httpClient';

export interface PermissionApi {
  id: number;
  pName: string;
  pDescription: string;
  pModule: string;
  pAction: string;
  pEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionApi {
  id: number;
  roleId: number;
  permissionId: number;
  rpGranted: boolean;
  createdAt: string;
  updatedAt: string;
  permission: PermissionApi;
}

export interface CreatePermissionPayload {
  pName: string;
  pDescription?: string;
  pModule: string;
  pAction: string;
  pEnabled?: boolean;
}

export interface UpdatePermissionPayload {
  pName?: string;
  pDescription?: string;
  pModule?: string;
  pAction?: string;
  pEnabled?: boolean;
}

export const permissionApiService = {
  // ── Catálogo ──
  getAll: (): Promise<PermissionApi[]> =>
    httpClient.get<PermissionApi[]>('/permissions').then(r => r.data),

  getById: (id: number): Promise<PermissionApi> =>
    httpClient.get<PermissionApi>(`/permissions/${id}`).then(r => r.data),

  create: (payload: CreatePermissionPayload): Promise<PermissionApi> =>
    httpClient.post<PermissionApi>('/permissions', payload).then(r => r.data),

  update: (id: number, payload: UpdatePermissionPayload): Promise<PermissionApi> =>
    httpClient.patch<PermissionApi>(`/permissions/${id}`, payload).then(r => r.data),

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/permissions/${id}`).then(() => undefined),

  // ── Por rol ──
  getByRole: (roleId: number): Promise<RolePermissionApi[]> =>
    httpClient.get<RolePermissionApi[]>(`/permissions/role/${roleId}`).then(r => r.data),

  setRolePermissions: (roleId: number, permissionIds: number[]): Promise<RolePermissionApi[]> =>
    httpClient.put<RolePermissionApi[]>(`/permissions/role/${roleId}`, { permissionIds }).then(r => r.data),

  grantPermission: (roleId: number, permissionId: number): Promise<RolePermissionApi> =>
    httpClient.patch<RolePermissionApi>(`/permissions/role/${roleId}/permission/${permissionId}/grant`, {}).then(r => r.data),

  revokePermission: (roleId: number, permissionId: number): Promise<RolePermissionApi> =>
    httpClient.patch<RolePermissionApi>(`/permissions/role/${roleId}/permission/${permissionId}/revoke`, {}).then(r => r.data),
};
