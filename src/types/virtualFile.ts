export interface VirtualFile {
  id?: number;
  // Datos Personales
  fecha: string;
  cedula: string;
  edad: string;
  fechaNacimiento: string;
  nombreApellido: string;
  estadoCivil: string;
  vivienda: string;
  anosEscolaridad: string;
  trabajoPrevio: string;

  // Antecedentes Clínicos
  ta: string; // Tensión Arterial
  peso: string;
  talla: string;
  imc: string; // Índice de Masa Corporal

  // Condiciones médicas (checkboxes)
  hta: boolean; // Hipertensión Arterial
  dbt: boolean; // Diabetes
  dislip: boolean; // Dislipidemia
  irc: boolean; // Insuficiencia Renal Crónica
  cardioIsq: boolean; // Cardiopatía Isquémica
  acv: boolean; // Accidente Cerebrovascular
  amputacion: boolean;
  tabaquismo: boolean;
  alcoholismo: boolean;
  parkinson: boolean;
  demencia: boolean;
  prostatismo: boolean;
  incontinenciaUrinaria: boolean;
  caidasFrecuentes: boolean;
  neoplasias: boolean;
  neoplasiasDetalle: string;
  otrasCondiciones: string;

  // RCVG (Riesgo Cardiovascular Global)
  rcvg: string;

  // Vacunación
  vacunaCt: boolean; // cT
  vacunaHepB: boolean; // Hepatitis B
  vacunaGripe: boolean;
  vacunaNeumococo: boolean;

  // Visión y Audición
  dificultadesVision: string; // 'SI' | 'NO'
  problemasAudicion: string; // 'SI' | 'NO'

  // Campos de control
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVirtualFileData {
  // Datos Personales
  fecha: string;
  cedula: string;
  edad: string;
  fechaNacimiento: string;
  nombreApellido: string;
  estadoCivil: string;
  vivienda: string;
  anosEscolaridad: string;
  trabajoPrevio: string;

  // Antecedentes Clínicos
  ta: string;
  peso: string;
  talla: string;
  imc: string;

  // Condiciones médicas
  hta: boolean;
  dbt: boolean;
  dislip: boolean;
  irc: boolean;
  cardioIsq: boolean;
  acv: boolean;
  amputacion: boolean;
  tabaquismo: boolean;
  alcoholismo: boolean;
  parkinson: boolean;
  demencia: boolean;
  prostatismo: boolean;
  incontinenciaUrinaria: boolean;
  caidasFrecuentes: boolean;
  neoplasias: boolean;
  neoplasiasDetalle?: string;
  otrasCondiciones?: string;

  // RCVG
  rcvg: string;

  // Vacunación
  vacunaCt: boolean;
  vacunaHepB: boolean;
  vacunaGripe: boolean;
  vacunaNeumococo: boolean;

  // Visión y Audición
  dificultadesVision: string;
  problemasAudicion: string;
}

export interface UpdateVirtualFileData extends Partial<CreateVirtualFileData> {}

export interface VirtualFileSearchParams {
  nombreApellido?: string;
  cedula?: string;
  fechaFrom?: string;
  fechaTo?: string;
  estadoCivil?: string;
}

export interface VirtualFileApiResponse {
  data: VirtualFile[];
  total: number;
  page: number;
  limit: number;
}

// Objeto por defecto para crear nuevos expedientes virtuales
export const defaultVirtualFile: VirtualFile = {
  // Datos Personales
  fecha: '',
  cedula: '',
  edad: '',
  fechaNacimiento: '',
  nombreApellido: '',
  estadoCivil: '',
  vivienda: '',
  anosEscolaridad: '',
  trabajoPrevio: '',

  // Antecedentes Clínicos
  ta: '',
  peso: '',
  talla: '',
  imc: '',

  // Condiciones médicas
  hta: false,
  dbt: false,
  dislip: false,
  irc: false,
  cardioIsq: false,
  acv: false,
  amputacion: false,
  tabaquismo: false,
  alcoholismo: false,
  parkinson: false,
  demencia: false,
  prostatismo: false,
  incontinenciaUrinaria: false,
  caidasFrecuentes: false,
  neoplasias: false,
  neoplasiasDetalle: '',
  otrasCondiciones: '',

  // RCVG
  rcvg: '',

  // Vacunación
  vacunaCt: false,
  vacunaHepB: false,
  vacunaGripe: false,
  vacunaNeumococo: false,

  // Visión y Audición
  dificultadesVision: '',
  problemasAudicion: '',
};

// Tipo para los valores de estado civil
export type EstadoCivil = 'soltero' | 'casado' | 'viudo' | 'divorciado' | 'union-libre';

// Tipo para los valores de trabajo previo
export type TrabajoPrevio = 'jubilacion' | 'pension' | 'otros';

// Tipo para los valores de RCVG
export type RCVG = '<10%' | 'e/10 y 20%' | 'e/20 y 30%' | 'e/30 y 40%' | '>40%';

// Tipo para respuestas Si/No
export type SiNo = 'SI' | 'NO';