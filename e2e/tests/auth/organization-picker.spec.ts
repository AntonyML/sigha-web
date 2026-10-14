import { test, expect } from '@playwright/test';
import { OrganizationPickerPage } from '../../pages/OrganizationPickerPage';

test.describe('Selección de organización', () => {
  test('muestra únicamente las organizaciones autorizadas por la API', async ({ page }) => {
    await page.route('**/auth/organizations', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 12, name: 'Hogar Norte', slug: 'hogar-norte', logoUrl: null, isPrimary: true },
        { id: 34, name: 'Hogar Sur', slug: 'hogar-sur', logoUrl: null, isPrimary: false },
      ]),
    }))
    const picker = new OrganizationPickerPage(page);
    await picker.goto();

    await expect(picker.heading).toBeVisible();
    await expect(picker.organizationOptions.first()).toBeVisible();
    await expect(picker.continueButton).toBeDisabled();
  });

  test('no permite continuar si el usuario no tiene una organización asignada', async ({ page }) => {
    await page.route('**/auth/organizations', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }))
    const picker = new OrganizationPickerPage(page);
    await picker.goto();

    await expect(picker.noOrganizationMessage).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toHaveCount(0);
  });
});
