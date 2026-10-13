import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model de la página de cambio de contraseña
 * (/auth/recovery/reset, src/modules/auth/presentation/pages/login/PasswordRecoveryResetPage.tsx).
 *
 * Requiere recovery_email y recovery_token en sessionStorage; si faltan, redirige
 * a /auth/forgot-password.
 */
export class RecoveryResetPage {
  readonly page: Page;
  readonly title: Locator;
  readonly description: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;
  readonly backButton: Locator;
  readonly showPasswordButton: Locator;
  readonly hidePasswordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // CardTitle y la etiqueta "Nueva Contraseña" comparten texto; .first() resuelve
    // el título (CardHeader aparece antes en el DOM).
    this.title = page.getByText('Nueva Contraseña', { exact: true }).first();
    this.description = page.getByText('Ingresa tu nueva contraseña');
    this.newPasswordInput = page.getByLabel('Nueva Contraseña', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirmar Contraseña', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Cambiar Contraseña' });
    this.alert = page.getByRole('alert');
    this.backButton = page.getByRole('button', { name: 'Volver', exact: true });
    // Hay dos botones mostrar/ocultar (uno por campo); los tests usan el del primer campo.
    this.showPasswordButton = page.getByRole('button', { name: 'Mostrar contraseña' }).first();
    this.hidePasswordButton = page.getByRole('button', { name: 'Ocultar contraseña' }).first();
  }

  async fillPasswords(password: string, confirmation = password): Promise<void> {
    await this.newPasswordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmation);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
