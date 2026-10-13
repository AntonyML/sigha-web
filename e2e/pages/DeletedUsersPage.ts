import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model de la vista de usuarios eliminados
 * (/users/deleted, src/modules/identity/presentation/pages/users/DeletedUsersPage.tsx).
 */
export class DeletedUsersPage {
  readonly page: Page;
  readonly title: Locator;
  readonly searchInput: Locator;
  readonly count: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Usuarios Eliminados', { exact: true });
    this.searchInput = page.getByPlaceholder('Buscar por nombre, email o identificación...');
    this.count = page.getByText(/\d+ usuarios eliminados/);
    this.backButton = page.getByRole('button', { name: 'Volver a usuarios' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/users/deleted');
  }

  rowFor(identification: string): Locator {
    return this.page.locator('table tbody tr', { hasText: identification });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }
}
