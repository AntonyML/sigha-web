import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del listado de usuarios
 * (/users, src/modules/identity/presentation/pages/users/UserListPage.tsx).
 */
export class UsersListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newUserButton: Locator;
  readonly deletedUsersButton: Locator;
  readonly searchInput: Locator;
  readonly emptyState: Locator;
  readonly noResults: Locator;
  readonly count: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Gestión de Usuarios', { exact: true });
    this.newUserButton = page.getByRole('button', { name: 'Nuevo Usuario' });
    this.deletedUsersButton = page.getByRole('button', { name: 'Recuperar Eliminados' });
    this.searchInput = page.getByPlaceholder('Buscar por nombre, correo o identificación...');
    this.emptyState = page.getByText('No hay usuarios registrados.');
    this.noResults = page.getByText('No se encontraron resultados. Intenta con otros términos.');
    this.count = page.getByText(/\d+ usuarios/);
  }

  async goto(): Promise<void> {
    await this.page.goto('/users');
  }

  rowFor(identification: string): Locator {
    return this.page.locator('table tbody tr', { hasText: identification });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }
}
