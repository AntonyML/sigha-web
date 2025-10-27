// src/types/notifuse.ts

export interface Contact {
  email: string;
  first_name: string;
  last_name?: string;
  external_id?: string;
}

export interface CodeVerifyData {
  titulo_principal: string;
  nombre_usuario: string;
  mensaje_contexto: string;
  codigo_verificacion: string;
  tiempo_expiracion: string;
  ubicacion: string;
  fecha_hora: string;
  url_privacidad: string;
  url_terminos: string;
  url_soporte: string;
}

export interface BackupCodesData {
  titulo_principal: string;
  nombre_usuario: string;
  mensaje_contexto: string;
  codigo_1: string;
  codigo_2: string;
  codigo_3: string;
  codigo_4: string;
  codigo_5: string;
  codigo_6: string;
  codigo_7: string;
  codigo_8: string;
  tiempo_expiracion: string;
  ubicacion: string;
  fecha_hora: string;
}

export interface Notification<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  contact: Contact;
  data: T;
}

export interface SendCodeVerifyRequest {
  workspace_id: string;
  notification: Notification<CodeVerifyData>;
}

export interface SendBackupCodesRequest {
  workspace_id: string;
  notification: Notification<BackupCodesData>;
}

export interface NotifuseResponse {
  success: boolean;
  message?: string;
  error?: string;
}