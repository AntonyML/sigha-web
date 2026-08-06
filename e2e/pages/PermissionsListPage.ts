import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del listado de permisos
 * (/permissions, src/presentation/pages/permissions/PermissionListPage.tsx).
 *
 * Muestra ID, nombre/descripción, módulo, acción, estado (Activo/Inactivo) y
 * las acciones Ver/Editar/Eliminar. El botón "Eliminar" solo se renderiza
 * para permisos habilitados.
 */
export class PermissionsListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newPermissionButton: Locator;
  readonly searchInput: Locator;
  readonly searchClear: Locator;
  readonly loading: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Gestión de Permisos', { exact: true });
    // Los botones de acción se acotan al contenido: el Sidebar también
    // renderiza ítems de navegación como <button>.
    this.newPermissionButton = page
      .getByRole('main')
      .getByRole('button', { name: 'Nuevo Permiso' });
    this.searchInput = page.getByPlaceholder('Buscar por nombre, módulo o acción...');
    this.searchClear = page.locator('.lp-search-clear');
    this.loading = page.locator('.lp-loading');
    this.noResults = page.getByText('Intenta con otros términos.', { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/permissions');
  }

  /** Fila de la tabla que contiene el nombre del permiso. */
  rowFor(name: string): Locator {
    return this.page.locator('table tbody tr', { hasText: name });
  }

  async search(name: string): Promise<void> {
    await this.searchInput.fill(name);
  }

  async clearSearch(): Promise<void> {
    await this.searchClear.click();
  }

  /** Abre el modal de confirmación de borrado de un permiso desde la lista. */
  async openDeleteConfirm(name: string): Promise<void> {
    await this.rowFor(name).getByTitle('Eliminar').click();
  }
}
