import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del formulario de edición de programas
 * (/programs/edit/:id, src/presentation/pages/programs/EditProgramPage.tsx).
 */
export class EditProgramPage {
  readonly page: Page;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly backButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Editar Programa', { exact: true });
    this.nameInput = page.getByLabel('Nombre del Programa');
    this.submitButton = page.getByRole('button', { name: 'Guardar Cambios' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.backButton = page.getByRole('button', { name: 'Regresar' });
    this.errorAlert = page.getByRole('alert');
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
