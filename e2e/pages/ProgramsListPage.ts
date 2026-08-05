import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model del listado de programas
 * (/programs, src/presentation/pages/programs/ProgramListPage.tsx).
 */
export class ProgramsListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newProgramButton: Locator;
  readonly backButton: Locator;
  readonly searchInput: Locator;
  readonly emptyState: Locator;
  readonly noResults: Locator;
  readonly count: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByText('Gestión de Programas', { exact: true });
    this.newProgramButton = page.getByRole('button', { name: 'Nuevo Programa' });
    this.backButton = page.getByRole('button', { name: 'Menú Principal' });
    this.searchInput = page.getByPlaceholder('Buscar programas...');
    this.emptyState = page.getByText('No hay programas registrados.');
    this.noResults = page.getByText('No se encontraron programas con esa búsqueda.');
    this.count = page.getByText(/Total: \d+ programa/);
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs');
  }

  rowFor(name: string): Locator {
    return this.page.locator('table tbody tr', { hasText: name });
  }

  async search(name: string): Promise<void> {
    await this.searchInput.fill(name);
  }
}
