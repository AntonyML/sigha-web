/** Helpers de API para preparar y limpiar datos de prueba. */
import type { APIRequestContext } from '@playwright/test';
import { authedApi } from './auth';
import { buildCreatePayload, uniqueIdentification } from './factories';

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