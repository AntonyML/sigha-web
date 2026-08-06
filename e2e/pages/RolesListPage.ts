import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del listado de roles
 * (/roles, src/presentation/pages/roles/RoleListPage.tsx).
 */
export class RolesListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newRoleButton: Locator;
  readonly historyButton: Locator;
  readonly searchInput: Locator;
  readonly searchClear: Locator;
  readonly loading: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Gestión de Roles', { exact: true });
    // Los botones de acción se acotan al contenido: el Sidebar también renderiza
    // ítems como <button> (p.ej. "Historial de Cambios" apunta a /role-changes).
    this.newRoleButton = page.getByRole('main').getByRole('button', { name: 'Nuevo Rol' });
    this.historyButton = page.getByRole('main').getByRole('button', { name: 'Historial de cambios' });
    this.searchInput = page.getByPlaceholder('Buscar roles...');
    this.searchClear = page.locator('.lp-search-clear');
    this.loading = page.locator('.lp-loading');
    this.noResults = page.getByText('Intenta con otros términos de búsqueda.', { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/roles');
  }

  /** Fila de la tabla que contiene el nombre del rol. */
  rowFor(name: string): Locator {
    return this.page.locator('table tbody tr', { hasText: name });
  }

  async search(name: string): Promise<void> {
    await this.searchInput.fill(name);
  }

  async clearSearch(): Promise<void> {
    await this.searchClear.click();
  }

  /** Abre el modal de confirmación de borrado de un rol desde la lista. */
  async openDeleteConfirm(name: string): Promise<void> {
    await this.rowFor(name).getByTitle('Eliminar').click();
  }
}
