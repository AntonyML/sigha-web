import { config as loadEnv } from 'dotenv';
import { request } from '@playwright/test';
import type { FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

loadEnv({ path: '.env.e2e' });

const STORAGE_STATE_PATH = 'e2e/.auth/user.json';

interface JwtPayload {
  sub?: number;
  email?: string;
  roleIds?: number[];
  roles?: string[];
  [key: string]: unknown;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

type User = Record<string, unknown>;

/**
 * Replica la normalización que hace el frontend en authService.login():
 * los roles autoritativos vienen del JWT (roleIds / roles).
 */
function enrichUser(token: string, rawUser: User): User {
  const payload = decodeJwtPayload(token);
  const roleIds = Array.isArray(payload?.roleIds) ? payload.roleIds : [];
  const rawRoles = Array.isArray(rawUser.roles) ? (rawUser.roles as string[]) : [];
  const roles = rawRoles.length > 0
    ? rawRoles
    : Array.isArray(payload?.roles) ? (payload.roles as string[]) : [];

  return { ...rawUser, roleIds, roles };
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Faltan E2E_ADMIN_EMAIL y/o E2E_ADMIN_PASSWORD.\n' +
        'Copia .env.e2e.example a .env.e2e y completa las credenciales.',
    );
  }

  const apiURL = process.env.E2E_API_URL ?? 'http://localhost:3000';
  const origin = config.projects[0].use.baseURL ?? 'http://localhost:5173';

  const ctx = await request.newContext({ baseURL: apiURL });
  const res = await ctx.post('/auth/login', {
    data: { uEmail: email, uPassword: password },
  });
  const body = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  };
  await ctx.dispose();

  if (!res.ok() || !body.accessToken || !body.user) {
    throw new Error(
      `Login e2e fallido (${res.status()}): ${JSON.stringify(body)}.\n` +
        'Revisa E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD en .env.e2e.',
    );
  }

  const state = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [
          { name: 'authToken', value: body.accessToken },
          { name: 'refreshToken', value: body.refreshToken ?? '' },
          { name: 'user', value: JSON.stringify(enrichUser(body.accessToken, body.user)) },
        ],
      },
    ],
  };

  mkdirSync(dirname(STORAGE_STATE_PATH), { recursive: true });
  writeFileSync(STORAGE_STATE_PATH, JSON.stringify(state, null, 2));
}