// ==================== User Types ====================

export interface User {
  id: number;
  identification: string;
  name: string;
  fLastName: string;
  sLastName?: string;
  u_email: string;
  u_email_verified: boolean;
  u_is_active: boolean;
  create_at: string;
  role_id?: number;
  role?: UserRole;
}

export interface UserRole {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
}

// ==================== DTOs ====================

export interface CreateUserData {
  identification: string;
  name: string;
  fLastName: string;
  sLastName?: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserData {
  identification?: string;
  name?: string;
  fLastName?: string;
  sLastName?: string;
  u_email?: string;
  password?: string;
  roleId?: number;
  u_is_active?: boolean;
}

export interface UserChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserSearchParams {
  name?: string;
  email?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UserListResponse {
  data: User[];
  total?: number;
  page?: number;
  limit?: number;
}