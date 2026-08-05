import { config as loadEnv } from 'dotenv';
import { request } from '@playwright/test';
import type { FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { createInterface } from 'node:readline';
import { setDefaultResultOrder } from 'node:dns';

loadEnv({ path: '.env.e2e' });

// La API local escucha en IPv4 (0.0.0.0); en Windows Node resuelve 'localhost'
// a ::1 primero y el global-setup fallaba con ECONNREFUSED ::1:3000.
setDefaultResultOrder('ipv4first');

const STORAGE_STATE_PATH = 'e2e/.auth/user.json';
const MAX_2FA_ATTEMPTS = 5;

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

/**
 * Pide un código 2FA una vez. Devuelve `null` si el usuario aborta (teclea
 * "quit", "q", deja vacío, o no hay TTY sin E2E_2FA_CODE pre-cargado).
 */
function promptForCode(email: string, attempt: number): Promise<string | null> {
  if (attempt === 1) {
    const preProvided = process.env.E2E_2FA_CODE;
    if (preProvided) return Promise.resolve(preProvided.trim());
  }

  if (!process.stdin.isTTY) {
    if (attempt === 1) {
      process.stderr.write(
        'El usuario requiere 2FA y no se proporcionó E2E_2FA_CODE.\n' +
          'Ejecuta los tests desde una terminal, o setea E2E_2FA_CODE en .env.e2e con un código vigente.\n',
      );
    }
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      `\nCódigo 2FA actual de "${email}" (6 dígitos; escribe "quit" para abortar) [intento ${attempt}/${MAX_2FA_ATTEMPTS}]: `,
      (code) => {
        rl.close();
        const t = code.trim().toLowerCase();
        resolve(t === '' || t === 'quit' || t === 'q' ? null : code.trim());
      },
    );
  });
}

/** Reutiliza un token existente si sigue válido (evita digitar el 2FA cada run). */
async function tryReuseSession(): Promise<AuthBody | null> {
  if (process.env.E2E_REUSE_SESSION === '0') return null;
  if (!existsSync(STORAGE_STATE_PATH)) return null;

  const saved = JSON.parse(readFileSync(STORAGE_STATE_PATH, 'utf-8')) as {
    origins?: Array<{ localStorage?: Array<{ name: string; value: string }> }>;
  };
  const ls = saved.origins?.[0]?.localStorage ?? [];
  const get = (name: string) => ls.find((i) => i.name === name)?.value ?? '';

  const authToken = get('authToken');
  if (!authToken) return null;

  const check = await request.newContext({
    baseURL: process.env.E2E_API_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: { Authorization: `Bearer ${authToken}` },
  });
  let user: User | null = null;
  try {
    const res = await check.get('/auth/profile');
    if (res.ok()) {
      const profile = (await res.json()) as { user?: User };
      user = profile.user ?? null;
    }
  } finally {
    await check.dispose();
  }
  if (!user) return null;

  return {
    accessToken: authToken,
    refreshToken: get('refreshToken') || undefined,
    user,
  };
}

function writeState(body: AuthBody, origin: string): void {
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

  // 1) Intentar reutilizar una sesión aún válida (sin digitar 2FA).
  const reused = await tryReuseSession();
  const ctx = await request.newContext({ baseURL: apiURL });
  let body: AuthBody | null = reused;

  // Si no hay sesión reusable, hacer login completo (con loop de 2FA).
  if (!body) {
    const loginRes = await ctx.post('/auth/login', {
      data: { uEmail: email, uPassword: password },
    });
    const loginBody = (await loginRes.json().catch(() => ({}))) as AuthBody;
    if (!loginRes.ok() || !loginBody.user) {
      await ctx.dispose();
      throw new Error(
        `Login e2e fallido (${loginRes.status()}): ${JSON.stringify(loginBody)}.\n` +
          'Revisa E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD en .env.e2e.',
      );
    }
    body = loginBody;

    // 2FA: reintenta hasta que el código sea correcto o el usuario aborta.
    if (body.requiresTwoFactor) {
      if (!body.tempToken) {
        throw new Error(`Login e2e requirió 2FA pero no devolvió tempToken: ${JSON.stringify(body)}`);
      }
      let verified: AuthBody | null = null;
      for (let attempt = 1; attempt <= MAX_2FA_ATTEMPTS; attempt++) {
        const code = await promptForCode(email, attempt);
        if (!code) {
          break;
        }
        if (!/^\d{6}$/.test(code)) {
          console.log(`  (El código "${code}" no tiene 6 dígitos. Inténtalo de nuevo.)`);
          continue;
        }
        const verifyRes = await ctx.post('/auth/verify-2fa', {
          data: { tempToken: body.tempToken, twoFactorCode: code },
        });
        const vBody = (await verifyRes.json().catch(() => ({}))) as AuthBody;
        if (verifyRes.ok() && vBody.accessToken && vBody.user) {
          verified = vBody;
          break;
        }
        console.log('  (Código 2FA incorrecto o expirado. Inténtalo de nuevo.)');
      }
      if (!verified) {
        await ctx.dispose();
        throw new Error(
          'No se pudo completar el 2FA (código incorrecto/abortado). Abortando la ejecución.',
        );
      }
      body = verified;
    }
  }

  await ctx.dispose();
  writeState(body, origin);
}