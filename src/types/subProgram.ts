export interface SubProgram {
  id?: number;
  spName: string;
  programId: number;
  // Datos adicionales para mostrar en la UI
  program?: {
    id: number;
    pName: string;
  };
}

export interface CreateSubProgramData {
  spName: string;
  programId: number;
}

export interface UpdateSubProgramData extends Partial<CreateSubProgramData> {}

export interface SubProgramSearchParams {
  spName?: string;
  id_program?: number;
}

export interface SubProgramApiResponse {
  data: SubProgram[];
  total: number;
  page: number;
  limit: number;
}

// SubPrograma por defecto para formularios
export const defaultSubProgram: SubProgram = {
  spName: '',
  programId: 0
};