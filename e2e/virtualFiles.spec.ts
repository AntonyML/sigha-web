import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createDisposableRecord, deleteRecordDirect } from './helpers';

/**
 * CRUD del módulo Expedientes (Fichas virtuales).
 * Rutas: /virtualFiles (lista), /virtualFiles/create, /virtualFiles/edit/:id,
 *        /virtualFiles/view/:id. El borrado vía UI borra un expediente creado
 *        por el propio test a través de la API (E2E_RUN_DELETE=1 en .env.e2e).
 */

function firstRow(page: Page) {
  return page.locator('table tbody tr').first();
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
    await page.getByPlaceholder('Buscar por nombre o cédula…').fill('zzzz-0000-no-existe');
    await expect(page.getByText('Sin resultados para los filtros aplicados')).toBeVisible();
  });

  test('Crear: navega al formulario "Nuevo expediente"', async ({ page }) => {
    await page.getByRole('button', { name: /Nueva ficha/ }).click();
    await expect(page).toHaveURL(/\/virtualFiles\/create$/);
    await expect(page.getByRole('heading', { name: 'Nuevo expediente' })).toBeVisible();
  });

  test('Editar: abre el formulario de edición del primer expediente', async ({ page }) => {
    const row = firstRow(page);
    await expect(row).toHaveCount(1, { timeout: 15_000 });
    await row.getByTitle('Editar').click();
    await expect(page).toHaveURL(/\/virtualFiles\/edit\/\d+$/);
    await expect(page.getByRole('heading', { name: 'Editar expediente' })).toBeVisible();
  });

  test('Ver: abre la vista de detalle del primer expediente', async ({ page }) => {
    const row = firstRow(page);
    await expect(row).toHaveCount(1, { timeout: 15_000 });
    await row.getByTitle('Ver expediente').click();
    await expect(page).toHaveURL(/\/virtualFiles\/view\/\d+$/);
    await expect(page.getByRole('heading', { name: /Expediente #/ })).toBeVisible();
  });

  test('Borrar: cancelar mantiene el expediente en la lista', async ({ page }) => {
    const row = firstRow(page);
    await expect(row).toHaveCount(1, { timeout: 15_000 });
    const name = (await row.locator('td').nth(1).innerText()).trim();

    await row.getByTitle('Eliminar').click();
    await expect(page.getByRole('heading', { name: 'Eliminar expediente' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.locator('table tbody tr').first()).toContainText(name);
  });

  test('Borrar: confirma y elimina un expediente creado por el test', async ({ page }) => {
    test.skip(
      process.env.E2E_RUN_DELETE !== '1',
      'Habilita E2E_RUN_DELETE=1 en .env.e2e para ejecutar la prueba destructiva',
    );

    const { id, identification } = await createDisposableRecord();
    try {
      await page.goto('/virtualFiles');
      await page.getByPlaceholder('Buscar por nombre o cédula…').fill(identification);
      const row = page.locator('table tbody tr', { hasText: identification });
      await expect(row).toHaveCount(1, { timeout: 15_000 });

      await row.getByTitle('Eliminar').click();
      await expect(page.getByRole('heading', { name: 'Eliminar expediente' })).toBeVisible();
      await page.getByRole('button', { name: 'Aceptar' }).click();

      await expect(page.locator('table tbody tr', { hasText: identification })).toHaveCount(0, {
        timeout: 15_000,
      });
    } finally {
      // Limpieza de seguridad: nunca dejar expedientes huérfanos.
      await deleteRecordDirect(id).catch(() => undefined);
    }
  });
});