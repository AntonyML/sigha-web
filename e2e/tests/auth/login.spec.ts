import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { OrganizationPickerPage } from '../../pages/OrganizationPickerPage';
import { requireAdminCredentials } from '../../support/config';

/**
 * Autenticación — /login
 *
 * Importante: estos tests arrancan SIN sesión (storageState vacío), porque
 * el objetivo es probar el formulario de login real, independiente del
 * global-setup que deja al resto de la suite autenticada.
 */
test.describe('Autenticación (/login)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('renderiza el formulario con sus elementos clave', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.title).toBeVisible();
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();
    await expect(login.forgotPasswordButton).toBeVisible();
    await expect(login.createUserButton).toBeVisible();
  });

  test('validación: envío con campos vacíos muestra el error propio de la app', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    // Desactiva la validación nativa del navegador (required/type) para llegar
    // a la validación propia de la app (authFlow.validateLoginCredentials).
    await login.page.evaluate(() => {
      const form = document.querySelector('form');
      form?.setAttribute('novalidate', '');
    });
    await login.submit();

    await expect(login.errorAlert).toContainText('Por favor ingrese email y contraseña');
  });

  test('credenciales incorrectas muestran un mensaje de error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.login('usuario-inexistente@example.com', 'contraseña-incorrecta');

    await expect(login.errorAlert).toBeVisible();
    await expect(login.submitButton).toBeEnabled();
  });

  test('credenciales válidas: persiste la sesión y abandona el login', async ({ page }) => {
    const { email, password } = requireAdminCredentials();
    const login = new LoginPage(page);
    await login.goto();

    await login.login(email, password);

    // El login con 2FA tarda ~4s y hasta que responde el botón muestra
    // "Iniciando sesión..." (cambia su nombre). El gate correcto es esperar a
    // abandonar /login, no a que el botón "Entrar" desaparezca a mitad del POST.
    const destination = await login.waitForPostLoginDestination();
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    const tempToken = await page.evaluate(() => localStorage.getItem('tempToken'));
    expect(authToken || tempToken).toBeTruthy();
    expect(['/auth/verify-2fa', '/seleccionar-organizacion', '/dashboard']).toContain(destination);
  });

  test('login con 2FA: completa el código de 6 dígitos y aterriza en /dashboard', async ({ page }) => {
    test.skip(
      !process.env.E2E_2FA_CODE,
      'Requiere E2E_2FA_CODE (código vigente de la app autenticadora) para completar el 2FA de forma no interactiva',
    );

    const { email, password } = requireAdminCredentials();
    const login = new LoginPage(page);
    await login.goto();

    await login.login(email, password);

    // Salir de /login (con 2FA llega a /auth/verify-2fa).
    const destination = await login.waitForPostLoginDestination();

    // Si la cuenta exige 2FA, completar el código.
    if (destination === '/auth/verify-2fa') {
      const codeInput = page.getByLabel('Código de Verificación');
      await expect(codeInput).toBeVisible({ timeout: 15_000 });
      await codeInput.fill(process.env.E2E_2FA_CODE!);
      await page.getByRole('button', { name: 'Verificar Código' }).click();
    }

    const organizationPicker = new OrganizationPickerPage(page);
    await organizationPicker.continueWithFirstOrganizationIfVisible();

    // Tras el login + 2FA, se elige organización si hay varias y luego se abre
    // el dashboard (sin perder la protección del guard de 2FA).
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
  });

  test('navega a la recuperación de contraseña', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.forgotPasswordButton.click();
    await expect(page).toHaveURL(/\/auth\/forgot-password$/);
  });

  test('navega a la creación de usuario', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.createUserButton.click();
    await expect(page).toHaveURL(/\/auth\/create-user$/);
  });
});
