import { expect, test } from '@playwright/test';

test('auditoría administrativa permite filtrar y consultar cambios en modo lectura', async ({ page }) => {
  await page.goto('/system-audit-logs');
  await expect(page.getByRole('heading', { name: 'Auditoría administrativa' })).toBeVisible();
  await expect(page.getByRole('form', { name: 'Filtros de auditoría administrativa' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cambios registrados' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Editar|Eliminar|Guardar/ })).toHaveCount(0);

  await page.getByLabel('Acción').selectOption('UPDATE');
  await page.getByLabel('Tabla').fill('care_programs');
  await page.getByRole('button', { name: 'Filtrar' }).click();
  await expect(page.getByText('care_programs')).toBeVisible({ timeout: 45_000 }).catch(async () => {
    await expect(page.getByText('No hay cambios que coincidan con los filtros.')).toBeVisible();
  });
});
