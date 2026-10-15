import { httpClient } from '@/infrastructure/api/httpClient';
import type { AccessLogFilters, AccessLogList, CreateAccessLog } from '@/shared/types/accessLog';

export const accessLogService = {
  findAll: (filters: AccessLogFilters = {}): Promise<AccessLogList> =>
    httpClient.get<AccessLogList>('/access-logs', { params: filters }).then((response) => response.data),

  create: (payload: CreateAccessLog) =>
    httpClient.post('/access-logs', payload).then((response) => response.data),
};
