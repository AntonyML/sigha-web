import { config as loadEnv } from 'dotenv';
import { request } from '@playwright/test';
import type { FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createInterface } from 'node:readline';

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
type AuthBody = {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  requiresTwoFactor?: boolean;
  tempToken?: string;
};

/** Replica la normalización que hace el frontend en authService.login(). */
function enrichUser(token: string, rawUser: User): User {
  const payload = decodeJwtPayload(token);
  const roleIds = Array.isArray(payload?.roleIds) ? payload.roleIds : [];
  const rawRoles = Array.isArray(rawUser.roles) ? (rawUser.roles as string[]) : [];
  const roles = rawRoles.length > 0
    ? rawRoles
    : Array.isArray(payload?.roles) ? (payload.roles as string[]) : [];
  return { ...rawUser, roleIds, roles };
}

function askForTwoFactorCode(email: string, promptHint?: string): Promise<string> {
  const preProvided = process.env.E2E_2FA_CODE;
  if (preProvided) {
    return Promise.resolve(preProvided.trim());
  }

  if (!process.stdin.isTTY) {
    return Promise.reject(
      new Error(
        'El usuario requiere 2FA y no se proporcionó E2E_2FA_CODE.\n' +
          'Ejecuta los tests desde una terminal o setea E2E_2FA_CODE en .env.e2e con el código vigente.',
      ),
    );
  }

  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      `El usuario "${email}" exige 2FA.\n` +
        `   Abre tu app autenticadora y escribe el código de 6 dígitos [${promptHint ?? ''}]: `,
      (code) => {
        rl.close();
        resolve(code.trim());
      },
    );
  });
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
  let body: AuthBody;

  const loginRes = await ctx.post('/auth/login', {
    data: { uEmail: email, uPassword: password },
  });
  body = (await loginRes.json().catch(() => ({}))) as AuthBody;
  if (!loginRes.ok() || !body.user) {
    throw new Error(
      `Login e2e fallido (${loginRes.status()}): ${JSON.stringify(body)}.\n` +
        'Revisa E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD en .env.e2e.',
    );
  }

  // Si el usuario exige 2FA, completamos el login pidiendo el código vigente.
  if (body.requiresTwoFactor) {
    if (!body.tempToken) {
      throw new Error(`Login e2e requirió 2FA pero no devolvió tempToken: ${JSON.stringify(body)}`);
    }
    const twoFactorCode = await askForTwoFactorCode(email);
    if (!/^\d{6}$/.test(twoFactorCode)) {
      throw new Error(`E2E_2FA_CODE debe ser de 6 dígitos. Recibido: "${twoFactorCode}".`);
    }
    const verifyRes = await ctx.post('/auth/verify-2fa', {
      data: { tempToken: body.tempToken, twoFactorCode },
    });
    body = (await verifyRes.json().catch(() => ({}))) as AuthBody;
    if (!verifyRes.ok() || !body.accessToken || !body.user) {
      throw new Error(
        `Verificación 2FA fallida (${verifyRes.status()}): ${JSON.stringify(body)}.\n` +
          'Revisa que el código sea el vigente de tu app de autenticación.',
      );
    }
  }

  await ctx.dispose();

  if (!body.accessToken || !body.user) {
    throw new Error(`Login e2e no devolvió accessToken: ${JSON.stringify(body)}`);
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