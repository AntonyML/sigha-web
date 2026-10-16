export type TipoCampoDinamico =
  | 'texto'
  | 'numero'
  | 'decimal'
  | 'fecha'
  | 'hora'
  | 'booleano'
  | 'opcion_simple'
  | 'opcion_multiple'
  | 'area_texto'
  | 'archivo'
  | 'json';

export interface DefinicionCampo {
  id: string;
  tenantId: number;
  seccionId: string;
  clave: string;
  etiqueta: string;
  descripcion?: string;
  tipo: TipoCampoDinamico;
  opciones?: Array<string | { label: string; value: any }>;
  validacion?: Record<string, any>;
  valorDefecto?: any;
  obligatorio: boolean;
  visible: boolean;
  editable: boolean;
  orden: number;
  indexado?: boolean;
}

export interface SeccionCampo {
  id: string;
  plantillaId: string;
  clave: string;
  titulo: string;
  descripcion?: string;
  icono?: string;
  orden: number;
  campos: DefinicionCampo[];
}

export interface PlantillaPerfil {
  id: string;
  tenantId: number;
  rolAplicable: string;
  nombre: string;
  descripcion: string;
  version: number;
  esVigente: boolean;
  secciones: SeccionCampo[];
}

export interface PerfilDigital {
  perfilId: string;
  tenantId: number;
  plantillaId: string;
  plantillaVersion: number;
  datos: Record<string, any>;
  metadata?: Record<string, any>;
  plantilla?: PlantillaPerfil;
}

export interface CrearSeccionPayload {
  plantillaId: string;
  clave: string;
  titulo: string;
  descripcion?: string;
  icono?: string;
  orden?: number;
}

export interface CrearCampoPayload {
  seccionId: string;
  clave: string;
  etiqueta: string;
  descripcion?: string;
  tipo: TipoCampoDinamico;
  opciones?: any[];
  validacion?: Record<string, any>;
  valorDefecto?: any;
  obligatorio?: boolean;
  visible?: boolean;
  orden?: number;
}
