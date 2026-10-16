export type SexoBiologico = 'femenino' | 'masculino' | 'intersexual' | 'no_especificado';

export type RolPersonaTipo = 'RESIDENTE' | 'CONTACTO' | 'PERSONAL' | 'PACIENTE_AMBULATORIO';

export type PerfilEstado = 'activo' | 'egresado' | 'fallecido' | 'suspendido';

export interface DocumentoIdentidad {
  id?: string;
  tipo: string;
  numero: string;
  fechaVencimiento?: string | null;
  esPrincipal: boolean;
}

export interface MedioContacto {
  id?: string;
  tipo: string;
  valor: string;
  esPrincipal: boolean;
  observacion?: string;
}

export interface Direccion {
  id?: string;
  pais?: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  barrio?: string;
  direccionExacta: string;
  codigoPostal?: string;
  esResidenciaActual?: boolean;
}

export interface RelacionPersona {
  id?: string;
  personaOrigenId: string;
  personaDestinoId: string;
  parentesco: string;
  esResponsableLegal: boolean;
  esContactoEmergencia: boolean;
  prioridadLlamada: number;
  viveConPersona: boolean;
  observaciones?: string;
}

export interface PersonaRol {
  id: string;
  rol: RolPersonaTipo;
  desde: string;
  hasta?: string | null;
  estado: string;
  notas?: string;
  perfil?: Perfil;
}

export interface Perfil {
  id: string;
  personaRolId: string;
  estado: PerfilEstado;
  fechaIngreso: string;
  fechaEgreso?: string | null;
  motivoEgreso?: string | null;
  camaActualId?: string | null;
}

export interface Persona {
  id: string;
  tenantId: number;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  nombreCompleto: string;
  fechaNacimiento?: string | null;
  sexo: SexoBiologico;
  genero?: string;
  estadoCivil?: string;
  nacionalidad: string;
  fotoUrl?: string | null;
  documentos?: DocumentoIdentidad[];
  contactos?: MedioContacto[];
  direcciones?: Direccion[];
  roles?: PersonaRol[];
  createdAt: string;
  updatedAt: string;
}

export interface CrearPersonaPayload {
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  sexo?: SexoBiologico;
  genero?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  fotoUrl?: string;
  rol?: RolPersonaTipo;
  documento?: {
    tipo: string;
    numero: string;
    fechaVencimiento?: string;
  };
  contacto?: {
    tipo: string;
    valor: string;
    esPrincipal?: boolean;
  };
  direccion?: {
    provincia?: string;
    canton?: string;
    distrito?: string;
    direccionExacta: string;
  };
  perfilDigital?: Record<string, any>;
}
