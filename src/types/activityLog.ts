// Tipos sincronizados con backend: modules/activity-logs/activity-logs.controller.ts
// Endpoint base: /activity-logs

export type ActivityType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'import'
  | 'search'
  | 'error'
  | 'warning';

export type ActivitySeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface ActivityLog {
  id: number;
  userId?: number;
  activityType: ActivityType;
  severity: ActivitySeverity;
  entityType?: string;
  entityId?: number;
  sessionId?: string;
  correlationId?: string;
  description?: string;
  success?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  userId?: number;
  activityType?: ActivityType;
  severity?: ActivitySeverity;
  entityType?: string;
  entityId?: number;
  sessionId?: string;
  correlationId?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
  tags?: string;
  search?: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ActivityStatistics {
  totalActivities: number;
  byType?: Record<ActivityType, number>;
  bySeverity?: Record<ActivitySeverity, number>;
  successRate?: number;
  recentActivity?: ActivityLog[];
}
