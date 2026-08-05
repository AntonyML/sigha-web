import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del detalle de un programa
 * (/programs/view/:id, src/presentation/pages/programs/ViewProgramPage.tsx).
 */
export class ViewProgramPage {
  readonly page: Page;
  readonly title: Locator;
  readonly editButton: Locator;
  readonly backButton: Locator;
  readonly noSubPrograms: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Detalle del Programa', { exact: true });
    this.editButton = page.getByRole('button', { name: 'Editar' });
    this.backButton = page.getByRole('button', { name: 'Regresar' });
    this.noSubPrograms = page.getByText('Sin subprogramas asociados');
  }

}
