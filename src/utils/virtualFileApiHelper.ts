import type { VirtualFile, VirtualFileApiPayload, ApiFamily, ApiMedication } from '../types/virtualFile';
import { transformVirtualFileToApiPayload } from '../types/virtualFile';

// Ejemplo de uso de la función de transformación

// Ejemplo de datos de un VirtualFile
const exampleVirtualFile: VirtualFile = {
  fecha: '2024-01-15',
  cedula: '1-1234-5678',
  edad: '79',
  fechaNacimiento: '1945-03-15',
  nombreApellido: 'María Elena González Rodríguez',
  estadoCivil: 'viudo',
  vivienda: 'Casa propia en San José, Barrio Escalante',
  anosEscolaridad: 'complete primary',
  trabajoPrevio: 'otros',
  
  // Datos adicionales
  zonaProcedencia: 'Cartago, Costa Rica',
  cantidadHijos: 3,
  ingresoEconomico: 250000.00,
  telefono: '2234-5678',
  email: 'maria.gonzalez@email.com',
  genero: 'female',
  tipoSangre: 'O+',
  urlFotoPerfil: 'https://example.com/photos/maria_gonzalez.jpg',
  
  // Antecedentes clínicos
  ta: '140/90',
  peso: '68.5',
  talla: '162',
  imc: '26.1',
  
  // Condiciones médicas
  hta: true,
  dbt: false,
  dislip: false,
  irc: false,
  cardioIsq: true,
  acv: false,
  amputacion: false,
  tabaquismo: true,
  alcoholismo: false,
  parkinson: false,
  demencia: false,
  prostatismo: false,
  incontinenciaUrinaria: false,
  caidasFrecuentes: true,
  neoplasias: false,
  neoplasiasDetalle: '',
  otrasCondiciones: 'Costurera y ama de casa',
  
  // RCVG
  rcvg: 'e/20 y 30%',
  
  // Vacunación
  vacunaCt: true,
  vacunaHepB: false,
  vacunaGripe: true,
  vacunaNeumococo: true,
  
  // Visión y audición
  dificultadesVision: 'SI',
  problemasAudicion: 'NO'
};

// Ejemplo de datos de familia
const familyData: ApiFamily = {
  pf_identification: '1-9876-5432',
  pf_name: 'Carlos Alberto',
  pf_f_last_name: 'González',
  pf_s_last_name: 'Jiménez',
  pf_phone_number: '8234-5678',
  pf_email: 'carlos.gonzalez@email.com',
  pf_kinship: 'son'
};

// Ejemplo de medicamentos
const medications: ApiMedication[] = [
  {
    m_medication: 'Losartán 50mg',
    m_dosage: '1 tableta cada 12 horas',
    m_treatment_type: 'chronic'
  },
  {
    m_medication: 'Ibuprofeno 400mg',
    m_dosage: '1 tableta cada 8 horas según dolor',
    m_treatment_type: 'temporary'
  },
  {
    m_medication: 'Complejo B',
    m_dosage: '1 cápsula diaria en el desayuno',
    m_treatment_type: 'preventive'
  }
];

// Función para generar el JSON del API
export function generateApiPayload(virtualFile: VirtualFile): VirtualFileApiPayload {
  return transformVirtualFileToApiPayload(virtualFile, {
    family: familyData,
    medications: medications,
    observations: 'Paciente con tendencia a caídas frecuentes. Requiere supervisión constante. Presenta ligera hipertensión controlada con medicación.'
  });
}

// Ejemplo de uso
export function exampleUsage() {
  const apiPayload = generateApiPayload(exampleVirtualFile);
  
  console.log('JSON para enviar al API:', JSON.stringify(apiPayload, null, 2));
  
  return apiPayload;
}

// Función para usar en CreateVirtualRecordPage
export function createPayloadFromForm(formData: VirtualFile, familyInfo?: ApiFamily, medicationList?: ApiMedication[]) {
  return transformVirtualFileToApiPayload(formData, {
    family: familyInfo,
    medications: medicationList || [],
    observations: formData.otrasCondiciones
  });
}