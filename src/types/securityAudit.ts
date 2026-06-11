// Tipos sincronizados con backend: modules/security-audit/security-audit.controller.ts
// Endpoint base: /security-audit

export type SecurityEventType =
  | 'failed_login'
  | 'brute_force'
  | 'unauthorized_access'
  | 'privilege_escalation'
  | 'data_breach'
  | 'suspicious_activity'
  | 'account_lockout'
  | 'password_change'
  | 'mfa_failure'
  | 'session_hijacking';

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SecurityEventStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';

export interface SecurityEvent {
  id: number;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  status: SecurityEventStatus;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: number;
  metadata?: Record<string, unknown>;
  resolvedAt?: string;
  resolvedBy?: number;
  resolutionNotes?: string;
  createdAt: string;
}

export interface CreateSecurityEventDto {
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchSecurityEventsDto {
  page?: number;
  limit?: number;
  eventType?: SecurityEventType;
  severity?: SecurityEventSeverity;
  status?: SecurityEventStatus;
  startDate?: string;
  endDate?: string;
  userId?: number;
  ipAddress?: string;
}

export interface ResolveSecurityEventDto {
  status: 'resolved' | 'false_positive';
  resolutionNotes?: string;
}

export interface LoginAttempt {
  id: number;
  userId?: number;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  attemptedAt: string;
}

export interface SearchLoginAttemptsDto {
  page?: number;
  limit?: number;
  userId?: number;
  success?: boolean;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
}

export interface SecurityStatistics {
  totalEvents: number;
  openEvents: number;
  criticalEvents: number;
  loginAttempts: number;
  failedLogins: number;
  recentEvents?: SecurityEvent[];
}

export interface PaginatedSecurityEventsResponse {
  events: SecurityEvent[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginatedLoginAttemptsResponse {
  attempts: LoginAttempt[];
  total: number;
  page: number;
  totalPages: number;
}
