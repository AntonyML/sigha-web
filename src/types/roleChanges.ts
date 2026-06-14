export interface RoleChange {
  id: number;
  rcOldRole?: string | null;
  rcNewRole?: string | null;
  oldRoleId?: number | null;
  newRoleId?: number | null;
  idUser: number;
  changedBy: number;
  changedAt: string;

  user?: {
    id: number;
    uName: string;
    uFLastName: string;
    uEmail: string;
  };
  changedByUser?: {
    id: number;
    uName: string;
    uFLastName: string;
    uEmail: string;
  };
  oldRole?: {
    id: number;
    rName: string;
  } | null;
  newRole?: {
    id: number;
    rName: string;
  } | null;
}

export interface CreateRoleChangeData {
  idUser: number;
  changedBy?: number;
  oldRoleId?: number;
  newRoleId?: number;
  rcOldRole?: string;
  rcNewRole?: string;
}

export interface SearchRoleChangesData {
  idUser?: number;
  changedBy?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
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
  changesByAdmin: Array<{
    adminId: number;
    adminName: string;
    count: number;
  }>;
  changesByRole: Array<{
    role: string;
    count: number;
  }>;
  recentChanges: RoleChange[];
}
