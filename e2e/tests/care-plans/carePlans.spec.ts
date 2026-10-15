import { expect, test } from '@playwright/test';

test('planes de cuidado expone inscripción, evaluación clínica y seguimiento', async ({ page }) => {
  await page.goto('/care-plans');
  await expect(page.getByRole('heading', { name: 'Planes de cuidado' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inscribir residente' })).toBeVisible();
  await expect(page.getByLabel('Evaluación clínica asociada')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Seguimiento de residentes' })).toBeVisible();

  await page.getByRole('button', { name: 'Programas de cuidado' }).click();
  await expect(page.getByRole('heading', { name: 'Programas y subprogramas activos' })).toBeVisible();
});
