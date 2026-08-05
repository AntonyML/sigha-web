import { request } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';

export const WEB_URL = process.env.E2E_WEB_URL ?? 'http://localhost:5173';
export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';

/** Lee el token guardado por global-setup (e2e/.auth/user.json). */
export function readAuthToken(): string {
  const path = 'e2e/.auth/user.json';
  if (!existsSync(path)) return '';
  const state = JSON.parse(readFileSync(path, 'utf-8')) as {
    origins?: Array<{ localStorage?: Array<{ name: string; value: string }> }>;
  };
  for (const origin of state.origins ?? []) {
    for (const item of origin.localStorage ?? []) {
      if (item.name === 'authToken') return item.value;
    }
  }
  return '';
}

/** Contexto de request autenticado contra la API (para preparar/limpiar datos). */
export async function authedApi(): Promise<APIRequestContext> {
  const token = readAuthToken();
  if (!token) throw new Error('No hay token de e2e. Ejecuta el global-setup primero.');
  return request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
}

let sequence = 0;

/** Genera una identificación de 9 dígitos única (requisito del backend: solo dígitos). */
export function uniqueIdentification(): string {
  sequence += 1;
  const now = String(Date.now());
  const tail = now.slice(now.length - 8);
  return `9${tail}${sequence}`.slice(0, 9);
}

/**
 * Payload válido para POST /virtual-records/create.
 * Cumple las validaciones del DTO (CreateVirtualRecordDirectDto) y de la
 * función SQL create_virtual_file (familia obligatoria).
 */
export function buildCreatePayload(identification: string): Record<string, unknown> {
  return {
    oa_identification: identification,
    oa_document_type: 'nacional',
    oa_name: 'Persona',
    oa_f_last_name: 'E2E',
    oa_s_last_name: 'Prueba',
    oa_birthdate: '1990-01-01',
    oa_marital_status: 'single',
    oa_dwelling: 'Propia',
    oa_years_schooling: 'complete primary',
    oa_previous_work: 'No especificado',
    oa_is_retired: false,
    oa_has_pension: false,
    oa_other: false,
    oa_other_description: null,
    oa_province: '',
    oa_canton: '',
    oa_district: '',
    oa_children_count: 0,
    oa_status: 'alive',
    oa_death_date: null,
    oa_economic_income: 0,
    oa_phone_numner: '',
    oa_email: '',
    oa_profile_photo_url: null,
    oa_gender: 'not specified',
    oa_blood_type: 'UNKNOWN',
    program: { id: 1, sub_programs: [] },
    family: {
      pf_identification: identification,
      pf_document_type: 'nacional',
      pf_name: 'Familiar',
      pf_f_last_name: 'Contacto',
      pf_s_last_name: 'Prueba',
      pf_phone_number: '',
      pf_email: 'familiar.e2e@example.com',
      pf_kinship: 'son',
    },
    clinical_history: {
      ch_frequent_falls: false,
      ch_neoplasms: false,
      ch_vision_problems: false,
      ch_vision_hearing: false,
    },
  };
}

/** Obtiene un ID de programa existente (fallback a 1). */
export async function firstProgramId(ctx: APIRequestContext): Promise<number> {
  const res = await ctx.get('/programs');
  const body = (await res.json().catch(() => ({}))) as
    | Array<{ id: number }>
    | { data?: Array<{ id: number }> };
  const list = Array.isArray(body) ? body : body.data ?? [];
  return list[0]?.id ?? 1;
}

/** Crea un expediente desechable vía API y devuelve su id + identificación. */
export async function createDisposableRecord(): Promise<{ id: number; identification: string }> {
  const ctx = await authedApi();
  try {
    const identification = uniqueIdentification();
    const payload = buildCreatePayload(identification);
    payload.program = { id: await firstProgramId(ctx), sub_programs: [] };

    const res = await ctx.post('/virtual-records/create', { data: payload });
    if (!res.ok()) {
      throw new Error(`createVirtualRecord falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as { data?: { id?: number } };
    const id = body.data?.id;
    if (!id) throw new Error(`createVirtualRecord: respuesta sin id: ${JSON.stringify(body)}`);
    return { id, identification };
  } finally {
    await ctx.dispose();
  }
}

/** Elimina un expediente directamente vía API (limpieza/seguridad). */
export async function deleteRecordDirect(id: number): Promise<void> {
  const ctx = await authedApi();
  try {
    const res = await ctx.delete(`/virtual-records/${id}`);
    if (!res.ok()) {
      throw new Error(`deleteVirtualRecord falló (${res.status()}): ${await res.text()}`);
    }
  } finally {
    await ctx.dispose();
  }
}