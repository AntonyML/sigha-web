import { request } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { API_URL } from './config';

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
