import type { EntranceExitResponse, EntranceExitType, AccessType } from '@/shared/types/entranceExit';

export interface EntranceExitListResponse {
  data: EntranceExitResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EntranceExitSearchParams {
  eeType?: EntranceExitType;
  eeAccessType?: AccessType;
  eeClose?: boolean;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}