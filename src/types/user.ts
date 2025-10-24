// ==================== User Types ====================

export interface User {
  id: number;
  uIdentification: string;
  uName: string;
  uFLastName: string;
  uSLastName?: string;
  uEmail: string;
  uEmailVerified?: boolean;
  uIsActive?: boolean;
  createAt?: string;
  roleId?: number;
  role?: UserRole;
}

export interface UserRole {
  id: number;
  rName: string;
  rDescription?: string;
  permissions?: string[];
}

// ==================== DTOs ====================

export interface CreateUserData {
  uIdentification: string;
  uName: string;
  uFLastName: string;
  uSLastName?: string;
  uEmail: string;
  uPassword: string;
  roleId: number;
}

export interface UpdateUserData {
  uName?: string;
  uFLastName?: string;
  uSLastName?: string;
  uEmail?: string;
  roleId?: number;
  uIsActive?: boolean;
}

export interface UserChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserSearchParams {
  term?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UserListResponse {
  data: User[];
  total?: number;
  page?: number;
  limit?: number;
}