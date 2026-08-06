import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del detalle de un rol
 * (/roles/view/:id, src/presentation/pages/roles/ViewRolePage.tsx).
 *
 * Muestra nombre, badge "ID: #n" y los permisos agrupados por módulo. Cada
 * card de módulo tiene un badge "otorgados/total" y las acciones como
 * Ver/Crear/Editar/Eliminar (mapeadas desde pAction).
 */
export class ViewRolePage {
  readonly page: Page;
  readonly title: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  /** Contador "Permisos otorgados" de las estadísticas. */
  readonly grantedStat: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Detalles del Rol', { exact: true });
    // Hay dos botones "Editar Rol" (header y Acciones Rápidas): se usa el primero.
    this.editButton = page.getByRole('button', { name: 'Editar Rol' }).first();
    this.deleteButton = page.getByRole('button', { name: 'Eliminar Rol' }).first();
    this.grantedStat = page.locator('div.display-6.fw-bold.text-success');
  }

  /** Heading del nombre del rol. */
  roleName(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  /** Badge "ID: #n" del encabezado. */
  idBadge(id: number): Locator {
    return this.page.getByText(`ID: #${id}`, { exact: true });
  }

  /** Card de un módulo de permisos, por su label amigable (p.ej. "Roles"). */
  moduleCard(moduleLabel: string): Locator {
    return this.page
      .locator('.card', { hasText: 'Permisos del Rol' })
      .locator('div.border.rounded.p-3', { hasText: moduleLabel });
  }
}
