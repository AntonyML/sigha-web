export interface User {
  id: number;
  uIdentification: string;
  uName: string;
  uFLastName: string;
  uSLastName?: string;
  uEmail: string;
  uEmailVerified?: boolean;
  uIsActive?: boolean;
  createAt?: Date;
}

export interface UserRole {
  id: number;
  rName: string;
}

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
  uIdentification?: string;
  uName?: string;
  uFLastName?: string;
  uSLastName?: string;
  uEmail?: string;
  roleId?: number;
  uIsActive?: boolean;
}

export interface CreateRoleData {
  rName: string;
}

export interface UpdateRoleData {
  rName?: string;
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
