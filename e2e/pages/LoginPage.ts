import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model de la página de Login (src/modules/auth/presentation/pages/login/LoginPage.tsx).
 * Encapsula los selectores y las acciones; los specs no dependen de la UI concreta.
 */
export class LoginPage {
  readonly page: Page;
  readonly title: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly forgotPasswordButton: Locator;
  readonly createUserButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Iniciar Sesión', { exact: true });
    this.emailInput = page.getByLabel('Correo Electrónico', { exact: true });
    this.passwordInput = page.getByLabel('Contraseña', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
    this.errorAlert = page.getByRole('alert');
    this.forgotPasswordButton = page.getByRole('button', { name: '¿Olvidaste tu contraseña?' });
    this.createUserButton = page.getByRole('button', { name: 'Crear usuario' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  async waitForPostLoginDestination(): Promise<string> {
    await this.page.waitForURL(/\/(?:auth\/verify-2fa|seleccionar-organizacion|dashboard)$/, {
      timeout: 30_000,
    });
    return new URL(this.page.url()).pathname;
  }
}
