import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del formulario de edición de permisos
 * (/permissions/edit/:id, src/modules/identity/presentation/pages/permissions/EditPermissionPage.tsx).
 *
 * El botón "Guardar Cambios" está deshabilitado si no hay cambios. Al pulsar
 * "Cancelar" con cambios sin guardar se abre un modal de confirmación
 * (Radix Dialog) con título "Salir sin guardar" y botones Aceptar/Cancelar.
 */
export class EditPermissionPage {
  readonly page: Page;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly moduleSelect: Locator;
  readonly actionSelect: Locator;
  readonly enabledSwitch: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorAlert: Locator;
  readonly changesBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Editar Permiso', { exact: true });
    // Los labels incluyen un asterisco de "requerido" (p.ej. "Módulo *");
    // getByLabel hace match por substring del accessible name.
    this.nameInput = page.getByLabel('Nombre del Permiso');
    this.descriptionInput = page.getByLabel('Descripción');
    this.moduleSelect = page.getByLabel('Módulo');
    this.actionSelect = page.getByLabel('Acción');
    this.enabledSwitch = page.locator('#pEnabled');
    this.submitButton = page.getByRole('button', { name: 'Guardar Cambios' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.errorAlert = page.getByRole('alert');
    this.changesBanner = page.getByText(
      'Se han detectado cambios en el formulario. Recuerda guardar antes de salir.',
      { exact: true },
    );
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /** Activa/desactiva el switch de estado (pEnabled) según el valor pedido. */
  async setEnabled(enabled: boolean): Promise<void> {
    if ((await this.enabledSwitch.isChecked()) !== enabled) {
      await this.enabledSwitch.click();
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
