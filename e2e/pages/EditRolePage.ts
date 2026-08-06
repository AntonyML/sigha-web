import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del formulario de edición de roles
 * (/roles/edit/:id, src/presentation/pages/roles/EditRolePage.tsx).
 *
 * El botón "Guardar Cambios" está deshabilitado si no hay cambios. Al pulsar
 * "Cancelar" con cambios sin guardar se abre un modal de confirmación
 * (Radix Dialog) con título "Salir sin guardar" y botones Aceptar/Cancelar.
 */
export class EditRolePage {
  readonly page: Page;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorAlert: Locator;
  readonly unsavedWarning: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Editar Rol', { exact: true });
    this.nameInput = page.getByLabel('Nombre del Rol');
    this.submitButton = page.getByRole('button', { name: 'Guardar Cambios' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.errorAlert = page.getByRole('alert');
    this.unsavedWarning = page.getByText(/Tienes cambios sin guardar/);
  }

  /** Casilla de un permiso individual por id (id `perm-<id>`). */
  permissionCheckbox(permissionId: number): Locator {
    return this.page.locator(`#perm-${permissionId}`);
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
