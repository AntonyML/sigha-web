export type AccessEventType = 'exit' | 'return' | 'visit';

export interface AccessLog {
  id: number;
  idOlderAdult: number | null;
  eventType: AccessEventType;
  occurredAt: string;
  expectedReturnAt: string | null;
  visitorName: string | null;
  notes: string | null;
  recordedBy: number | null;
  resident: { id: number; name: string } | null;
}

export interface AccessLogList {
  data: AccessLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AccessLogFilters {
  eventType?: AccessEventType;
  residentId?: number;
  visitorName?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface CreateAccessLog {
  eventType: AccessEventType;
  residentId?: number;
  occurredAt?: string;
  expectedReturnAt?: string;
  visitorName?: string;
  notes?: string;
}
