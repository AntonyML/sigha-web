// ==================== Role Changes Types ====================

export interface RoleChange {
  id: number;
  userId: number;
  adminId: number;
  oldRoleId?: number;
  newRoleId: number;
  changeReason?: string;
  changeType: 'ASSIGNMENT' | 'REMOVAL' | 'UPDATE';
  createdAt: string;
  updatedAt: string;

  // Relaciones opcionales
  user?: {
    id: number;
    uName: string;
    uFLastName: string;
    uEmail: string;
  };
  admin?: {
    id: number;
    uName: string;
    uFLastName: string;
    uEmail: string;
  };
  oldRole?: {
    id: number;
    rName: string;
  };
  newRole?: {
    id: number;
    rName: string;
  };
}

// ==================== DTOs ====================

export interface CreateRoleChangeData {
  userId: number;
  adminId: number;
  oldRoleId?: number;
  newRoleId: number;
  changeReason?: string;
  changeType: 'ASSIGNMENT' | 'REMOVAL' | 'UPDATE';
}

export interface SearchRoleChangesData {
  page?: number;
  limit?: number;
  userId?: number;
  adminId?: number;
  roleId?: number;
  changeType?: 'ASSIGNMENT' | 'REMOVAL' | 'UPDATE';
  startDate?: string;
  endDate?: string;
}

export interface RoleChangesResponse {
  data: RoleChange[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface RoleChangeStatistics {
  totalChanges: number;
  changesByType: {
    ASSIGNMENT: number;
    REMOVAL: number;
    UPDATE: number;
  };
  changesByMonth: Array<{
    month: string;
    count: number;
  }>;
  topAdmins: Array<{
    adminId: number;
    adminName: string;
    changesCount: number;
  }>;
}