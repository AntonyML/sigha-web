import { test, expect } from '@playwright/test';
import { ProgramsListPage } from '../../pages/ProgramsListPage';
import { CreateProgramPage } from '../../pages/CreateProgramPage';
import { EditProgramPage } from '../../pages/EditProgramPage';
import { ViewProgramPage } from '../../pages/ViewProgramPage';
import { createDisposableProgram, deleteProgramDirect, findProgramIdByName } from '../../support/api';
import { uniqueProgramName } from '../../support/factories';
import { RUN_DELETE_TESTS } from '../../support/config';

/**
 * CRUD del módulo Programas.
 * Ruta: /programs (listado), /programs/create, /programs/view/:id, /programs/edit/:id.
 *
 * Los tests que tocan filas crean su PROPIO programa vía API (y lo limpian al
 * final), para no depender de datos preexistentes ni de otros tests. Se corren
 * en modo serial para no saturar la API (throttler global de 100 req/min).
 * `DATA_TIMEOUT` es amplio porque el dev server de Vite compila módulos en
 * frío durante la primera carga.
 */
const DATA_TIMEOUT = 45_000;
const TEST_TIMEOUT = 120_000;

test.describe('Programas (/programs) — CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('Lista: renderiza la página con sus controles principales', async ({ page }) => {
    const list = new ProgramsListPage(page);
    await list.goto();

    await expect(list.title).toBeVisible();
    await expect(list.newProgramButton).toBeVisible();
    await expect(list.backButton).toBeVisible();
    await expect(list.searchInput).toBeVisible();
  });

  test('Lista: una búsqueda sin coincidencias muestra el estado vacío', async ({ page }) => {
    const list = new ProgramsListPage(page);
    await list.goto();

    // Espera a que el listado cargue datos reales (aparece el contador).
    await expect(list.count).toBeVisible({ timeout: DATA_TIMEOUT });
    await list.search('zzzz-0000-no-existe');
    await expect(list.noResults).toBeVisible();
  });

  test('Crear: navega al formulario desde el botón', async ({ page }) => {
    const list = new ProgramsListPage(page);
    await list.goto();

    await list.newProgramButton.click();
    await expect(page).toHaveURL(/\/programs\/create$/);
    const create = new CreateProgramPage(page);
    await expect(create.title).toBeVisible();
  });

  test('Crear: validación con nombre vacío muestra el alert de la app', async ({ page }) => {
    const create = new CreateProgramPage(page);
    await create.goto();

    // Desactiva la validación nativa (required) para llegar al alert de la app.
    // `locator.evaluate` espera a que el form exista: `page.evaluate` con
    // `document.querySelector('form')?` corría antes del montaje de React en el
    // dev server y fallaba en silencio, dejando la validación nativa activa.
    await create.page.locator('form').evaluate((form) => form.setAttribute('novalidate', ''));

    // El alert() del submit bloquea el hilo JS y deja colgado el click() de
    // Playwright ("performing click action"), así que el handler acepta el
    // dialog al instante; el mensaje se captura para la aserción.
    let dialogMessage: string | null = null;
    create.page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      void dialog.accept();
    });
    await create.submit();
    expect(dialogMessage).toBe('El nombre del programa es requerido');
  });

  test('Crear: crea un programa y lo muestra en el listado', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueProgramName();

    const list = new ProgramsListPage(page);
    await list.goto();
    await list.newProgramButton.click();
    const create = new CreateProgramPage(page);
    await create.fillName(name);
    await create.submit();

    await expect(page).toHaveURL(/\/programs$/, { timeout: DATA_TIMEOUT });
    await list.search(name);
    await expect(list.rowFor(name)).toHaveCount(1, { timeout: DATA_TIMEOUT });

    // Limpieza: el id no se ve en la UI, se resuelve por nombre vía API.
    const id = await findProgramIdByName(name);
    if (id) await deleteProgramDirect(id).catch(() => undefined);
  });

  test('Crear: un nombre duplicado muestra el error 409', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueProgramName();
    const { id } = await createDisposableProgram(name);
    try {
      const create = new CreateProgramPage(page);
      await create.goto();
      await create.fillName(name);
      await create.submit();

      await expect(create.errorAlert).toContainText('Ya existe un programa con ese nombre', {
        timeout: DATA_TIMEOUT,
      });
    } finally {
      await deleteProgramDirect(id).catch(() => undefined);
    }
  });

  test('Ver: abre el detalle del programa creado', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueProgramName();
    const { id } = await createDisposableProgram(name);
    try {
      const list = new ProgramsListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Ver detalles').click();
      await expect(page).toHaveURL(/\/programs\/view\/\d+$/);
      const view = new ViewProgramPage(page);
      await expect(view.title).toBeVisible();
      await expect(page.getByText(name, { exact: true })).toBeVisible();
      await expect(view.noSubPrograms).toBeVisible();
    } finally {
      await deleteProgramDirect(id).catch(() => undefined);
    }
  });

  test('Editar desde el detalle: abre el formulario con los datos del programa', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueProgramName();
    const { id } = await createDisposableProgram(name);
    try {
      const list = new ProgramsListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Ver detalles').click();
      const view = new ViewProgramPage(page);
      await expect(view.title).toBeVisible();
      await expect(page.getByText(name, { exact: true })).toBeVisible();

      await view.editButton.click();
      const edit = new EditProgramPage(page);
      await expect(edit.title).toBeVisible({ timeout: DATA_TIMEOUT });
      await expect(edit.nameInput).toHaveValue(name, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteProgramDirect(id).catch(() => undefined);
    }
  });

  test('Editar: carga los datos, renombra y lo refleja en el listado', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueProgramName();
    const newName = `${uniqueProgramName()} Renombrado`;
    const { id } = await createDisposableProgram(name);
    try {
      const list = new ProgramsListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Editar').click();
      await expect(page).toHaveURL(/\/programs\/edit\/\d+$/);
      const edit = new EditProgramPage(page);
      await expect(edit.nameInput).toHaveValue(name, { timeout: DATA_TIMEOUT });

      await edit.nameInput.fill(newName);
      await edit.submit();
      await expect(page).toHaveURL(/\/programs$/, { timeout: DATA_TIMEOUT });

      await list.search(newName);
      await expect(list.rowFor(newName)).toHaveCount(1, { timeout: DATA_TIMEOUT });

      // El nombre anterior ya no aparece en el listado.
      await list.search(name);
      await expect(list.noResults).toBeVisible();
    } finally {
      await deleteProgramDirect(id).catch(() => undefined);
    }
  });

  test('Eliminar: cancelar mantiene el programa', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueProgramName();
    const { id } = await createDisposableProgram(name);
    try {
      const list = new ProgramsListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Eliminar').click();
      await expect(page.getByText('Eliminar programa', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Cancelar' }).click();

      await expect(list.rowFor(name)).toHaveCount(1);
    } finally {
      await deleteProgramDirect(id).catch(() => undefined);
    }
  });

  test('Eliminar: confirma y elimina el programa creado por el test', async ({ page }) => {
    test.skip(
      !RUN_DELETE_TESTS,
      'Habilita E2E_RUN_DELETE=1 en .env.e2e para ejecutar la prueba destructiva',
    );
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueProgramName();
    const { id } = await createDisposableProgram(name);
    try {
      const list = new ProgramsListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Eliminar').click();
      await expect(page.getByText('Eliminar programa', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Aceptar' }).click();

      await expect(list.rowFor(name)).toHaveCount(0, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteProgramDirect(id).catch(() => undefined);
    }
  });
});
