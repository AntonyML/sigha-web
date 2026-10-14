import type { Locator, Page } from '@playwright/test';

export class OrganizationPickerPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly organizationOptions: Locator;
  readonly continueButton: Locator;
  readonly noOrganizationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText('Selecciona tu organización', { exact: true });
    this.organizationOptions = page.getByRole('group', { name: 'Organizaciones disponibles' }).getByRole('button');
    this.continueButton = page.getByRole('button', { name: 'Continuar' });
    this.noOrganizationMessage = page.getByText('Sin organización asignada', { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/seleccionar-organizacion');
  }

  async selectOrganization(name: string): Promise<void> {
    await this.page.getByRole('button', { name: new RegExp(name) }).click();
  }

  async continueWithFirstOrganizationIfVisible(): Promise<boolean> {
    if (!(await this.heading.isVisible().catch(() => false))) return false;
    const count = await this.organizationOptions.count();
    if (count === 0) return false;
    await this.organizationOptions.first().click();
    await this.continueButton.click();
    return true;
  }
}
