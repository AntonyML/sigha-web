import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del detalle de un permiso
 * (/permissions/view/:id, src/presentation/pages/permissions/ViewPermissionPage.tsx).
 *
 * Muestra el nombre (h3), el badge "ID: #n", módulo, acción y estado
 * (Habilitado/Deshabilitado), además de los botones "Editar Permiso" y
 * "Volver a la Lista".
 */
export class ViewPermissionPage {
  readonly page: Page;
  readonly title: Locator;
  readonly editButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Detalles del Permiso', { exact: true });
    this.editButton = page.getByRole('button', { name: 'Editar Permiso' });
    this.backButton = page.getByRole('button', { name: 'Volver a la Lista' });
  }

  /** Heading (h3) con el nombre del permiso. */
  permissionName(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  /** Badge "ID: #n" del encabezado. */
  idBadge(id: number): Locator {
    return this.page.getByText(`ID: #${id}`, { exact: true });
  }

  /** Badge del módulo (bg-info). `.first()` porque el texto puede repetirse. */
  moduleBadge(module: string): Locator {
    return this.page.getByText(module, { exact: true }).first();
  }

  /** Badge de la acción (bg-warning). `.first()` porque el texto puede repetirse. */
  actionBadge(action: string): Locator {
    return this.page.getByText(action, { exact: true }).first();
  }

  /** Badge/texto de estado. `.first()` porque "Habilitado" aparece dos veces. */
  statusBadge(status: 'Habilitado' | 'Deshabilitado'): Locator {
    return this.page.getByText(status, { exact: true }).first();
  }
}
