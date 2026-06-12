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
  pName: string;
}

export interface UpdateProgramData {
  pName?: string;
}

export interface ProgramApiResponse {
  data: Program[];
  total: number;
  page: number;
  limit: number;
}

// Programa por defecto para formularios
export const defaultProgram: CreateProgramData = {
  pName: ''
};