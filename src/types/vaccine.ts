export interface Vaccine {
  id?: number;
  vName: string; // Cambiado para coincidir con el backend
}

export interface CreateVaccineData {
  vName: string; // Cambiado para coincidir con el backend
}

export interface UpdateVaccineData {
  vName?: string;
}

export interface VaccineSearchParams {
  vName?: string; // Cambiado para coincidir con el backend
}

export interface VaccineApiResponse {
  data: Vaccine[];
  total: number;
  page: number;
  limit: number;
}

// Vacuna por defecto para formularios
export const defaultVaccine: CreateVaccineData = {
  vName: ''
};

// Vacunas comunes para adultos mayores
export const COMMON_VACCINES = [
  'Influenza (Gripe)',
  'Neumococo',
  'COVID-19',
  'Hepatitis B',
  'Tétanos y Difteria (Td)',
  'Herpes Zóster',
  'Hepatitis A'
];