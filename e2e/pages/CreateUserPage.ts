import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del wizard de creación de usuario
 * (/users/create, src/modules/identity/presentation/pages/users/CreateUserPage.tsx).
 *
 * Nota: los <label> del wizard NO están asociados a los inputs (sin htmlFor),
 * por lo que no se pueden usar getByLabel(); se usan placeholders.
 */
export class CreateUserPage {
  readonly page: Page;
  readonly title: Locator;
  readonly stepCounter: Locator;

  // Paso 1 — Datos personales
  readonly identificationInput: Locator;
  readonly nameInput: Locator;
  readonly firstLastNameInput: Locator;
  readonly secondLastNameInput: Locator;

  // Paso 2 — Contacto y acceso
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;

  // Paso 3 — Rol y permisos
  readonly roleSelect: Locator;

  // Navegación
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Nuevo usuario', { exact: true });
    this.stepCounter = page.getByText(/Paso \d+ de 3/);

    this.identificationInput = page.getByPlaceholder('1-2345-6789');
    this.nameInput = page.getByPlaceholder('Ej: Antony Jafeth');
    this.firstLastNameInput = page.getByPlaceholder('Primer apellido');
    this.secondLastNameInput = page.getByPlaceholder('Opcional');

    this.emailInput = page.getByPlaceholder('correo@ejemplo.com');
    this.passwordInput = page.getByPlaceholder('Mínimo 8 caracteres');
    this.confirmPasswordInput = page.getByPlaceholder('Confirmar contraseña');

    this.roleSelect = page.locator('select.form-select');

    this.nextButton = page.getByRole('button', { name: 'Siguiente →' });
    this.prevButton = page.getByRole('button', { name: '← Anterior' });
    this.cancelButton = page.getByRole('button', { name: '← Cancelar' });
    this.submitButton = page.getByRole('button', { name: '✓ Crear usuario' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/users/create');
  }

  async fillStep1(data: {
    identification: string;
    name: string;
    firstLastName: string;
    secondLastName?: string;
  }): Promise<void> {
    await this.identificationInput.fill(data.identification);
    await this.nameInput.fill(data.name);
    await this.firstLastNameInput.fill(data.firstLastName);
    if (data.secondLastName) {
      await this.secondLastNameInput.fill(data.secondLastName);
    }
  }

  async fillStep2(data: { email: string; password: string; confirmPassword: string }): Promise<void> {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
  }

  async selectRole(roleName: string): Promise<void> {
    await this.roleSelect.selectOption({ label: roleName });
  }

  async next(): Promise<void> {
    await this.nextButton.click();
  }

  async prev(): Promise<void> {
    await this.prevButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
