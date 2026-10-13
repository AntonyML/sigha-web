import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del formulario de creación de programas
 * (/programs/create, src/modules/care-planning/presentation/pages/programs/CreateProgramPage.tsx).
 */
export class CreateProgramPage {
  readonly page: Page;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly backButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Crear Nuevo Programa', { exact: true });
    this.nameInput = page.getByLabel('Nombre del Programa');
    this.submitButton = page.getByRole('button', { name: 'Crear Programa' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.backButton = page.getByRole('button', { name: 'Regresar' });
    this.errorAlert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs/create');
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
