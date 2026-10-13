import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model de la página de solicitud de recuperación de contraseña
 * (/auth/forgot-password, src/modules/auth/presentation/pages/login/PasswordRecoveryRequestPage.tsx).
 */
export class ForgotPasswordPage {
  readonly page: Page;
  readonly title: Locator;
  readonly description: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Recuperar Contraseña', { exact: true });
    this.description = page.getByText('Ingresa tu email para recibir códigos de recuperación');
    this.emailInput = page.getByLabel('Correo Electrónico', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Enviar códigos de recuperación' });
    // Solo se renderiza un alert a la vez (éxito O error), ambos con role="alert".
    this.alert = page.getByRole('alert');
    this.backButton = page.getByRole('button', { name: 'Volver al inicio de sesión' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/forgot-password');
  }

  async requestRecovery(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}
