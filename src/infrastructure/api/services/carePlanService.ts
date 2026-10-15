import { httpClient } from '@/infrastructure/api/httpClient';
import type {
  CareProgram,
  CareScaleEvaluation,
  CreateCarePlanEnrollment,
  ResidentProgramEnrollment,
  UpdateCarePlanEnrollment,
} from '@/shared/types/carePlan';

export const carePlanService = {
  getCatalog: (): Promise<CareProgram[]> =>
    httpClient.get<CareProgram[]>('/care-plans/catalog').then((response) => response.data),

  createProgram: (payload: { name: string; description?: string }): Promise<CareProgram> =>
    httpClient.post<CareProgram>('/care-plans/catalog/programs', payload).then((response) => response.data),

  createSubprogram: (payload: { programId: number; name: string; description?: string }): Promise<unknown> =>
    httpClient.post('/care-plans/catalog/subprograms', payload).then((response) => response.data),

  getScaleEvaluations: (residentId: number): Promise<CareScaleEvaluation[]> =>
    httpClient.get<CareScaleEvaluation[]>('/care-plans/scale-evaluations', { params: { residentId } }).then((response) => response.data),

  getEnrollments: (filters: { residentId?: number; status?: string } = {}): Promise<ResidentProgramEnrollment[]> =>
    httpClient.get<ResidentProgramEnrollment[]>('/care-plans/enrollments', { params: filters }).then((response) => response.data),

  createEnrollment: (payload: CreateCarePlanEnrollment): Promise<ResidentProgramEnrollment> =>
    httpClient.post<ResidentProgramEnrollment>('/care-plans/enrollments', payload).then((response) => response.data),

  updateEnrollment: (id: number, payload: UpdateCarePlanEnrollment): Promise<ResidentProgramEnrollment> =>
    httpClient.patch<ResidentProgramEnrollment>(`/care-plans/enrollments/${id}`, payload).then((response) => response.data),
};
