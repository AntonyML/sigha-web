import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del formulario de creación de permisos
 * (/permissions/create, src/modules/identity/presentation/pages/permissions/CreatePermissionPage.tsx).
 *
 * El formulario tiene nombre, descripción, módulo (select), acción (select) y
 * un switch de estado (pEnabled, activado por defecto). Los errores de
 * validación/backend se muestran inline (alert-danger con role="alert"),
 * nunca en window.alert.
 */
export class CreatePermissionPage {
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

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Crear Nuevo Permiso', { exact: true });
    // Los labels incluyen un asterisco de "requerido" (p.ej. "Módulo *");
    // getByLabel hace match por substring del accessible name.
    this.nameInput = page.getByLabel('Nombre del Permiso');
    this.descriptionInput = page.getByLabel('Descripción');
    this.moduleSelect = page.getByLabel('Módulo');
    this.actionSelect = page.getByLabel('Acción');
    this.enabledSwitch = page.locator('#pEnabled');
    this.submitButton = page.getByRole('button', { name: 'Crear Permiso' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.errorAlert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/permissions/create');
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async selectModule(module: string): Promise<void> {
    await this.moduleSelect.selectOption(module);
  }

  async selectAction(action: string): Promise<void> {
    await this.actionSelect.selectOption(action);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
