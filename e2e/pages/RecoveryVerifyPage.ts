import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model de la página de verificación del código de recuperación
 * (/auth/recovery/verify, src/modules/auth/presentation/pages/login/PasswordRecoveryVerifyPage.tsx).
 *
 * La verificación es local (formato de 8 dígitos); no hace llamadas HTTP.
 */
export class RecoveryVerifyPage {
  readonly page: Page;
  readonly title: Locator;
  readonly part1Input: Locator;
  readonly part2Input: Locator;
  readonly submitButton: Locator;
  readonly alert: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // CardTitle y el botón "Verificar Código" comparten texto; .first() resuelve
    // el título (CardHeader aparece antes en el DOM).
    this.title = page.getByText('Verificar Código', { exact: true }).first();
    // La etiqueta "Código de Recuperación" apunta a un id que no existe
    // (los inputs reales son recovery-code-part1/part2), así que se usan placeholders.
    this.part1Input = page.getByPlaceholder('1234');
    this.part2Input = page.getByPlaceholder('5678');
    this.submitButton = page.getByRole('button', { name: 'Verificar Código' });
    this.alert = page.getByRole('alert');
    this.backButton = page.getByRole('button', { name: 'Volver', exact: true });
  }

  async fillCode(code: string): Promise<void> {
    await this.part1Input.fill(code.slice(0, 4));
    await this.part2Input.fill(code.slice(4));
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
