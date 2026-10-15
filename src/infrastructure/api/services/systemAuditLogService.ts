import { httpClient } from '@/infrastructure/api/httpClient';
import type { SystemAuditLogFilters, SystemAuditLogList } from '@/shared/types/systemAuditLog';

export const systemAuditLogService = {
  findAll: (filters: SystemAuditLogFilters = {}): Promise<SystemAuditLogList> =>
    httpClient.get<SystemAuditLogList>('/system-audit-logs', { params: filters }).then((response) => response.data),
};
