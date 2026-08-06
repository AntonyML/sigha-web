import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del detalle de usuario
 * (/users/view/:id, src/presentation/pages/users/ViewUserPage.tsx).
 *
 * El título es el nombre completo del usuario (dinámico); las aserciones de
 * datos se hacen por los valores (identificación, correo, rol, estado).
 */
export class ViewUserPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly editButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: 'Volver' });
    this.editButton = page.getByRole('button', { name: 'Editar' });
  }

  /** Texto "Usuario #<id>" bajo el título. */
  userIdLabel(id: number): Locator {
    return this.page.getByText(`Usuario #${id}`, { exact: false });
  }

  roleBadge(roleName: string): Locator {
    return this.page.locator('.lp-card', { hasText: 'Rol y acceso' }).getByText(roleName, { exact: true });
  }

  statusBadge(status: 'Activo' | 'Inactivo'): Locator {
    return this.page.locator('.lp-card', { hasText: 'Rol y acceso' }).getByText(status, { exact: true });
  }
}
