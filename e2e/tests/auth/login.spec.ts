import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
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
    await expect(login.subtitle).toBeVisible();
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

    // Salir del login implica autenticarse; según la cuenta puede terminar en
    // dashboard (sin 2FA) o en /auth/verify-2fa (con 2FA). Ambas guardan sesión.
    await expect(login.submitButton).toBeHidden({ timeout: 20_000 });
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    const tempToken = await page.evaluate(() => localStorage.getItem('tempToken'));
    expect(authToken || tempToken).toBeTruthy();
    expect(new URL(page.url()).pathname).not.toBe('/login');
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