import { test, expect } from '@playwright/test';
import { UsersListPage } from '../../pages/UsersListPage';
import { CreateUserPage } from '../../pages/CreateUserPage';
import { EditUserPage } from '../../pages/EditUserPage';
import { ViewUserPage } from '../../pages/ViewUserPage';
import { DeletedUsersPage } from '../../pages/DeletedUsersPage';
import {
  createDisposableUser,
  deleteUserDirect,
  findUserIdByIdentification,
} from '../../support/api';
import { uniqueIdentification, uniqueUserEmail } from '../../support/factories';
import { RUN_DELETE_TESTS } from '../../support/config';

/**
 * CRUD del módulo Usuarios.
 * Rutas: /users (listado), /users/create, /users/view/:id, /users/edit/:id,
 * /users/deleted (usuarios eliminados).
 *
 * Los tests que tocan filas crean su PROPIO usuario vía API (y lo limpian al
 * final), para no depender de datos preexistentes ni de otros tests. Se corren
 * en modo serial para no saturar la API (throttler global de 100 req/min).
 * `DATA_TIMEOUT` es amplio porque el dev server de Vite compila módulos en
 * frío durante la primera carga.
 */
const DATA_TIMEOUT = 45_000;
const TEST_TIMEOUT = 120_000;

const USER_PASSWORD = 'E2eClave2026!';

test.describe('Usuarios (/users) — Navegación', () => {
  test.describe.configure({ mode: 'serial' });

  test('Lista: renderiza la página con sus controles principales', async ({ page }) => {
    const list = new UsersListPage(page);
    await list.goto();

    await expect(list.title).toBeVisible();
    await expect(list.newUserButton).toBeVisible();
    await expect(list.deletedUsersButton).toBeVisible();
    await expect(list.searchInput).toBeVisible();
  });

  test('Crear: navega al formulario desde el botón', async ({ page }) => {
    const list = new UsersListPage(page);
    await list.goto();

    await list.newUserButton.click();
    await expect(page).toHaveURL(/\/users\/create$/);
    const create = new CreateUserPage(page);
    await expect(create.title).toBeVisible();
  });

  test('Eliminados: navega a la vista de usuarios eliminados', async ({ page }) => {
    const list = new UsersListPage(page);
    await list.goto();

    await list.deletedUsersButton.click();
    await expect(page).toHaveURL(/\/users\/deleted$/);
    const deleted = new DeletedUsersPage(page);
    await expect(deleted.title).toBeVisible({ timeout: DATA_TIMEOUT });
  });
});

test.describe('Usuarios (/users) — Búsqueda', () => {
  test.describe.configure({ mode: 'serial' });

  test('Búsqueda: sin coincidencias muestra el estado vacío', async ({ page }) => {
    const list = new UsersListPage(page);
    await list.goto();

    // Espera a que el listado cargue datos reales (aparece el contador).
    await expect(list.count).toBeVisible({ timeout: DATA_TIMEOUT });
    await list.search('zzzz-0000-no-existe');
    await expect(list.noResults).toBeVisible();
  });

  test('Búsqueda: encuentra al usuario por identificación', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    const email = uniqueUserEmail();
    const { id } = await createDisposableUser({ uIdentification: identification, uEmail: email });
    try {
      const list = new UsersListPage(page);
      await list.goto();
      await expect(list.count).toBeVisible({ timeout: DATA_TIMEOUT });

      await list.search(identification);
      await expect(list.rowFor(identification)).toHaveCount(1, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteUserDirect(id).catch(() => undefined);
    }
  });
});

test.describe('Usuarios (/users) — CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('Crear: datos incompletos en el paso 1 muestran el toast de la app', async ({ page }) => {
    const create = new CreateUserPage(page);
    await create.goto();

    await create.next();
    await expect(page.getByText('Por favor ingresa la identificación del usuario')).toBeVisible();
  });

  test('Crear: crea un usuario y lo muestra en el listado', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    const email = uniqueUserEmail();

    const list = new UsersListPage(page);
    await list.goto();
    await list.newUserButton.click();
    await expect(page).toHaveURL(/\/users\/create$/);

    const create = new CreateUserPage(page);
    await create.fillStep1({
      identification,
      name: 'Ana',
      firstLastName: 'Prueba',
      secondLastName: 'Qa',
    });
    await create.next();
    await create.fillStep2({ email, password: USER_PASSWORD, confirmPassword: USER_PASSWORD });
    await create.next();
    await create.selectRole('nurse');
    await create.submit();

    await expect(page).toHaveURL(/\/users$/, { timeout: DATA_TIMEOUT });

    await list.search(identification);
    await expect(list.rowFor(identification)).toHaveCount(1, { timeout: DATA_TIMEOUT });

    // Limpieza: el id no se ve en la UI, se resuelve por identificación vía API.
    const id = await findUserIdByIdentification(identification);
    if (id) await deleteUserDirect(id).catch(() => undefined);
  });

  test('Crear: un correo duplicado muestra el error del backend', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const email = uniqueUserEmail();
    const { id } = await createDisposableUser({ uEmail: email });
    try {
      const create = new CreateUserPage(page);
      await create.goto();
      await create.fillStep1({
        identification: uniqueIdentification(),
        name: 'Ana',
        firstLastName: 'Prueba',
      });
      await create.next();
      await create.fillStep2({ email, password: USER_PASSWORD, confirmPassword: USER_PASSWORD });
      await create.next();
      await create.selectRole('nurse');
      await create.submit();

      // El backend responde 400 con "El email ya está en uso" (NO 409): el
      // frontend pinta ese mensaje tal cual en el toast de error.
      await expect(page.getByText(/ya está en uso/)).toBeVisible({ timeout: DATA_TIMEOUT });
    } finally {
      await deleteUserDirect(id).catch(() => undefined);
    }
  });

  test('Ver: abre el detalle del usuario creado', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    const email = uniqueUserEmail();
    const { id } = await createDisposableUser({ uIdentification: identification, uEmail: email });
    try {
      const list = new UsersListPage(page);
      await list.goto();
      await list.search(identification);
      const row = list.rowFor(identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Ver detalles').click();
      await expect(page).toHaveURL(/\/users\/view\/\d+$/);
      const view = new ViewUserPage(page);
      await expect(page.getByText(identification, { exact: true })).toBeVisible();
      await expect(page.getByText(email, { exact: true })).toBeVisible();
      await expect(view.statusBadge('Activo')).toBeVisible();
      await expect(view.roleBadge('nurse')).toBeVisible();
    } finally {
      await deleteUserDirect(id).catch(() => undefined);
    }
  });

  test('Editar: carga los datos y renombra al usuario', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    const email = uniqueUserEmail();
    const { id } = await createDisposableUser({
      uIdentification: identification,
      uEmail: email,
      uName: 'Ana',
      uFLastName: 'Prueba',
      uSLastName: 'Qa',
    });
    try {
      const list = new UsersListPage(page);
      await list.goto();
      await list.search(identification);
      const row = list.rowFor(identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Editar').click();
      await expect(page).toHaveURL(/\/users\/edit\/\d+$/);
      const edit = new EditUserPage(page);
      await expect(edit.identificationInput).toHaveValue(identification, { timeout: DATA_TIMEOUT });
      await expect(edit.nameInput).toHaveValue('Ana');

      await edit.nameInput.fill('Ana Editado');
      await edit.save();
      await expect(page).toHaveURL(/\/users$/, { timeout: DATA_TIMEOUT });

      await list.search(identification);
      await expect(list.rowFor(identification)).toContainText('Ana Editado', {
        timeout: DATA_TIMEOUT,
      });
    } finally {
      await deleteUserDirect(id).catch(() => undefined);
    }
  });

  test('Editar: cambiar rol muestra el resumen y persiste en el detalle', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    const email = uniqueUserEmail();
    const { id } = await createDisposableUser({
      uIdentification: identification,
      uEmail: email,
      roleId: 4, // nurse
    });
    try {
      const list = new UsersListPage(page);
      await list.goto();
      await list.search(identification);
      const row = list.rowFor(identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Editar').click();
      await expect(page).toHaveURL(/\/users\/edit\/\d+$/);
      const edit = new EditUserPage(page);
      await expect(edit.roleSelect).toBeVisible({ timeout: DATA_TIMEOUT });

      // El rol actual se muestra como badge no editable.
      await expect(edit.currentRoleBadge('nurse')).toBeVisible();

      await edit.roleSelect.selectOption({ label: 'director' });
      await expect(page.getByText(/Se cambiará el rol de/)).toBeVisible();

      await edit.save();
      await expect(page).toHaveURL(/\/users$/, { timeout: DATA_TIMEOUT });

      // Verifica el cambio de rol en el detalle.
      await list.search(identification);
      const rowAfter = list.rowFor(identification);
      await expect(rowAfter).toHaveCount(1, { timeout: DATA_TIMEOUT });
      await rowAfter.getByTitle('Ver detalles').click();
      await expect(page).toHaveURL(/\/users\/view\/\d+$/);
      const view = new ViewUserPage(page);
      await expect(view.roleBadge('director')).toBeVisible();
      await expect(view.roleBadge('nurse')).toHaveCount(0);
    } finally {
      await deleteUserDirect(id).catch(() => undefined);
    }
  });

  test('Eliminar: cancelar mantiene el usuario', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    const email = uniqueUserEmail();
    const { id } = await createDisposableUser({ uIdentification: identification, uEmail: email });
    try {
      const list = new UsersListPage(page);
      await list.goto();
      await list.search(identification);
      const row = list.rowFor(identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Eliminar').click();
      await expect(page.getByText('Eliminar usuario', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Cancelar' }).click();

      await expect(list.rowFor(identification)).toHaveCount(1);
    } finally {
      await deleteUserDirect(id).catch(() => undefined);
    }
  });

  test('Eliminar: confirma y elimina el usuario creado por el test', async ({ page }) => {
    test.skip(
      !RUN_DELETE_TESTS,
      'Habilita E2E_RUN_DELETE=1 en .env.e2e para ejecutar la prueba destructiva',
    );
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    const email = uniqueUserEmail();
    const { id } = await createDisposableUser({ uIdentification: identification, uEmail: email });
    try {
      const list = new UsersListPage(page);
      await list.goto();
      await list.search(identification);
      const row = list.rowFor(identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Eliminar').click();
      await expect(page.getByText('Eliminar usuario', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Aceptar' }).click();

      await expect(list.rowFor(identification)).toHaveCount(0, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteUserDirect(id).catch(() => undefined);
    }
  });

  test('Eliminados: recupera un usuario eliminado desde la vista de eliminados', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const identification = uniqueIdentification();
    const email = uniqueUserEmail();
    const { id } = await createDisposableUser({ uIdentification: identification, uEmail: email });
    try {
      // Soft-delete vía API para mover el usuario a la lista de eliminados.
      await deleteUserDirect(id);

      const deleted = new DeletedUsersPage(page);
      await deleted.goto();
      await expect(deleted.count).toBeVisible({ timeout: DATA_TIMEOUT });

      await deleted.search(identification);
      const row = deleted.rowFor(identification);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Recuperar usuario').click();
      await expect(page.getByText('Recuperar usuario', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Aceptar' }).click();

      // Ya no debe aparecer entre los eliminados.
      await expect(deleted.rowFor(identification)).toHaveCount(0, { timeout: DATA_TIMEOUT });

      // Y vuelve a la lista principal como activo.
      const list = new UsersListPage(page);
      await list.goto();
      await list.search(identification);
      await expect(list.rowFor(identification)).toHaveCount(1, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteUserDirect(id).catch(() => undefined);
    }
  });
});
