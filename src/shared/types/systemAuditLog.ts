export type SystemAuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SystemAuditLog {
  id: string;
  tableName: string;
  recordId: string;
  action: SystemAuditAction;
  actorUserId: number | null;
  occurredAt: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  actor: { id: number; name: string; email: string } | null;
}

export interface SystemAuditLogFilters {
  tableName?: string;
  recordId?: string;
  action?: SystemAuditAction;
  actorUserId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface SystemAuditLogList {
  data: SystemAuditLog[];
  total: number;
  page: number;
  limit: number;
}
