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

  // Datos adicionales para el API
  zonaProcedencia?: string;
  cantidadHijos?: number;
  ingresoEconomico?: number;
  telefono?: string;
  email?: string;
  genero?: string;
  tipoSangre?: string;
  urlFotoPerfil?: string;

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

  // Datos adicionales
  zonaProcedencia: '',
  cantidadHijos: 0,
  ingresoEconomico: 0,
  telefono: '',
  email: '',
  genero: '',
  tipoSangre: '',
  urlFotoPerfil: '',

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





// Interfaces para el JSON del API
export interface ApiProgram {
  id: number;
  sub_programs: Array<{ id: number }>;
}

export interface ApiFamily {
  pf_identification: string;
  pf_name: string;
  pf_f_last_name: string;
  pf_s_last_name: string;
  pf_phone_number: string;
  pf_email: string;
  pf_kinship: string;
}

export interface ApiMedication {
  m_medication: string;
  m_dosage: string;
  m_treatment_type: 'chronic' | 'temporary' | 'preventive';
}

export interface ApiClinicalHistory {
  ch_frequent_falls: boolean;
  ch_weight: number;
  ch_height: number;
  ch_imc: number;
  ch_blood_pressure: string;
  ch_neoplasms: boolean;
  ch_neoplasms_description: string | null;
  ch_observations: string;
  ch_rcvg: string;
  ch_vision_problems: boolean;
  ch_vision_hearing: boolean;
  create_at: string;
  clinical_conditions: Array<{ id: number }>;
  vaccines: Array<{ id: number }>;
  medications: ApiMedication[];
}

export interface VirtualFileApiPayload {
  oa_identification: string;
  oa_name: string;
  oa_f_last_name: string;
  oa_s_last_name: string;
  oa_birthdate: string;
  oa_marital_status: string;
  oa_dwelling: string;
  oa_years_schooling: string;
  oa_previous_work: string;
  oa_is_retired: boolean;
  oa_has_pension: boolean;
  oa_other: boolean;
  oa_other_description: string | null;
  oa_area_of_origin: string;
  oa_children_count: number;
  oa_status: string;
  oa_death_date: string | null;
  oa_economic_income: number;
  oa_phone_numner: string; // Nota: el API tiene este typo "numner"
  oa_email: string;
  oa_profile_photo_url: string | null;
  oa_gender: string;
  oa_blood_type: string;
  program: ApiProgram;
  family: ApiFamily;
  clinical_history: ApiClinicalHistory;
}

// Mapeos de condiciones médicas a IDs del API
const CLINICAL_CONDITIONS_MAP: Record<string, number> = {
  hta: 1,
  dbt: 2,
  dislip: 3,
  irc: 4,
  cardioIsq: 5,
  acv: 6,
  amputacion: 7,
  tabaquismo: 8,
  alcoholismo: 9,
  parkinson: 10,
  demencia: 11,
  prostatismo: 12,
  incontinenciaUrinaria: 13,
  caidasFrecuentes: 14,
  neoplasias: 15
};

// Mapeos de vacunas a IDs del API
const VACCINES_MAP: Record<string, number> = {
  vacunaCt: 1,
  vacunaHepB: 2,
  vacunaGripe: 3,
  vacunaNeumococo: 7 // Actualizado según el ejemplo del JSON
};

// Mapeo de estados civiles
const MARITAL_STATUS_MAP: Record<string, string> = {
  soltero: 'single',
  casado: 'married',
  viudo: 'widowed',
  divorciado: 'divorced',
  'union-libre': 'common-law'
};

// Función para transformar VirtualFile a VirtualFileApiPayload
export function transformVirtualFileToApiPayload(
  virtualFile: VirtualFile,
  additionalData: {
    family?: ApiFamily;
    medications?: ApiMedication[];
    observations?: string;
    programId?: number;
    vaccineIds?: number[];
    subProgramId?: number | null;
  } = {}
): VirtualFileApiPayload {
  // Dividir el nombre completo en partes
  const nameParts = virtualFile.nombreApellido.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const firstLastName = nameParts[1] || 'Apellido';
  const secondLastName = nameParts.length >= 3 ? nameParts.slice(2).join(' ') : 'Apellido2';

  // Obtener condiciones clínicas activas
  const activeConditions = Object.keys(CLINICAL_CONDITIONS_MAP)
    .filter(condition => (virtualFile as any)[condition] === true)
    .map(condition => ({ id: CLINICAL_CONDITIONS_MAP[condition] }));

  // Obtener vacunas activas - usar IDs seleccionados si están disponibles, sino usar el mapeo tradicional
  const activeVaccines = additionalData.vaccineIds && additionalData.vaccineIds.length > 0
    ? additionalData.vaccineIds.map(id => ({ id }))
    : Object.keys(VACCINES_MAP)
        .filter(vaccine => (virtualFile as any)[vaccine] === true)
        .map(vaccine => ({ id: VACCINES_MAP[vaccine] }));

  // Convertir datos numéricos
  const weight = parseFloat(virtualFile.peso) || 0;
  const height = parseFloat(virtualFile.talla) || 0; // mantener en centímetros como espera el backend
  const imc = parseFloat(virtualFile.imc) || 0;

  // Determinar descripción de trabajo previo
  const getWorkDescription = (): string => {
    if (virtualFile.trabajoPrevio === 'otros' && virtualFile.otrasCondiciones) {
      return virtualFile.otrasCondiciones;
    }
    return virtualFile.trabajoPrevio;
  };

  return {
    oa_identification: virtualFile.cedula || '',
    oa_name: firstName || 'Sin nombre',
    oa_f_last_name: firstLastName || 'Sin apellido',
    oa_s_last_name: secondLastName || 'Sin segundo apellido',
    oa_birthdate: virtualFile.fechaNacimiento || '',
    oa_marital_status: MARITAL_STATUS_MAP[virtualFile.estadoCivil] || virtualFile.estadoCivil || 'single',
    oa_dwelling: virtualFile.vivienda || 'No especificado',
    oa_years_schooling: virtualFile.anosEscolaridad || '0',
    oa_previous_work: getWorkDescription() || 'No especificado',
    oa_is_retired: virtualFile.trabajoPrevio === 'jubilacion',
    oa_has_pension: virtualFile.trabajoPrevio === 'pension',
    oa_other: virtualFile.trabajoPrevio === 'otros',
    oa_other_description: virtualFile.trabajoPrevio === 'otros' ? virtualFile.otrasCondiciones || null : null,
    oa_area_of_origin: virtualFile.zonaProcedencia || 'No especificado',
    oa_children_count: virtualFile.cantidadHijos || 0,
    oa_status: 'alive',
    oa_death_date: null,
    oa_economic_income: virtualFile.ingresoEconomico || 0,
    oa_phone_numner: virtualFile.telefono || '',
    oa_email: virtualFile.email || '',
    oa_profile_photo_url: null,
    oa_gender: virtualFile.genero || 'no_specified',
    oa_blood_type: virtualFile.tipoSangre || 'unknown',
    
    program: {
      id: additionalData.programId || 1,
      sub_programs: additionalData.subProgramId ? [{ id: additionalData.subProgramId }] : []
    },
    
    family: additionalData.family || {
      pf_identification: '',
      pf_name: '',
      pf_f_last_name: '',
      pf_s_last_name: '',
      pf_phone_number: '',
      pf_email: '',
      pf_kinship: ''
    },
    
    clinical_history: {
      ch_frequent_falls: virtualFile.caidasFrecuentes || false,
      ch_weight: weight > 0 ? weight : 50.0,
      ch_height: height > 0 ? height : 160.0,
      ch_imc: imc > 0 ? imc : 19.5,
      ch_blood_pressure: virtualFile.ta || '120/80',
      ch_neoplasms: virtualFile.neoplasias || false,
      ch_neoplasms_description: virtualFile.neoplasias && virtualFile.neoplasiasDetalle ? virtualFile.neoplasiasDetalle : null,
      ch_observations: additionalData.observations || virtualFile.otrasCondiciones || 'Sin observaciones',
      ch_rcvg: virtualFile.rcvg || '<10%',
      ch_vision_problems: virtualFile.dificultadesVision === 'SI',
      ch_vision_hearing: virtualFile.problemasAudicion === 'SI',
      create_at: new Date().toISOString(),
      clinical_conditions: activeConditions,
      vaccines: activeVaccines,
      medications: additionalData.medications || []
    }
  };
}