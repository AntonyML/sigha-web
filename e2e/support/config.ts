/** Acceso centralizado a la configuración de los tests e2e (cargada desde .env.e2e). */
import { setDefaultResultOrder } from 'node:dns';

// La API local escucha en IPv4; evita ECONNREFUSED ::1 en los workers
// (mismo arreglo que en global-setup.ts).
setDefaultResultOrder('ipv4first');

export const WEB_URL = process.env.E2E_WEB_URL ?? 'http://localhost:3001';
export const API_URL = process.env.E2E_API_URL ?? 'http://127.0.0.1:3000';

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? '';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '';

/** Habilita la prueba destructiva de borrado (ver tests/virtual-files). */
export const RUN_DELETE_TESTS = process.env.E2E_RUN_DELETE === '1';

export function requireAdminCredentials(): { email: string; password: string } {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'Faltan E2E_ADMIN_EMAIL y/o E2E_ADMIN_PASSWORD en .env.e2e.\n' +
        'Copia .env.e2e.example a .env.e2e y completa las credenciales.',
    );
  }
  return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
}
