export interface CareSubprogram {
  id: number;
  programId: number;
  name: string;
  description?: string | null;
}

export interface CareProgram {
  id: number;
  name: string;
  description?: string | null;
  subprograms: CareSubprogram[];
}

export interface CareScaleEvaluation {
  id: number;
  scaleType: string;
  totalScore: number;
  interpretation: string;
  evaluatedAt: string;
  encounterId: number | null;
}

export type CarePlanStatus = 'active' | 'completed' | 'cancelled';

export interface ResidentProgramEnrollment {
  id: number;
  idOlderAdult: number;
  subprogramId: number;
  scaleEvaluationId: number | null;
  status: CarePlanStatus;
  goals: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  resident: { id: number; name: string } | null;
  subprogram: { id: number; name: string; programId: number; programName: string | null } | null;
  scaleEvaluation: Omit<CareScaleEvaluation, 'encounterId'> | null;
}

export interface CreateCarePlanEnrollment {
  residentId: number;
  subprogramId: number;
  scaleEvaluationId?: number;
  goals?: string;
  startedAt?: string;
}

export interface UpdateCarePlanEnrollment {
  status?: CarePlanStatus;
  goals?: string;
  scaleEvaluationId?: number;
  startedAt?: string;
  endedAt?: string;
}
