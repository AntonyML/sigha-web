// Interfaz que coincide exactamente con la respuesta del backend
export interface Program {
  id?: number;
  pName: string; // Cambiado para coincidir con el backend
  createAt?: string; // Cambiado para coincidir con el backend
  subPrograms?: SubProgram[]; // Cambiado para coincidir con el backend
}

// Interfaz que coincide con la respuesta del backend
export interface SubProgram {
  id?: number;
  spName: string; // Cambiado para coincidir con el backend
  idProgram: number; // Cambiado para coincidir con el backend
}

// Interfaz para crear/editar programas (mantiene la estructura original del frontend)
export interface CreateProgramData {
  p_name: string;
  p_description: string;
  p_type: 'health' | 'recreation' | 'education' | 'community' | 'research' | 'other';
  p_observations?: string;
  p_start_date: string;
  p_end_date?: string;
  p_budget?: number;
  p_status: 'planned' | 'in progress' | 'completed' | 'cancelled';
}

export interface CreateProgramData {
  p_name: string;
  p_description: string;
  p_type: 'health' | 'recreation' | 'education' | 'community' | 'research' | 'other';
  p_observations?: string;
  p_start_date: string;
  p_end_date?: string;
  p_budget?: number;
  p_status: 'planned' | 'in progress' | 'completed' | 'cancelled';
}

export interface UpdateProgramData extends Partial<CreateProgramData> {}

export interface ProgramSearchParams {
  p_name?: string;
  p_type?: string;
  p_status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProgramApiResponse {
  data: Program[];
  total: number;
  page: number;
  limit: number;
}

// Programa por defecto para formularios
export const defaultProgram: CreateProgramData = {
  p_name: '',
  p_description: '',
  p_type: 'other',
  p_observations: '',
  p_start_date: '',
  p_end_date: '',
  p_budget: 0,
  p_status: 'planned'
};

// Mapeo de tipos de programas para mostrar en español
export const PROGRAM_TYPE_MAP: Record<string, string> = {
  health: 'Salud',
  recreation: 'Recreación',
  education: 'Educación',
  community: 'Comunitario',
  research: 'Investigación',
  other: 'Otro'
};

// Mapeo de estados de programas
export const PROGRAM_STATUS_MAP: Record<string, string> = {
  planned: 'Planeado',
  'in progress': 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado'
};