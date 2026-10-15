import { expect, test } from '@playwright/test';

const DATA_TIMEOUT = 45_000;

test.describe('Entradas y salidas con access_logs', () => {
  test('muestra los movimientos recientes y conserva separados los movimientos clínicos', async ({ page }) => {
    await page.goto('/entrance-exit');
    await expect(page.getByRole('heading', { name: 'Entradas y salidas' })).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(page.getByRole('heading', { name: 'Actividad reciente' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrar salida' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrar regreso' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrar visita' })).toBeVisible();
  });

  test('navega a historial y permite abrir el registro de visita', async ({ page }) => {
    await page.goto('/entrance-exit');
    await expect(page.getByRole('heading', { name: 'Entradas y salidas' })).toBeVisible({ timeout: DATA_TIMEOUT });

    await page.getByRole('button', { name: 'Ver historial' }).click();
    await expect(page).toHaveURL(/\/entrance-exit\/history$/);
    await expect(page.getByRole('heading', { name: 'Historial de entradas, salidas y visitas' })).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(page.getByRole('form', { name: 'Filtros del historial de accesos' })).toBeVisible();

    await page.getByRole('button', { name: 'Registrar movimiento' }).click();
    await expect(page).toHaveURL(/\/entrance-exit\/register\?type=exit$/);
    await page.locator('#access-event-type').selectOption('visit');
    await expect(page.getByLabel('Nombre del visitante')).toBeVisible();
  });

  test('la ruta admite entrada histórica mediante evento de regreso sin cerrar ni borrar registros', async ({ page }) => {
    await page.goto('/entrance-exit/register?type=entrance');
    await expect(page.getByRole('heading', { name: 'Registro de acceso' })).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(page.locator('#access-event-type')).toHaveValue('return');
    await expect(page.getByText('Cada movimiento se agrega al historial y no se edita ni se elimina.')).toBeVisible();
  });
});
