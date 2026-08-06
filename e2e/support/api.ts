/** Helpers de API para preparar y limpiar datos de prueba. */
import type { APIRequestContext } from '@playwright/test';
import { authedApi } from './auth';
import {
  buildCreatePayload,
  buildEntranceExitPayload,
  buildUserPayload,
  uniqueIdentification,
} from './factories';
import type { EeAccessType } from './factories';

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

    // El backend aplica un throttler global (THROTTLE_LIMIT ?? 100 req/min).
    // Si el límite se alcanza por la concurrencia de la suite, reintentamos con backoff.
    const MAX_ATTEMPTS = 4;
    let res: import('@playwright/test').APIResponse;
    for (let attempt = 1; ; attempt++) {
      res = await ctx.post('/virtual-records/create', { data: payload });
      if (res.status() !== 429 || attempt >= MAX_ATTEMPTS) break;
      await new Promise((r) => setTimeout(r, attempt * 5_000));
    }

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

/** Crea un programa desechable vía API y devuelve su id + nombre. */
export async function createDisposableProgram(
  pName: string,
): Promise<{ id: number; pName: string }> {
  const ctx = await authedApi();
  try {
    // Reintento con backoff si el throttler global (100 req/min) responde 429.
    const MAX_ATTEMPTS = 4;
    let res: import('@playwright/test').APIResponse;
    for (let attempt = 1; ; attempt++) {
      res = await ctx.post('/programs', { data: { pName } });
      if (res.status() !== 429 || attempt >= MAX_ATTEMPTS) break;
      await new Promise((r) => setTimeout(r, attempt * 5_000));
    }
    if (!res.ok()) {
      throw new Error(`createProgram falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as { data?: { id?: number; pName?: string } };
    const id = body.data?.id;
    if (!id) throw new Error(`createProgram: respuesta sin id: ${JSON.stringify(body)}`);
    return { id, pName: body.data?.pName ?? pName };
  } finally {
    await ctx.dispose();
  }
}

/** Busca el id de un programa por nombre exacto (para limpiar lo creado por la UI). */
export async function findProgramIdByName(pName: string): Promise<number | null> {
  const ctx = await authedApi();
  try {
    const res = await ctx.get('/programs');
    if (!res.ok()) {
      throw new Error(`getPrograms falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as { data?: Array<{ id: number; pName: string }> };
    return (body.data ?? []).find((p) => p.pName === pName)?.id ?? null;
  } finally {
    await ctx.dispose();
  }
}

/** Elimina un programa directamente vía API (limpieza/seguridad). */
export async function deleteProgramDirect(id: number): Promise<void> {
  const ctx = await authedApi();
  try {
    const res = await ctx.delete(`/programs/${id}`);
    if (!res.ok()) {
      throw new Error(`deleteProgram falló (${res.status()}): ${await res.text()}`);
    }
  } finally {
    await ctx.dispose();
  }
}

/**
 * Crea un registro de entrada/salida vía API y devuelve sus datos.
 * Con `close: true` además cierra el ciclo (fecha de salida > fecha de entrada).
 */
export async function createEntranceExit(
  accessType: EeAccessType,
  opts?: { close?: boolean },
): Promise<{ id: number; identification: string; fullName: string }> {
  const ctx = await authedApi();
  try {
    const identification = uniqueIdentification();
    const secondLastName = accessType === 'entrance' ? 'Entrada' : 'Salida';
    const payload = buildEntranceExitPayload({
      identification,
      accessType,
      name: 'Persona',
      firstLastName: 'E2E',
      secondLastName,
      observations: 'Registro creado por test e2e',
    });

    // El backend aplica un throttler global (THROTTLE_LIMIT ?? 100 req/min).
    // Si el límite se alcanza por la concurrencia de la suite, reintentamos con backoff.
    let res: import('@playwright/test').APIResponse;
    for (let attempt = 1; ; attempt++) {
      res = await ctx.post('/entrances-exits', { data: payload });
      if (res.status() !== 429 || attempt >= 4) break;
      await new Promise((r) => setTimeout(r, attempt * 5_000));
    }
    if (!res.ok()) {
      throw new Error(`createEntranceExit falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as { id: number };
    if (!body.id) throw new Error(`createEntranceExit: respuesta sin id: ${JSON.stringify(body)}`);

    if (opts?.close) {
      const closePayload =
        accessType === 'entrance'
          ? {
              eeClose: true,
              eeDatetimeExit: new Date(Date.now() + 60_000).toISOString(),
              eeObservations: 'Cerrado por test e2e',
            }
          : { eeClose: true, eeObservations: 'Cerrado por test e2e' };
      const closeRes = await ctx.patch(`/entrances-exits/${body.id}/close-cycle`, {
        data: closePayload,
      });
      if (!closeRes.ok()) {
        await ctx.delete(`/entrances-exits/${body.id}`).catch(() => undefined);
        throw new Error(
          `closeEntranceExit falló (${closeRes.status()}): ${await closeRes.text()}`,
        );
      }
    }

    return { id: body.id, identification, fullName: `Persona E2E ${secondLastName}` };
  } finally {
    await ctx.dispose();
  }
}

/** Elimina un registro de entrada/salida vía API (limpieza/seguridad). */
export async function deleteEntranceExit(id: number): Promise<void> {
  const ctx = await authedApi();
  try {
    const res = await ctx.delete(`/entrances-exits/${id}`);
    if (!res.ok()) {
      throw new Error(`deleteEntranceExit falló (${res.status()}): ${await res.text()}`);
    }
  } finally {
    await ctx.dispose();
  }
}

/* ─────────── Roles (módulo /roles) ─────────────────────────────────────── */

/** Ítem del catálogo de permisos (GET /permissions). */
interface PermissionCatalogItem {
  id: number;
  pName: string;
  pDescription: string;
  pModule: string;
  pAction: string;
  pEnabled: boolean;
}

/**
 * Crea un rol desechable vía API y devuelve su id + nombre.
 * Con `permissionIds` además asigna permisos (PUT /permissions/role/:id).
 * Nota: POST /roles exige rol SUPER_ADMIN + 2FA; el token de e2e (global-setup)
 * debe cumplir ambos para que esta helper funcione.
 */
export async function createDisposableRole(
  rName: string,
  permissionIds: number[] = [],
): Promise<{ id: number; rName: string }> {
  const ctx = await authedApi();
  try {
    // Reintento con backoff si el throttler global (100 req/min) responde 429.
    const MAX_ATTEMPTS = 4;
    let res: import('@playwright/test').APIResponse;
    for (let attempt = 1; ; attempt++) {
      res = await ctx.post('/roles', { data: { rName } });
      if (res.status() !== 429 || attempt >= MAX_ATTEMPTS) break;
      await new Promise((r) => setTimeout(r, attempt * 5_000));
    }
    if (!res.ok()) {
      throw new Error(`createRole falló (${res.status()}): ${await res.text()}`);
    }
    // POST /roles devuelve la entidad Role directamente ({ id, rName }), sin wrapper.
    const body = (await res.json()) as { data?: { id?: number }; id?: number };
    const id = body?.data?.id ?? body?.id;
    if (!id) throw new Error(`createRole: respuesta sin id: ${JSON.stringify(body)}`);

    if (permissionIds.length > 0) {
      // Mismo backoff ante el throttler global (100 req/min) que en el POST.
      let permRes: import('@playwright/test').APIResponse;
      for (let attempt = 1; ; attempt++) {
        permRes = await ctx.put(`/permissions/role/${id}`, {
          data: { permissionIds },
        });
        if (permRes.status() !== 429 || attempt >= MAX_ATTEMPTS) break;
        await new Promise((r) => setTimeout(r, attempt * 5_000));
      }
      if (!permRes.ok()) {
        throw new Error(
          `setRolePermissions falló (${permRes.status()}): ${await permRes.text()}`,
        );
      }
    }
    return { id, rName };
  } finally {
    await ctx.dispose();
  }
}

/** Busca el id de un rol por nombre exacto (para limpiar lo creado por la UI). */
export async function findRoleIdByName(rName: string): Promise<number | null> {
  const ctx = await authedApi();
  try {
    const res = await ctx.get('/roles');
    if (!res.ok()) {
      throw new Error(`getRoles falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as
      | Array<{ id: number; rName: string }>
      | { data?: Array<{ id: number; rName: string }> };
    const list = Array.isArray(body) ? body : body.data ?? [];
    return list.find((r) => r.rName === rName)?.id ?? null;
  } finally {
    await ctx.dispose();
  }
}

/** Elimina un rol directamente vía API (limpieza/seguridad). */
export async function deleteRoleDirect(id: number): Promise<void> {
  const ctx = await authedApi();
  try {
    const res = await ctx.delete(`/roles/${id}`);
    if (!res.ok()) {
      throw new Error(`deleteRole falló (${res.status()}): ${await res.text()}`);
    }
  } finally {
    await ctx.dispose();
  }
}

/** Catálogo de permisos del sistema (GET /permissions). */
export async function getPermissionCatalog(): Promise<PermissionCatalogItem[]> {
  const ctx = await authedApi();
  try {
    const res = await ctx.get('/permissions');
    if (!res.ok()) {
      throw new Error(`getPermissions falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as PermissionCatalogItem[] | { data?: PermissionCatalogItem[] };
    return Array.isArray(body) ? body : body.data ?? [];
  } finally {
    await ctx.dispose();
  }
}

/** IDs de permisos otorgados a un rol (GET /permissions/role/:id). */
export async function getRolePermissionIds(roleId: number): Promise<number[]> {
  const ctx = await authedApi();
  try {
    const res = await ctx.get(`/permissions/role/${roleId}`);
    if (!res.ok()) {
      throw new Error(`getRolePermissions falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as Array<{ permissionId: number; rpGranted: boolean }>;
    return (Array.isArray(body) ? body : [])
      .filter((rp) => rp.rpGranted)
      .map((rp) => rp.permissionId);
  } finally {
    await ctx.dispose();
  }
}

/** Elimina todos los registros que coincidan con una identificación (para datos creados desde la UI). */
export async function deleteEntranceExitByIdentification(identification: string): Promise<void> {
  const ctx = await authedApi();
  try {
    const endpoints = [
      '/entrances-exits/open-entrances',
      '/entrances-exits/open-exits',
      '/entrances-exits/closed-records',
    ];
    for (const endpoint of endpoints) {
      const res = await ctx.get(endpoint);
      const body = await res.json().catch(() => []);
      const arr = Array.isArray(body) ? body : [];
      for (const rec of arr) {
        if (String(rec.eeIdentification ?? '') === identification) {
          await ctx.delete(`/entrances-exits/${rec.id}`).catch(() => undefined);
        }
      }
    }
  } finally {
    await ctx.dispose();
  }
}

/**
 * Crea un usuario desechable vía API (POST /users) y devuelve id + datos.
 * El payload cumple validateCreateUserData (rol por defecto: nurse id 4).
 */
export async function createDisposableUser(opts?: {
  uIdentification?: string;
  uName?: string;
  uFLastName?: string;
  uSLastName?: string;
  uEmail?: string;
  uPassword?: string;
  roleId?: number;
}): Promise<{ id: number; uIdentification: string; uEmail: string }> {
  const ctx = await authedApi();
  try {
    const payload = buildUserPayload(opts);

    // El backend aplica un throttler global (THROTTLE_LIMIT ?? 100 req/min).
    // Si el límite se alcanza por la concurrencia de la suite, reintentamos con backoff.
    const MAX_ATTEMPTS = 4;
    let res: import('@playwright/test').APIResponse;
    for (let attempt = 1; ; attempt++) {
      res = await ctx.post('/users', { data: payload });
      if (res.status() !== 429 || attempt >= MAX_ATTEMPTS) break;
      await new Promise((r) => setTimeout(r, attempt * 5_000));
    }
    if (!res.ok()) {
      throw new Error(`createUser falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as { id?: number; data?: { id?: number } };
    const id = body.id ?? body.data?.id;
    if (!id) throw new Error(`createUser: respuesta sin id: ${JSON.stringify(body)}`);
    return {
      id,
      uIdentification: String(payload.uIdentification),
      uEmail: String(payload.uEmail),
    };
  } finally {
    await ctx.dispose();
  }
}

/** Elimina un usuario directamente vía API (limpieza/seguridad). Soft delete en el backend. */
export async function deleteUserDirect(id: number): Promise<void> {
  const ctx = await authedApi();
  try {
    const res = await ctx.delete(`/users/${id}`);
    if (!res.ok()) {
      throw new Error(`deleteUser falló (${res.status()}): ${await res.text()}`);
    }
  } finally {
    await ctx.dispose();
  }
}

/** Busca el id de un usuario por identificación (para limpiar lo creado por la UI). */
export async function findUserIdByIdentification(
  uIdentification: string,
): Promise<number | null> {
  const ctx = await authedApi();
  try {
    const res = await ctx.get('/users');
    if (!res.ok()) {
      throw new Error(`getUsers falló (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as
      | Array<{ id: number; uIdentification?: string }>
      | { data?: Array<{ id: number; uIdentification?: string }> };
    const list = Array.isArray(body) ? body : body.data ?? [];
    return list.find((u) => String(u.uIdentification) === uIdentification)?.id ?? null;
  } finally {
    await ctx.dispose();
  }
}