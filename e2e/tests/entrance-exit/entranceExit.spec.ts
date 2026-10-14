import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  createEntranceExit,
  deleteEntranceExit,
  deleteEntranceExitByIdentification,
} from '../../support/api';
import { uniqueIdentification } from '../../support/factories';
import { RUN_DELETE_TESTS } from '../../support/config';

/**
 * CRUD y flujos del módulo Entrada y Salida.
 * Rutas: /entrance-exit (Dashboard), /entrance-exit/history (Historial),
 *        /entrance-exit/register?type=entrance y ?type=exit.
 *
 * Los tests que tocan filas crean su PROPIO registro vía API (y lo limpian al
 * final), para no depender de datos preexistentes ni de otros tests.
 * `DATA_TIMEOUT` es amplio porque el dev server de Vite compila módulos en
 * frío durante la primera carga (especialmente con tests en paralelo), y el
 * TwoFactorGuard resuelve el estado 2FA vía API antes del primer render (con
 * cola de concurrencia + retries puede superar los 12s por defecto). Por eso
 * los `heading` que siguen a cada `page.goto` usan `DATA_TIMEOUT`.
 */
const DATA_TIMEOUT = 45_000;
const TEST_TIMEOUT = 120_000;

function rowFor(page: Page, identification: string) {
  return page.locator('table tbody tr', { hasText: identification });
}

/** Espera a que el dashboard termine de cargar (aparece el resumen). */
async function waitForDashboardData(page: Page): Promise<void> {
  await expect(page.getByText(/entradas activas/)).toBeVisible({ timeout: DATA_TIMEOUT });
}

/** Botones del módulo Entradas y Salidas en el sidebar principal. */
function navButton(page: Page, name: string) {
  return page.getByRole('complementary').getByRole('button', { name, exact: true });
}

/** Fecha local en formato YYYY-MM-DD (para los inputs de tipo date). */
function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Fecha/hora local en formato YYYY-MM-DDTHH:MM (para los inputs datetime-local). */
function localDateTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${localDateString(date)}T${hours}:${minutes}`;
}

test.describe('Entrada y Salida (entrance-exit) — CRUD y flujos', () => {
  test('Dashboard: renderiza la página con sus controles principales', async ({ page }) => {
    await page.goto('/entrance-exit');
    await expect(page.getByRole('heading', { name: 'Control de Acceso' })).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(page.getByRole('main').getByRole('button', { name: 'Actualizar' })).toBeVisible();
    await expect(navButton(page, 'Dashboard')).toBeVisible();
    await expect(navButton(page, 'Historial')).toBeVisible();
    await expect(navButton(page, 'Reg. Entrada')).toBeVisible();
    await expect(navButton(page, 'Reg. Salida')).toBeVisible();
  });

  test('Navegación: los tabs del módulo enrutan correctamente', async ({ page }) => {
    await page.goto('/entrance-exit');
    await expect(page.getByRole('heading', { name: 'Control de Acceso' })).toBeVisible({ timeout: DATA_TIMEOUT });

    await navButton(page, 'Historial').click();
    await expect(page).toHaveURL(/\/entrance-exit\/history$/);
    await expect(page.getByRole('heading', { name: 'Historial de Acceso' })).toBeVisible();

    await navButton(page, 'Reg. Entrada').click();
    await expect(page).toHaveURL(/\/entrance-exit\/register\?type=entrance$/);
    await expect(page.getByRole('heading', { name: 'Registrar Entrada' })).toBeVisible({ timeout: DATA_TIMEOUT });

    await navButton(page, 'Reg. Salida').click();
    await expect(page).toHaveURL(/\/entrance-exit\/register\?type=exit$/);
    await expect(page.getByRole('heading', { name: 'Registrar Salida' })).toBeVisible();
  });

  test('Registro: una fecha anterior a un año muestra error de validación', async ({ page }) => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    await page.goto('/entrance-exit/register?type=entrance');
    await expect(page.getByRole('heading', { name: 'Registrar Entrada' })).toBeVisible({ timeout: DATA_TIMEOUT });

    await page.locator('#type').selectOption('employee');
    await page.locator('#identification').fill(uniqueIdentification());
    await page.locator('#name').fill('Persona');
    await page.locator('#firstLastName').fill('E2E');
    await page.locator('#secondLastName').fill('Entrada');
    await page.locator('#datetime').fill(localDateTimeString(twoYearsAgo));

    await page.getByRole('button', { name: 'Guardar Registro' }).click();
    await expect(page.getByText('Errores en el formulario')).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(page.getByText('Por favor corrige los errores antes de continuar')).toBeVisible();
    await page.getByRole('button', { name: 'Aceptar' }).click();

    await expect(page.getByText('La fecha no puede ser anterior a un año')).toBeVisible();
  });

  test('Registro de entrada: crea un registro desde el formulario', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    try {
      await page.goto('/entrance-exit/register?type=entrance');
      await expect(page.getByRole('heading', { name: 'Registrar Entrada' })).toBeVisible({ timeout: DATA_TIMEOUT });

      await page.locator('#type').selectOption('employee');
      await page.locator('#identification').fill(identification);
      await page.locator('#name').fill('Persona');
      await page.locator('#firstLastName').fill('E2E');
      await page.locator('#secondLastName').fill('Entrada');
      await page.locator('#datetime').fill(localDateTimeString(new Date(Date.now() - 60_000)));

      await page.getByRole('button', { name: 'Guardar Registro' }).click();
      await expect(page.getByText('¿Confirmar registro?')).toBeVisible({ timeout: DATA_TIMEOUT });
      await page.getByRole('button', { name: 'Sí, registrar' }).click();

      await expect(page.getByText('¡Registro exitoso!')).toBeVisible();
      await page.waitForURL(/\/entrance-exit$/, { timeout: DATA_TIMEOUT });
      await waitForDashboardData(page);
      await expect(rowFor(page, identification)).toHaveCount(1, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteEntranceExitByIdentification(identification).catch(() => undefined);
    }
  });

  test('Finalizar entrada: cierra el ciclo desde el dashboard', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const { id, identification } = await createEntranceExit('entrance');
    try {
      await page.goto('/entrance-exit');
      await waitForDashboardData(page);
      const row = rowFor(page, identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByRole('button', { name: 'Finalizar' }).click();
      await expect(page.getByRole('heading', { name: 'Finalizar registro' })).toBeVisible();
      await page.getByRole('button', { name: 'Aceptar' }).click();

      await expect(row).toHaveCount(0, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteEntranceExit(id).catch(() => undefined);
    }
  });

  test('Finalizar salida: cierra el ciclo desde el dashboard', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const { id, identification } = await createEntranceExit('exit');
    try {
      await page.goto('/entrance-exit');
      await waitForDashboardData(page);
      const row = rowFor(page, identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByRole('button', { name: 'Finalizar' }).click();
      await expect(page.getByRole('heading', { name: 'Finalizar registro' })).toBeVisible();
      await page.getByRole('button', { name: 'Aceptar' }).click();

      await expect(row).toHaveCount(0, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteEntranceExit(id).catch(() => undefined);
    }
  });

  test('Cierre masivo: cierra todos los registros activos', async ({ page }) => {
    test.skip(
      !RUN_DELETE_TESTS,
      'Habilita E2E_RUN_DELETE=1 en .env.e2e para ejecutar la prueba de cierre masivo (cierra registros de otros tests en paralelo)',
    );
    test.setTimeout(TEST_TIMEOUT);

    const entrance = await createEntranceExit('entrance');
    const exit = await createEntranceExit('exit');
    try {
      await page.goto('/entrance-exit');
      await waitForDashboardData(page);
      await expect(rowFor(page, entrance.identification)).toHaveCount(1, {
        timeout: DATA_TIMEOUT,
      });
      await expect(rowFor(page, exit.identification)).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await page.getByRole('button', { name: /Cerrar todos \(\d+\)/ }).click();
      await expect(page.getByRole('heading', { name: 'Cierre masivo' })).toBeVisible();
      await page.getByRole('button', { name: 'Aceptar' }).click();

      await expect(rowFor(page, entrance.identification)).toHaveCount(0, {
        timeout: DATA_TIMEOUT,
      });
      await expect(rowFor(page, exit.identification)).toHaveCount(0, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteEntranceExit(entrance.id).catch(() => undefined);
      await deleteEntranceExit(exit.id).catch(() => undefined);
    }
  });

  test('Historial: muestra un registro cerrado y permite buscarlo', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const { id, identification } = await createEntranceExit('entrance', { close: true });
    try {
      await page.goto('/entrance-exit/history');
      await expect(page.getByRole('heading', { name: 'Historial de Acceso' })).toBeVisible();

      await page.getByPlaceholder('Buscar nombre, identificación').fill(identification);
      const row = rowFor(page, identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });
      await expect(row.getByText('Entrada', { exact: true })).toBeVisible();
      await expect(row.getByText('Finalizado', { exact: true })).toBeVisible();
    } finally {
      await deleteEntranceExit(id).catch(() => undefined);
    }
  });

  test('Historial: el filtro de tipo de acceso muestra solo salidas', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const entrance = await createEntranceExit('entrance', { close: true });
    const exit = await createEntranceExit('exit', { close: true });
    try {
      await page.goto('/entrance-exit/history');

      await page.locator('select').selectOption('exit');
      await expect(rowFor(page, exit.identification)).toHaveCount(1, { timeout: DATA_TIMEOUT });
      await expect(rowFor(page, entrance.identification)).toHaveCount(0, {
        timeout: DATA_TIMEOUT,
      });
    } finally {
      await deleteEntranceExit(entrance.id).catch(() => undefined);
      await deleteEntranceExit(exit.id).catch(() => undefined);
    }
  });

  test('Historial: el rango de fechas sin coincidencias muestra vacío', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const { id, identification } = await createEntranceExit('entrance', { close: true });
    try {
      await page.goto('/entrance-exit/history');
      await page.getByPlaceholder('Buscar nombre, identificación').fill(identification);
      await expect(rowFor(page, identification)).toHaveCount(1, { timeout: DATA_TIMEOUT });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.locator('input[type="date"]').nth(0).fill(localDateString(tomorrow));

      await expect(page.getByText('Sin resultados para los filtros aplicados')).toBeVisible({
        timeout: DATA_TIMEOUT,
      });
    } finally {
      await deleteEntranceExit(id).catch(() => undefined);
    }
  });

  test('Historial: limpiar filtros restaura la lista', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const { id, identification } = await createEntranceExit('entrance', { close: true });
    try {
      await page.goto('/entrance-exit/history');
      await page.getByPlaceholder('Buscar nombre, identificación').fill(identification);
      await expect(rowFor(page, identification)).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
      await expect(page.getByPlaceholder('Buscar nombre, identificación')).toHaveValue('');
      await expect(rowFor(page, identification)).toHaveCount(1);
    } finally {
      await deleteEntranceExit(id).catch(() => undefined);
    }
  });
});
