import { httpClient } from './httpClient';

export interface Permission {
  id: number;
  pName: string;
  pDescription: string;
  pModule: string;
  pAction: string;
  pEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  rpGranted: boolean;
  createdAt: string;
  updatedAt: string;
  permission: Permission;
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
  getAll: (): Promise<Permission[]> =>
    httpClient.get<Permission[]>('/permissions').then(r => r.data),

  getById: (id: number): Promise<Permission> =>
    httpClient.get<Permission>(`/permissions/${id}`).then(r => r.data),

  create: (payload: CreatePermissionPayload): Promise<Permission> =>
    httpClient.post<Permission>('/permissions', payload).then(r => r.data),

  update: (id: number, payload: UpdatePermissionPayload): Promise<Permission> =>
    httpClient.patch<Permission>(`/permissions/${id}`, payload).then(r => r.data),

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/permissions/${id}`).then(() => undefined),

  // ── Por rol ──
  getByRole: (roleId: number): Promise<RolePermission[]> =>
    httpClient.get<RolePermission[]>(`/permissions/role/${roleId}`).then(r => r.data),

  setRolePermissions: (roleId: number, permissionIds: number[]): Promise<RolePermission[]> =>
    httpClient.put<RolePermission[]>(`/permissions/role/${roleId}`, { permissionIds }).then(r => r.data),

  grantPermission: (roleId: number, permissionId: number): Promise<RolePermission> =>
    httpClient.patch<RolePermission>(`/permissions/role/${roleId}/permission/${permissionId}/grant`, {}).then(r => r.data),

  revokePermission: (roleId: number, permissionId: number): Promise<RolePermission> =>
    httpClient.patch<RolePermission>(`/permissions/role/${roleId}/permission/${permissionId}/revoke`, {}).then(r => r.data),
};
