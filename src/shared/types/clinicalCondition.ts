export interface ClinicalCondition {
  id?: number;
  ccName: string; // Coincide con la respuesta del backend
}

export interface CreateClinicalConditionData {
  ccName: string;
}

export interface UpdateClinicalConditionData {
  ccName?: string;
}

export interface ClinicalConditionSearchParams {
  ccName?: string;
}

export interface ClinicalConditionApiResponse {
  data: ClinicalCondition[];
  total: number;
  page: number;
  limit: number;
}

// Condición clínica por defecto para formularios
export const defaultClinicalCondition: CreateClinicalConditionData = {
  ccName: ''
};

// Condiciones clínicas comunes (datos de respaldo)
export const COMMON_CLINICAL_CONDITIONS = [
  'HTA', // Hipertensión Arterial
  'DBT', // Diabetes
  'Dislipidemia',
  'IRC', // Insuficiencia Renal Crónica
  'Cardiopatía Isquémica',
  'ACV', // Accidente Cerebrovascular
  'Amputación',
  'Tabaquismo',
  'Alcoholismo',
  'Parkinson',
  'Demencia',
  'Prostatismo',
  'Incontinencia Urinaria',
  'Caídas Frecuentes',
  'Neoplasias'
];