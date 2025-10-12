export interface FormData {
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
  programa: string;
  zonaProcedencia: string;
  cantHijos: string;
  familiarACargo: string;
  vinculo: string;
  telefono: string;
  ingresoHogar: string;
  email: string;

  // Antecedentes Clínicos
  ta: string;
  peso: string;
  talla: string;
  imc: string;

  // Condiciones médicas (checkboxes)
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
  neoplasiasDetalle: string;
  otrasCondiciones: string;

  // RCVG (Riesgo Cardiovascular Global)
  rcvg: string;

  // Vacunación
  vacunaCt: boolean;
  vacunaHepB: boolean;
  vacunaGripe: boolean;
  vacunaNeumococo: boolean;

  // Visión
  dificultadesVision: string;

  // Audición
  problemasAudicion: string;
}

export const initialFormData: FormData = {
  fecha: "",
  cedula: "",
  edad: "",
  fechaNacimiento: "",
  nombreApellido: "",
  estadoCivil: "",
  vivienda: "",
  anosEscolaridad: "",
  trabajoPrevio: "",
  programa: "",
  zonaProcedencia: "",
  cantHijos: "",
  familiarACargo: "",
  vinculo: "",
  telefono: "",
  ingresoHogar: "",
  email: "",
  ta: "",
  peso: "",
  talla: "",
  imc: "",
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
  neoplasiasDetalle: "",
  otrasCondiciones: "",
  rcvg: "",
  vacunaCt: false,
  vacunaHepB: false,
  vacunaGripe: false,
  vacunaNeumococo: false,
  dificultadesVision: "",
  problemasAudicion: "",
};

export const defaultFormData: FormData = initialFormData