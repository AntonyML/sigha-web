import { splitFullName } from '../utils/nameUtils';

export interface VirtualFile {
  id?: number;
  // Personal Data
  fecha: string;
  cedula: string;
  edad: string;
  fechaNacimiento: string;
  nombreApellido: string;
  estadoCivil: string;
  vivienda: string;
  anosEscolaridad: string;
  trabajoPrevio: string;

  // Additional data for API
  zonaProcedencia?: string;
  cantidadHijos?: number;
  ingresoEconomico?: number;
  telefono?: string;
  email?: string;
  genero?: string;
  tipoSangre?: string;
  urlFotoPerfil?: string;

  // Clinical Background
  ta: string; // Blood Pressure
  peso: string;
  talla: string;
  imc: string; // Body Mass Index

  // Medical conditions (checkboxes)
  hta: boolean; // Arterial Hypertension
  dbt: boolean; // Diabetes
  dislip: boolean; // Dyslipidemia
  irc: boolean; // Chronic Renal Insufficiency
  cardioIsq: boolean; // Ischemic Heart Disease
  acv: boolean; // Cerebrovascular Accident
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

  // RCVG (Global Cardiovascular Risk)
  rcvg: string;

  // Vaccination
  vacunaCt: boolean; // cT
  vacunaHepB: boolean; // Hepatitis B
  vacunaGripe: boolean;
  vacunaNeumococo: boolean;

  // Vision and Hearing
  dificultadesVision: string; // 'SI' | 'NO'
  problemasAudicion: string; // 'SI' | 'NO'

  // Status (from backend oa_status: 'alive' | 'deceased')
  status?: string;

  // Control fields
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVirtualFileData {
  // Personal Data
  fecha: string;
  cedula: string;
  edad: string;
  fechaNacimiento: string;
  nombreApellido: string;
  estadoCivil: string;
  vivienda: string;
  anosEscolaridad: string;
  trabajoPrevio: string;

  // Clinical Background
  ta: string;
  peso: string;
  talla: string;
  imc: string;

  // Medical conditions
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

  // Vaccination
  vacunaCt: boolean;
  vacunaHepB: boolean;
  vacunaGripe: boolean;
  vacunaNeumococo: boolean;

  // Vision and Hearing
  dificultadesVision: string;
  problemasAudicion: string;
}

export type UpdateVirtualFileData = Partial<CreateVirtualFileData>

export interface VirtualFileSearchParams {
  nombreApellido?: string;
  cedula?: string;
  fechaFrom?: string;
  fechaTo?: string;
  estadoCivil?: string;
}

// ==================== Patient Search DTOs ====================

export interface SearchVirtualRecordsDto {
  search: string;
}

export interface PatientBasicInfo {
  id: number;
  identification: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  fullName: string;
  birthdate: string;
  gender: string;
  phone: string;
  email: string;
  status: string;
}

export interface SearchPatientsResponse {
  message: string;
  data: PatientBasicInfo[];
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
export type RCVG = '< 10%' | 'e /10y20%' | 'e /20y30%' | 'e /40y40%' | '> 40%' | 'UNKNOWN';

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

// Clinical conditions mapping to API IDs
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

// Vaccines mapping to API IDs
const VACCINES_MAP: Record<string, number> = {
  vacunaCt: 1,
  vacunaHepB: 2,
  vacunaGripe: 3,
  vacunaNeumococo: 7 // Actualizado según el ejemplo del JSON
};

// Years of schooling mapping to BD ENUM values
const YEARS_SCHOOLING_MAP: Record<string, string> = {
  '0': 'no schooling',
  '1': 'incomplete primary',
  '2': 'incomplete primary', 
  '3': 'incomplete primary',
  '4': 'incomplete primary',
  '5': 'incomplete primary',
  '6': 'complete primary',
  '7': 'incomplete secondary',
  '8': 'incomplete secondary',
  '9': 'incomplete secondary',
  '10': 'incomplete secondary',
  '11': 'complete secondary',
  '12': 'complete secondary',
  '13': 'incomplete university',
  '14': 'incomplete university',
  '15': 'complete university',
  '16': 'complete university',
  '17': 'postgraduate',
  '18': 'postgraduate'
};

// Marital status mapping
const MARITAL_STATUS_MAP: Record<string, string> = {
  soltero: 'single',
  casado: 'married',
  viudo: 'widowed',
  divorciado: 'divorced',
  'union-libre': 'common law union' // Corregido para coincidir con BD
};

/* ── Reverse mapping: API snake_case → VirtualFile camelCase ── */

const MARITAL_STATUS_REVERSE: Record<string, string> = {
  single:             'soltero',
  married:            'casado',
  widowed:            'viudo',
  divorced:           'divorciado',
  'common law union': 'union-libre',
}

const SCHOOLING_REVERSE: Record<string, string> = {
  'no schooling':          '0',
  'incomplete primary':    '4',
  'complete primary':      '6',
  'incomplete secondary':  '9',
  'complete secondary':    '11',
  'incomplete university': '13',
  'complete university':   '15',
  postgraduate:            '17',
}

function calcEdad(birthdate?: string): string {
  if (!birthdate) return ''
  const d = new Date(birthdate)
  if (isNaN(d.getTime())) return ''
  return String(Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25)))
}

/**
 * Converts a raw API response record into the frontend VirtualFile shape.
 * The backend returns camelCase with oa/ch prefixes (e.g. oaIdentification, chWeight).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapApiToVirtualFile(raw: any): VirtualFile {
  const r = raw ?? {}
  const ch = r.clinicalHistory ?? {}

  // conditions[] contains objects with id; vaccines[] too
  const condArr: Array<{ id: number }> = ch.conditions ?? []
  const condSet = new Set(condArr.map((c: { id: number }) => c.id))

  const vaccArr: Array<{ id: number }> = ch.vaccines ?? []
  const vaccSet = new Set(vaccArr.map((v: { id: number }) => v.id))

  const firstName  = r.oaName      ?? ''
  const firstLast  = r.oaFLastName ?? ''
  const secondLast = r.oaSLastName ?? ''
  const nombreApellido = [firstName, firstLast, secondLast].filter(Boolean).join(' ')

  const birthdate = r.oaBirthdate ?? ''

  return {
    id:              r.id,
    // Personal
    fecha:           r.createAt ?? r.oaEntryDate ?? '',
    cedula:          r.oaIdentification ?? '',
    edad:            calcEdad(birthdate),
    fechaNacimiento: birthdate,
    nombreApellido,
    estadoCivil:     MARITAL_STATUS_REVERSE[r.oaMaritalStatus] ?? r.oaMaritalStatus ?? '',
    vivienda:        r.oaAddress       ?? '',
    anosEscolaridad: SCHOOLING_REVERSE[r.oaYearsSchooling] ?? r.oaYearsSchooling ?? '',
    trabajoPrevio:   r.oaIsRetired ? 'jubilacion' : r.oaHasPension ? 'pension' : r.oaOther ? 'otros' : (r.oaPreviousWork ?? ''),
    // Optional fields
    zonaProcedencia:  r.oaAreaOfOrigin   ?? '',
    cantidadHijos:    r.oaChildrenCount  ?? 0,
    ingresoEconomico: r.oaEconomicIncome != null ? Number(r.oaEconomicIncome) : undefined,
    telefono:         r.oaPhoneNumber    ?? '',
    email:            r.oaEmail          ?? '',
    genero:           r.oaGender         ?? '',
    tipoSangre:       r.oaBloodType      ?? '',
    urlFotoPerfil:    r.oaProfilePhotoUrl ?? '',
    status:           r.oaStatus         ?? '',
    createdAt:        r.createAt         ?? '',
    // Clinical history
    ta:               ch.chBloodPressure ?? '',
    peso:             ch.chWeight  != null ? String(ch.chWeight)                  : '',
    talla:            ch.chHeight  != null ? String(Number(ch.chHeight) * 100)    : '', // metres→cm
    imc:              ch.chImc     != null ? String(ch.chImc)                     : '',
    rcvg:             ch.chRcvg            ?? '',
    dificultadesVision: ch.chVisionProblems ? 'SI' : 'NO',
    problemasAudicion:  ch.chVisionHearing  ? 'SI' : 'NO',
    otrasCondiciones:   ch.chObservations   ?? '',
    neoplasiasDetalle:  ch.chNeoplasmsDescription ?? '',
    // Medical conditions by ID
    hta:                   condSet.has(1),
    dbt:                   condSet.has(2),
    dislip:                condSet.has(3),
    irc:                   condSet.has(4),
    cardioIsq:             condSet.has(5),
    acv:                   condSet.has(6),
    amputacion:            condSet.has(7),
    tabaquismo:            condSet.has(8),
    alcoholismo:           condSet.has(9),
    parkinson:             condSet.has(10),
    demencia:              condSet.has(11),
    prostatismo:           condSet.has(12),
    incontinenciaUrinaria: condSet.has(13),
    caidasFrecuentes:      condSet.has(14),
    neoplasias:            condSet.has(15),
    // Vaccines by ID
    vacunaCt:        vaccSet.has(1),
    vacunaHepB:      vaccSet.has(2),
    vacunaGripe:     vaccSet.has(3),
    vacunaNeumococo: vaccSet.has(4),
  }
}

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
  // Dividir el nombre completo en partes.
  // Las últimas 2 palabras SIEMPRE son los apellidos; todo lo demás son
  // nombres de pila (una persona puede tener 1, 2 o 3 nombres).
  // Ver src/utils/nameUtils.ts para la lógica centralizada.
  const { givenNames, firstLastName: splitFirstLastName, secondLastName: splitSecondLastName } =
    splitFullName(virtualFile.nombreApellido);
  const firstName = givenNames;
  const firstLastName = splitFirstLastName || 'Apellido';
  const secondLastName = splitSecondLastName || 'Apellido2';

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

  // Convertir datos numéricos con validaciones de rango
  const weight = Math.min(parseFloat(virtualFile.peso) || 0, 999.99); // Max DECIMAL(5,2)
  const heightCm = parseFloat(virtualFile.talla) || 0;
  const height = Math.min(heightCm / 100, 99.99); // Max DECIMAL(4,2) y convertir cm a metros
  const imcRaw = parseFloat(virtualFile.imc) || 0;
  const imc = Math.min(Math.round(imcRaw * 10) / 10, 999.9); // Max DECIMAL(4,1) con 1 decimal

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
    oa_marital_status: MARITAL_STATUS_MAP[virtualFile.estadoCivil] || virtualFile.estadoCivil || 'not specified',
    oa_dwelling: virtualFile.vivienda || 'No especificado',
    oa_years_schooling: YEARS_SCHOOLING_MAP[virtualFile.anosEscolaridad] || 'not specified',
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
    oa_gender: virtualFile.genero || 'not specified',
    oa_blood_type: virtualFile.tipoSangre || 'UNKNOWN',
    
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
      pf_kinship: 'not specified' // Valor por defecto según ENUM de BD
    },
    
    clinical_history: {
      ch_frequent_falls: virtualFile.caidasFrecuentes || false,
      ch_weight: weight > 0 ? weight : 50.0, // DECIMAL(5,2) - max 999.99
      ch_height: height > 0 ? height : 1.60, // DECIMAL(4,2) - max 99.99 metros
      ch_imc: imc > 0 ? imc : 19.5, // DECIMAL(4,1) - max 999.9 con 1 decimal
      ch_blood_pressure: virtualFile.ta || '120/80',
      ch_neoplasms: virtualFile.neoplasias || false,
      ch_neoplasms_description: virtualFile.neoplasias && virtualFile.neoplasiasDetalle ? virtualFile.neoplasiasDetalle : null,
      ch_observations: additionalData.observations || virtualFile.otrasCondiciones || 'Sin observaciones',
      ch_rcvg: virtualFile.rcvg || 'UNKNOWN',
      ch_vision_problems: virtualFile.dificultadesVision === 'SI',
      ch_vision_hearing: virtualFile.problemasAudicion === 'SI',
      create_at: new Date().toISOString(),
      clinical_conditions: activeConditions,
      vaccines: activeVaccines,
      medications: additionalData.medications || []
    }
  };
}