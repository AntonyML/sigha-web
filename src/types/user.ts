export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UserChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserSearchParams {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserApiResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}