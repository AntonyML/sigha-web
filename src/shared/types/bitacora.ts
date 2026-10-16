export type BitacoraCategoria =
  | 'general'
  | 'clinico'
  | 'conductual'
  | 'incidente'
  | 'administrativo'
  | 'turno';

export type BitacoraVisibilidad =
  | 'general'
  | 'clinica'
  | 'confidencial'
  | 'direccion';

export type BitacoraUrgencia =
  | 'baja'
  | 'media'
  | 'alta'
  | 'critica';

export type BitacoraEstado =
  | 'borrador'
  | 'publicado'
  | 'resuelto'
  | 'archivado';

export interface BitacoraAdjunto {
  url: string;
  nombre: string;
  tamano?: number;
  tipoMime?: string;
}

export interface BitacoraAcuse {
  id: number;
  entradaId: number;
  usuarioId: number;
  fechaLectura: string;
  comentario?: string;
  usuario?: {
    id: number;
    nombreCompleto?: string;
    uName?: string;
    uFLastName?: string;
  };
}

export interface BitacoraEntrada {
  id: number;
  tenantId: number;
  perfilId?: string | null;
  autorId: number;
  padreId?: number | null;
  titulo: string;
  contenido: string;
  categoria: BitacoraCategoria;
  visibilidad: BitacoraVisibilidad;
  urgencia: BitacoraUrgencia;
  estado: BitacoraEstado;
  requiereAcuse: boolean;
  adjuntos: BitacoraAdjunto[];
  acuses?: BitacoraAcuse[];
  respuestas?: BitacoraEntrada[];
  autor?: {
    id: number;
    uName?: string;
    uFLastName?: string;
  };
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearBitacoraPayload {
  perfilId?: string;
  olderAdultId?: number;
  titulo?: string;
  contenido: string;
  categoria?: BitacoraCategoria;
  visibilidad?: BitacoraVisibilidad;
  urgencia?: BitacoraUrgencia;
  requiereAcuse?: boolean;
  padreId?: number | null;
  adjuntos?: BitacoraAdjunto[];
}
