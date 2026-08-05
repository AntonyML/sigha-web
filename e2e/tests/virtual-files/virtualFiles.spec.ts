import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createDisposableRecord, deleteRecordDirect } from '../../support/api';
import { RUN_DELETE_TESTS } from '../../support/config';

/**
 * CRUD del módulo Expedientes (Fichas virtuales).
 * Rutas: /virtualFiles (lista), /virtualFiles/create, /virtualFiles/edit/:id,
 *        /virtualFiles/view/:id.
 *
 * Los tests que tocan filas crean su PROPIO expediente vía API (y lo limpian
 * al final), para no depender de datos preexistentes ni de otros tests.
 * `DATA_TIMEOUT` es amplio porque el dev server de Vite compila módulos en
 * frío durante la primera carga (especialmente con tests en paralelo).
 */
const DATA_TIMEOUT = 45_000;
const TEST_TIMEOUT = 120_000;

function rowFor(page: Page, identification: string) {
  return page.locator('table tbody tr', { hasText: identification });
}

/** Espera a que el listado termine de cargar datos (aparece el contador). */
async function waitForListData(page: Page): Promise<void> {
  await expect(page.getByText(/expediente[s]? registrado[s]?/)).toBeVisible({ timeout: DATA_TIMEOUT });
}

test.describe('Expedientes (virtualFiles) — CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/virtualFiles');
  });

  test('Lista: renderiza la página con sus controles principales', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Fichas virtuales' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Nueva ficha/ })).toBeVisible();
    await expect(page.getByPlaceholder('Buscar por nombre o cédula…')).toBeVisible();
  });

  test('Lista: una búsqueda sin coincidencias muestra el estado vacío', async ({ page }) => {
    await waitForListData(page);
    await page.getByPlaceholder('Buscar por nombre o cédula…').fill('zzzz-0000-no-existe');
    await expect(page.getByText('Sin resultados para los filtros aplicados')).toBeVisible();
  });

  test('Crear: navega al formulario "Nuevo expediente"', async ({ page }) => {
    await page.getByRole('button', { name: /Nueva ficha/ }).click();
    await expect(page).toHaveURL(/\/virtualFiles\/create$/);
    await expect(page.getByRole('heading', { name: 'Nuevo expediente' })).toBeVisible();
  });

  test('Editar: abre el formulario de edición de un expediente', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const { id, identification } = await createDisposableRecord();
    try {
      await page.goto('/virtualFiles');
      await page.getByPlaceholder('Buscar por nombre o cédula…').fill(identification);
      const row = rowFor(page, identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });
      await row.getByTitle('Editar').click();
      await expect(page).toHaveURL(/\/virtualFiles\/edit\/\d+$/);
      await expect(page.getByRole('heading', { name: 'Editar expediente' })).toBeVisible();
    } finally {
      await deleteRecordDirect(id).catch(() => undefined);
    }
  });

  test('Ver: abre la vista de detalle de un expediente', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const { id, identification } = await createDisposableRecord();
    try {
      await page.goto('/virtualFiles');
      await page.getByPlaceholder('Buscar por nombre o cédula…').fill(identification);
      const row = rowFor(page, identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });
      await row.getByTitle('Ver expediente').click();
      await expect(page).toHaveURL(/\/virtualFiles\/view\/\d+$/);
      await expect(page.getByRole('heading', { name: /Expediente #/ })).toBeVisible();
    } finally {
      await deleteRecordDirect(id).catch(() => undefined);
    }
  });

  test('Borrar: cancelar mantiene el expediente en la lista', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const { id, identification } = await createDisposableRecord();
    try {
      await page.goto('/virtualFiles');
      await page.getByPlaceholder('Buscar por nombre o cédula…').fill(identification);
      const row = rowFor(page, identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Eliminar').click();
      await expect(page.getByRole('heading', { name: 'Eliminar expediente' })).toBeVisible();
      await page.getByRole('button', { name: 'Cancelar' }).click();

      await expect(rowFor(page, identification)).toHaveCount(1);
    } finally {
      await deleteRecordDirect(id).catch(() => undefined);
    }
  });

  test('Borrar: confirma y elimina un expediente creado por el test', async ({ page }) => {
    test.skip(
      !RUN_DELETE_TESTS,
      'Habilita E2E_RUN_DELETE=1 en .env.e2e para ejecutar la prueba destructiva',
    );
    test.setTimeout(TEST_TIMEOUT);

    const { id, identification } = await createDisposableRecord();
    try {
      await page.goto('/virtualFiles');
      await page.getByPlaceholder('Buscar por nombre o cédula…').fill(identification);
      const row = rowFor(page, identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Eliminar').click();
      await expect(page.getByRole('heading', { name: 'Eliminar expediente' })).toBeVisible();
      await page.getByRole('button', { name: 'Aceptar' }).click();

      await expect(rowFor(page, identification)).toHaveCount(0, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteRecordDirect(id).catch(() => undefined);
    }
  });
});
