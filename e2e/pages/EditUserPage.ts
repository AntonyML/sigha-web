import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model de la edición de usuario
 * (/users/edit/:id, src/modules/identity/presentation/pages/users/EditUserPage.tsx).
 *
 * Nota: los <label> de FieldGroup NO están asociados a los inputs (sin htmlFor),
 * por lo que no se pueden usar getByLabel(); los inputs del formulario se
 * resuelven por tarjeta + posición (el orden lo define EditUserPage.tsx).
 */
export class EditUserPage {
  readonly page: Page;
  readonly title: Locator;

  readonly identificationInput: Locator;
  readonly nameInput: Locator;
  readonly firstLastNameInput: Locator;
  readonly secondLastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;

  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly viewDetailsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Editar usuario', { exact: true });

    const personal = page.locator('.lp-card', { hasText: 'Información personal' }).locator('input');
    this.identificationInput = personal.nth(0);
    this.nameInput = personal.nth(1);
    this.firstLastNameInput = personal.nth(2);
    this.secondLastNameInput = personal.nth(3);

    this.emailInput = page.locator('.lp-card', { hasText: 'Correo electrónico' }).locator('input');
    this.passwordInput = page.getByPlaceholder('Dejar vacío para no cambiar');
    this.roleSelect = page.locator('select.form-select-lg');

    this.saveButton = page.getByRole('button', { name: 'Guardar cambios' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.viewDetailsButton = page.getByRole('button', { name: 'Ver detalles' });
  }

  /** Badge del rol actual (no editable). */
  currentRoleBadge(roleName: string): Locator {
    return this.page.locator('.lp-card', { hasText: 'Rol del usuario' }).getByText(roleName, { exact: true });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
