// ==================== Permission Entity Types ====================

export interface PermissionEntity {
  id: number;
  name: string;
  description: string;
  module: string;
  action: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== DTOs ====================

export interface CreatePermissionData {
  name: string;
  description: string;
  module: string;
  action: string;
  enabled: boolean;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
  module?: string;
  action?: string;
  enabled?: boolean;
}