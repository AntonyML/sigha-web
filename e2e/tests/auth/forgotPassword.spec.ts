import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { RecoveryVerifyPage } from '../../pages/RecoveryVerifyPage';
import { RecoveryResetPage } from '../../pages/RecoveryResetPage';

/**
 * Recuperación de contraseña — flujo completo de 3 pasos:
 *   /auth/forgot-password (solicitud) → /auth/recovery/verify (código) → /auth/recovery/reset (cambio).
 *
 * Los tests arrancan SIN sesión (storageState vacío), igual que login.spec.ts.
 *
 * Nota sobre los datos reales: el código de 8 dígitos viaja por email y no es
 * accesible desde los tests; la página de verificación solo valida el formato,
 * así que el flujo avanza con cualquier código de 8 dígitos. El cambio de
 * contraseña con backend real rechaza tokens inexistentes ("Token inválido o
 * expirado"); para probar el éxito completo se simula la respuesta de la API
 * con page.route().
 */
const EMAIL_INEXISTENTE = `usuario-e2e-${Date.now()}@example.com`;

/**
 * Predicado de ruta para mockear SOLO la API NestJS.
 * El navegador llama a VITE_API_URL (por defecto http://localhost:3000),
 * mientras que E2E_API_URL (http://127.0.0.1:3000) solo aplica a las llamadas
 * directas de Node (IPv4). page.route() matchea por dominio exacto, así que un
 * glob con doble asterisco también interceptaría la ruta SPA
 * /auth/forgot-password del frontend (puerto 5173). Este predicado ancla el
 * match al puerto 3000 + pathname + método, sin tocar el SPA.
 */
function apiRoute(path: string) {
  return (url: URL): boolean => url.port === '3000' && url.pathname === path;
}

/**
 * Simula una respuesta exitosa de POST /auth/forgot-password.
 */
async function mockForgotPasswordSuccess(page: Page): Promise<void> {
  await page.route(apiRoute('/auth/forgot-password'), (route) =>
    route.fulfill({ json: { message: 'Código de recuperación enviado al email' } }),
  );
}

/** Llega a /auth/recovery/verify siguiendo el flujo real de la UI. */
async function reachVerifyPage(page: Page, email: string): Promise<void> {
  const forgot = new ForgotPasswordPage(page);
  await forgot.goto();
  await forgot.requestRecovery(email);
  await expect(page).toHaveURL(/\/auth\/recovery\/verify$/, { timeout: 15_000 });
}

/** Pre-carga recovery_email/recovery_token para probar /auth/recovery/reset en aislamiento. */
async function presetRecoverySession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.setItem('recovery_email', 'usuario@example.com');
    sessionStorage.setItem('recovery_token', '12345678');
  });
}

test.describe('Recuperación de contraseña', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.describe('Paso 1 — solicitud (/auth/forgot-password)', () => {
    test('renderiza el formulario con sus elementos clave', async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.goto();

      await expect(forgot.title).toBeVisible();
      await expect(forgot.description).toBeVisible();
      await expect(forgot.emailInput).toBeVisible();
      await expect(forgot.submitButton).toBeVisible();
      await expect(forgot.backButton).toBeVisible();
    });

    test('validación: envío con email vacío muestra el error de la app', async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.goto();

      // Desactiva la validación nativa del navegador (required/type) para llegar
      // a la validación propia de la app (passwordRecoveryFlow).
      await forgot.page.evaluate(() => {
        document.querySelector('form')?.setAttribute('novalidate', '');
      });
      await forgot.submitButton.click();

      await expect(forgot.alert).toContainText('Por favor ingrese su email');
    });

    test('validación: email con formato inválido muestra el error de la app', async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.goto();

      await forgot.page.evaluate(() => {
        document.querySelector('form')?.setAttribute('novalidate', '');
      });
      await forgot.emailInput.fill('correo-sin-formato');
      await forgot.submitButton.click();

      await expect(forgot.alert).toContainText('El email no tiene un formato válido.');
    });

    test('email inexistente: no revela la existencia y navega a la verificación', async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.goto();

      await forgot.requestRecovery(EMAIL_INEXISTENTE);

      // Por seguridad el backend responde un mensaje genérico sin revelar si el email existe.
      await expect(forgot.alert).toContainText(/se ha enviado un código de recuperación/i, {
        timeout: 15_000,
      });
      await expect(page).toHaveURL(/\/auth\/recovery\/verify$/, { timeout: 15_000 });
    });

    test('navega al login con el botón volver', async ({ page }) => {
      const forgot = new ForgotPasswordPage(page);
      await forgot.goto();

      await forgot.backButton.click();
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test.describe('Paso 2 — verificación (/auth/recovery/verify)', () => {
    test('acceso directo sin email en estado: redirige a la solicitud', async ({ page }) => {
      await page.goto('/auth/recovery/verify');
      await expect(page).toHaveURL(/\/auth\/forgot-password$/);
    });

    test('el botón verificar permanece deshabilitado hasta completar los 8 dígitos', async ({ page }) => {
      await mockForgotPasswordSuccess(page);
      await reachVerifyPage(page, 'verificar@example.com');
      const verify = new RecoveryVerifyPage(page);

      await expect(verify.submitButton).toBeDisabled();
      await verify.part1Input.fill('1234');
      await expect(verify.submitButton).toBeDisabled();
      await verify.part2Input.fill('5678');
      await expect(verify.submitButton).toBeEnabled();
    });

    test('al completar el primer bloque de 4 dígitos el foco pasa al segundo', async ({ page }) => {
      await mockForgotPasswordSuccess(page);
      await reachVerifyPage(page, 'foco@example.com');
      const verify = new RecoveryVerifyPage(page);

      await verify.part1Input.fill('1234');
      await expect(verify.part2Input).toBeFocused();
    });

    test('pegar un código de 8 dígitos completa ambos campos', async ({ page, browserName }) => {
      // Firefox ignora clipboardData en ClipboardEvent sintéticos (limitación del navegador).
      test.skip(browserName === 'firefox', 'El evento paste sintético no se puede reproducir en Firefox');
      await mockForgotPasswordSuccess(page);
      await reachVerifyPage(page, 'pegar@example.com');
      const verify = new RecoveryVerifyPage(page);

      // Dispara el onPaste del componente con clipboardData (sin depender del portapapeles del SO).
      await verify.part1Input.evaluate((el) => {
        const dt = new DataTransfer();
        dt.setData('text/plain', '12345678');
        el.dispatchEvent(
          new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
        );
      });

      await expect(verify.part1Input).toHaveValue('1234');
      await expect(verify.part2Input).toHaveValue('5678');
      await expect(verify.submitButton).toBeEnabled();
    });

    test('código válido: guarda el token y navega al cambio de contraseña', async ({ page }) => {
      await mockForgotPasswordSuccess(page);
      await reachVerifyPage(page, 'codigo@example.com');
      const verify = new RecoveryVerifyPage(page);

      await verify.fillCode('12345678');
      await verify.submit();

      await expect(page).toHaveURL(/\/auth\/recovery\/reset$/, { timeout: 15_000 });
      const token = await page.evaluate(() => sessionStorage.getItem('recovery_token'));
      expect(token).toBe('12345678');
    });

    test('el botón volver regresa a la solicitud', async ({ page }) => {
      await mockForgotPasswordSuccess(page);
      await reachVerifyPage(page, 'volver@example.com');
      const verify = new RecoveryVerifyPage(page);

      await verify.backButton.click();
      await expect(page).toHaveURL(/\/auth\/forgot-password$/);
    });
  });

  test.describe('Paso 3 — cambio de contraseña (/auth/recovery/reset)', () => {
    test('acceso directo sin token en sesión: redirige a la solicitud', async ({ page }) => {
      await page.goto('/auth/recovery/reset');
      await expect(page).toHaveURL(/\/auth\/forgot-password$/);
    });

    test('validación: envío con campos vacíos muestra el error de la app', async ({ page }) => {
      await presetRecoverySession(page);
      await page.goto('/auth/recovery/reset');
      const reset = new RecoveryResetPage(page);

      await reset.page.evaluate(() => {
        document.querySelector('form')?.setAttribute('novalidate', '');
      });
      await reset.submit();

      await expect(reset.alert).toContainText('Por favor complete todos los campos');
    });

    test('validación: contraseñas que no coinciden muestran el error', async ({ page }) => {
      await presetRecoverySession(page);
      await page.goto('/auth/recovery/reset');
      const reset = new RecoveryResetPage(page);

      await reset.fillPasswords('NuevaPassword1!', 'OtraPassword2!');
      await reset.submit();

      await expect(reset.alert).toContainText('Las contraseñas no coinciden');
    });

    test('validación: contraseña sin mayúscula muestra el error de complejidad', async ({ page }) => {
      await presetRecoverySession(page);
      await page.goto('/auth/recovery/reset');
      const reset = new RecoveryResetPage(page);

      await reset.fillPasswords('password123!');
      await reset.submit();

      await expect(reset.alert).toContainText('La contraseña debe contener al menos una letra mayúscula.');
    });

    test('mostrar/ocultar alterna el tipo de los campos de contraseña', async ({ page }) => {
      await presetRecoverySession(page);
      await page.goto('/auth/recovery/reset');
      const reset = new RecoveryResetPage(page);

      await reset.newPasswordInput.fill('NuevaPassword1!');
      await expect(reset.newPasswordInput).toHaveAttribute('type', 'password');

      await reset.showPasswordButton.click();
      await expect(reset.newPasswordInput).toHaveAttribute('type', 'text');
      await expect(reset.hidePasswordButton).toBeVisible();

      await reset.hidePasswordButton.click();
      await expect(reset.newPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Flujo completo', () => {
    test('con backend real: solicitud → código → el backend rechaza el token inexistente', async ({ page }) => {
      test.setTimeout(60_000);

      // Paso 1 — solicitar recuperación con un email que no existe (sin efectos secundarios).
      const forgot = new ForgotPasswordPage(page);
      await forgot.goto();
      await forgot.requestRecovery(EMAIL_INEXISTENTE);
      await expect(forgot.alert).toContainText(/se ha enviado un código de recuperación/i, {
        timeout: 15_000,
      });
      await expect(page).toHaveURL(/\/auth\/recovery\/verify$/, { timeout: 15_000 });

      // Paso 2 — verificar con un código de 8 dígitos (validación local de formato).
      const verify = new RecoveryVerifyPage(page);
      await verify.fillCode('99998888');
      await verify.submit();
      await expect(page).toHaveURL(/\/auth\/recovery\/reset$/, { timeout: 15_000 });

      // Paso 3 — contraseñas válidas: el backend rechaza el token (no existe en BD).
      const reset = new RecoveryResetPage(page);
      await reset.fillPasswords('NuevaPassword1!');
      await reset.submit();
      await expect(reset.alert).toContainText('Token inválido o expirado', { timeout: 15_000 });
      await expect(reset.submitButton).toBeEnabled();
    });

    test('con API simulada: solicitud → código → cambio exitoso → login', async ({ page }) => {
      test.setTimeout(60_000);
      // Contadores para garantizar que el mock interceptó las llamadas y el
      // test no cayó silenciosamente al backend real (p. ej. si la URL no coincide).
      let forgotCalls = 0;
      let resetCalls = 0;
      // El navegador llama a VITE_API_URL (por defecto http://localhost:3000),
      // mientras que E2E_API_URL usa 127.0.0.1 para las llamadas directas de
      // Node (IPv4). page.route es por dominio exacto, así que se usa un glob
      // `**` que cubre ambos hosts y se valida con los contadores que el mock
      // sí interceptó (y no se cayó al backend real).
      await page.route(apiRoute('/auth/forgot-password'), (route) => {
        forgotCalls += 1;
        return route.fulfill({ json: { message: 'Código de recuperación enviado al email' } });
      });
      await page.route(apiRoute('/auth/reset-password'), (route) => {
        resetCalls += 1;
        return route.fulfill({ json: { message: 'Contraseña actualizada exitosamente' } });
      });

      // Paso 1 — solicitud exitosa.
      const forgot = new ForgotPasswordPage(page);
      await forgot.goto();
      await forgot.requestRecovery('flujo-exitoso@example.com');
      await expect(forgot.alert).toContainText(/se ha enviado un código de recuperación/i, {
        timeout: 15_000,
      });
      await expect(page).toHaveURL(/\/auth\/recovery\/verify$/, { timeout: 15_000 });

      // Paso 2 — verificación del código.
      const verify = new RecoveryVerifyPage(page);
      await verify.fillCode('12345678');
      await verify.submit();
      await expect(page).toHaveURL(/\/auth\/recovery\/reset$/, { timeout: 15_000 });

      // Paso 3 — cambio de contraseña exitoso y regreso al login.
      // El alert de éxito solo se muestra ~2s antes de la redirección, así que
      // se usan señales deterministas: la URL final y la limpieza de la sesión
      // (el flujo solo borra recovery_token/recovery_email al tener éxito).
      const reset = new RecoveryResetPage(page);
      await reset.fillPasswords('NuevaPassword1!');
      await reset.submit();
      await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
      expect(await page.evaluate(() => sessionStorage.getItem('recovery_token'))).toBeNull();
      expect(await page.evaluate(() => sessionStorage.getItem('recovery_email'))).toBeNull();

      // El flujo usó los mocks (1 llamada a cada endpoint), no el backend real.
      expect(forgotCalls).toBe(1);
      expect(resetCalls).toBe(1);
    });
  });
});
