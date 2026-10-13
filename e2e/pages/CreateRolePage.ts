import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del formulario de creación de roles
 * (/roles/create, src/modules/identity/presentation/pages/roles/CreateRolePage.tsx).
 *
 * El formulario solo tiene el campo nombre (rName) + permisos por módulo.
 * No existe campo de descripción ni estado activo/inactivo. Los permisos son
 * checkboxes agrupados por módulo; cada módulo tiene un checkbox "Todos"
 * (id `mod-<module>`) y cada permiso una casilla (id `perm-<id>`).
 */
export class CreateRolePage {
  readonly page: Page;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Crear Nuevo Rol', { exact: true });
    this.nameInput = page.getByLabel('Nombre del Rol');
    this.submitButton = page.getByRole('button', { name: 'Crear Rol' });
    // Los errores de validación/backend se muestran inline (alert-danger), no window.alert.
    this.errorAlert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/roles/create');
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Checkbox "Todos" de un módulo de permisos (id `mod-<module>`). */
  moduleToggle(module: string): Locator {
    return this.page.locator(`#mod-${module}`);
  }

  /** Casilla de un permiso individual por id (id `perm-<id>`). */
  permissionCheckbox(permissionId: number): Locator {
    return this.page.locator(`#perm-${permissionId}`);
  }

  /** Marca el checkbox "Todos" de un módulo (selecciona todos sus permisos). */
  async selectModule(module: string): Promise<void> {
    const toggle = this.moduleToggle(module);
    // El catálogo se carga vía API al montar; espera a que el módulo exista
    // antes de interactuar (si no, el toggle no está renderizado todavía).
    await toggle.waitFor();
    if (!(await toggle.isChecked())) {
      await toggle.check();
    }
  }

  /** Marca el checkbox "Todos" de todos los módulos del catálogo de permisos. */
  async selectAllModules(): Promise<void> {
    const toggles = this.page.locator('input[id^="mod-"]');
    // Espera a que el catálogo de permisos termine de cargar (vía API) antes
    // de seleccionar; si se corre antes, count() es 0 y la selección no hace nada.
    await toggles.first().waitFor();
    const count = await toggles.count();
    for (let i = 0; i < count; i++) {
      const toggle = toggles.nth(i);
      if (!(await toggle.isChecked())) {
        await toggle.check();
      }
    }
  }
}
