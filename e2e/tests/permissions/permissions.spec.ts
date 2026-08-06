import { test, expect } from '@playwright/test';
import { PermissionsListPage } from '../../pages/PermissionsListPage';
import { CreatePermissionPage } from '../../pages/CreatePermissionPage';
import { EditPermissionPage } from '../../pages/EditPermissionPage';
import { ViewPermissionPage } from '../../pages/ViewPermissionPage';
import {
  createDisposablePermission,
  createDisposableRole,
  deletePermissionDirect,
  deleteRoleDirect,
  findFreePermissionCombo,
  findPermissionByName,
  getPermissionById,
  getPermissionCatalog,
  UI_PERMISSION_MODULES,
} from '../../support/api';
import { uniquePermissionName, uniqueRoleName } from '../../support/factories';
import { RUN_DELETE_TESTS } from '../../support/config';

/**
 * CRUD del módulo Permisos.
 * Rutas reales: /permissions (listado), /permissions/create,
 * /permissions/view/:id y /permissions/edit/:id.
 *
 * Los tests que tocan filas crean su PROPIO permiso vía API (y lo limpian al
 * final), para no depender de datos preexistentes ni de otros tests. Se corren
 * en modo serial para no saturar la API (throttler global de 100 req/min).
 *
 * Requisitos del entorno:
 *  - La cuenta e2e (E2E_ADMIN_EMAIL) debe tener rol "super admin": los
 *    POST/PATCH/DELETE /permissions exigen @Roles(SUPER_ADMIN) + 2FA (el
 *    global-setup ya completa el 2FA si está habilitado).
 *
 * Comportamiento real (verificado en el código, discrepancias con lo "ideal"):
 *  - Unicidad: el backend valida (módulo × acción), NO el nombre. Un duplicado
 *    devuelve 409 Conflict con "Ya existe un permiso para el módulo \"X\" con
 *    la acción \"Y\"" (no 400). El frontend lo muestra inline (.alert-danger).
 *  - El formulario de crear/editar solo ofrece 10 módulos × 4 acciones
 *    (UI_PERMISSION_MODULES), pero la semilla (008_permissions.sql) ya crea
 *    todas esas combinaciones. Por eso el test de "crear con éxito" calcula
 *    una combinación libre en el momento y se salta si no queda ninguna.
 *  - Eliminar un permiso asignado a rol(es) con rp_granted=true devuelve 400;
 *    el frontend NO pinta el mensaje del backend, sino el banner genérico
 *    "Error al eliminar permiso del servidor" (.lp-error).
 *  - El botón "Eliminar" de la lista solo se renderiza para permisos
 *    habilitados (pEnabled); los deshabilitados no se pueden borrar por UI.
 *  - Los errores de validación del formulario son inline (alert-danger),
 *    nunca window.alert.
 */
const DATA_TIMEOUT = 45_000;
const TEST_TIMEOUT = 120_000;

test.describe('Permisos (/permissions) — Navegación y estructura', () => {
  test.describe.configure({ mode: 'serial' });

  test('Lista: renderiza la página con sus controles principales', async ({ page }) => {
    const list = new PermissionsListPage(page);
    await list.goto();

    await expect(list.title).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(list.newPermissionButton).toBeVisible();
    await expect(list.searchInput).toBeVisible();

    // Espera a que termine la carga para validar la tabla (con sus headers).
    await expect(list.loading).toHaveCount(0, { timeout: DATA_TIMEOUT });
    await expect(page.getByText('Nombre / Descripción', { exact: true })).toBeVisible();
    await expect(page.getByText('Acciones', { exact: true })).toBeVisible();
  });

  test('Crear: navega al formulario desde el botón "Nuevo Permiso"', async ({ page }) => {
    const list = new PermissionsListPage(page);
    await list.goto();

    await list.newPermissionButton.click();
    await expect(page).toHaveURL(/\/permissions\/create$/);
    const create = new CreatePermissionPage(page);
    await expect(create.title).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(create.nameInput).toBeVisible();
  });
});

test.describe('Permisos (/permissions) — CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('Crear: validación con nombre vacío muestra el error de la app', async ({ page }) => {
    const create = new CreatePermissionPage(page);
    await create.goto();
    await expect(create.title).toBeVisible({ timeout: DATA_TIMEOUT });

    // Desactiva la validación nativa (required) para llegar a la validación de
    // la app, que muestra un alert inline (.alert-danger).
    await create.page.locator('form').evaluate((form) => form.setAttribute('novalidate', ''));

    await create.submit();
    await expect(create.errorAlert).toContainText('Por favor ingresa el nombre del permiso');
  });

  test('Crear: un nombre de menos de 3 caracteres muestra el error de la app', async ({ page }) => {
    const create = new CreatePermissionPage(page);
    await create.goto();
    await expect(create.title).toBeVisible({ timeout: DATA_TIMEOUT });

    await create.page.locator('form').evaluate((form) => form.setAttribute('novalidate', ''));
    await create.fillName('Ab');
    await create.fillDescription('Descripción de prueba');
    await create.selectModule('users');
    await create.selectAction('view');
    await create.submit();

    await expect(create.errorAlert).toContainText(
      'El nombre del permiso debe tener al menos 3 caracteres',
    );
  });

  test('Crear: un módulo/acción existente muestra el error del backend (409)', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const catalog = await getPermissionCatalog();
    const existing = catalog.find((p) => UI_PERMISSION_MODULES.includes(p.pModule));
    test.skip(!existing, 'Catálogo de permisos vacío en este entorno');

    const create = new CreatePermissionPage(page);
    await create.goto();
    await create.fillName(uniquePermissionName());
    await create.fillDescription('Permiso duplicado por test e2e');
    await create.selectModule(existing!.pModule);
    await create.selectAction(existing!.pAction);
    await create.submit();

    // El backend responde 409 Conflict con ese mensaje (no 400): el frontend
    // lo pinta en el alert inline.
    await expect(create.errorAlert).toContainText(
      `Ya existe un permiso para el módulo "${existing!.pModule}" con la acción "${existing!.pAction}"`,
      { timeout: DATA_TIMEOUT },
    );
  });

  test('Crear: crea un permiso con una combinación libre y lo muestra en el listado', async ({
    page,
  }) => {
    test.setTimeout(TEST_TIMEOUT);
    // La semilla ya cubre todas las combinaciones del formulario; solo se puede
    // crear con éxito si alguna combinación quedó libre en este entorno.
    const combo = await findFreePermissionCombo(true);
    test.skip(!combo, 'El catálogo ya cubre todas las combinaciones del formulario (409 siempre)');

    const name = uniquePermissionName();
    const create = new CreatePermissionPage(page);
    await create.goto();
    await create.fillName(name);
    await create.fillDescription('Permiso creado por test e2e');
    await create.selectModule(combo!.pModule);
    await create.selectAction(combo!.pAction);
    await create.submit();

    await expect(page).toHaveURL(/\/permissions$/, { timeout: DATA_TIMEOUT });
    const list = new PermissionsListPage(page);
    await list.search(name);
    await expect(list.rowFor(name)).toHaveCount(1, { timeout: DATA_TIMEOUT });

    // Limpieza: el id no se ve en la UI, se resuelve por nombre vía API.
    const found = await findPermissionByName(name);
    if (found) await deletePermissionDirect(found.id).catch(() => undefined);
  });

  test('Ver: abre el detalle del permiso creado y muestra sus datos', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const perm = await createDisposablePermission();
    try {
      const list = new PermissionsListPage(page);
      await list.goto();
      await list.search(perm.pName);
      const row = list.rowFor(perm.pName);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Ver detalles').click();
      await expect(page).toHaveURL(/\/permissions\/view\/\d+$/);

      const view = new ViewPermissionPage(page);
      await expect(view.title).toBeVisible({ timeout: DATA_TIMEOUT });
      await expect(view.permissionName(perm.pName)).toBeVisible({ timeout: DATA_TIMEOUT });
      await expect(view.idBadge(perm.id)).toBeVisible();
      await expect(view.moduleBadge(perm.pModule)).toBeVisible();
      await expect(view.actionBadge(perm.pAction)).toBeVisible();
      await expect(view.statusBadge('Habilitado')).toBeVisible();
    } finally {
      await deletePermissionDirect(perm.id).catch(() => undefined);
    }
  });

  test('Editar: carga los datos, renombra el permiso y lo refleja en detalle y listado', async ({
    page,
  }) => {
    test.setTimeout(TEST_TIMEOUT);
    const perm = await createDisposablePermission();
    const newName = `${uniquePermissionName()} Renombrado`;
    try {
      const edit = new EditPermissionPage(page);
      await page.goto(`/permissions/edit/${perm.id}`);
      await expect(edit.nameInput).toHaveValue(perm.pName, { timeout: DATA_TIMEOUT });

      await edit.fillName(newName);
      await expect(edit.changesBanner).toBeVisible();
      await edit.submit();

      // Tras guardar, el formulario redirige al detalle del permiso.
      await expect(page).toHaveURL(/\/permissions\/view\/\d+$/, { timeout: DATA_TIMEOUT });
      const view = new ViewPermissionPage(page);
      await expect(view.permissionName(newName)).toBeVisible({ timeout: DATA_TIMEOUT });

      // El nuevo nombre aparece en el listado; el anterior ya no.
      const list = new PermissionsListPage(page);
      await list.goto();
      await list.search(newName);
      await expect(list.rowFor(newName)).toHaveCount(1, { timeout: DATA_TIMEOUT });
      await list.search(perm.pName);
      await expect(list.noResults).toBeVisible();
    } finally {
      await deletePermissionDirect(perm.id).catch(() => undefined);
    }
  });

  test('Editar: deshabilita el permiso y se persiste', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const perm = await createDisposablePermission({ pEnabled: true });
    try {
      const edit = new EditPermissionPage(page);
      await page.goto(`/permissions/edit/${perm.id}`);
      await expect(edit.nameInput).toHaveValue(perm.pName, { timeout: DATA_TIMEOUT });

      await edit.setEnabled(false);
      await edit.submit();

      await expect(page).toHaveURL(/\/permissions\/view\/\d+$/, { timeout: DATA_TIMEOUT });
      const view = new ViewPermissionPage(page);
      await expect(view.statusBadge('Deshabilitado')).toBeVisible({ timeout: DATA_TIMEOUT });

      // Verificación de persistencia por API.
      const updated = await getPermissionById(perm.id);
      expect(updated.pEnabled).toBe(false);
    } finally {
      await deletePermissionDirect(perm.id).catch(() => undefined);
    }
  });

  test('Editar: cancelar la edición mantiene los datos sin guardar', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const perm = await createDisposablePermission();
    const unsavedName = `${perm.pName} NO GUARDADO`;
    try {
      const edit = new EditPermissionPage(page);
      await page.goto(`/permissions/edit/${perm.id}`);
      await expect(edit.nameInput).toHaveValue(perm.pName, { timeout: DATA_TIMEOUT });

      await edit.fillName(unsavedName);
      await expect(edit.changesBanner).toBeVisible();

      // "Cancelar" con cambios abre el modal de confirmación de salida.
      await edit.cancel();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Salir sin guardar', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Cancelar' }).click();

      // Se mantiene en el formulario (sin navegar) conservando los cambios.
      await expect(page).toHaveURL(/\/permissions\/edit\/\d+$/);
      await expect(edit.nameInput).toHaveValue(unsavedName);
    } finally {
      await deletePermissionDirect(perm.id).catch(() => undefined);
    }
  });

  test('Eliminar: cancelar la confirmación mantiene el permiso', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const perm = await createDisposablePermission();
    try {
      const list = new PermissionsListPage(page);
      await list.goto();
      await list.search(perm.pName);
      const row = list.rowFor(perm.pName);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await list.openDeleteConfirm(perm.pName);
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Eliminar permiso', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Cancelar' }).click();

      await expect(list.rowFor(perm.pName)).toHaveCount(1);
    } finally {
      await deletePermissionDirect(perm.id).catch(() => undefined);
    }
  });

  test('Eliminar: confirma y elimina el permiso creado por el test', async ({ page }) => {
    test.skip(
      !RUN_DELETE_TESTS,
      'Habilita E2E_RUN_DELETE=1 en .env.e2e para ejecutar la prueba destructiva',
    );
    test.setTimeout(TEST_TIMEOUT);
    const perm = await createDisposablePermission();
    try {
      const list = new PermissionsListPage(page);
      await list.goto();
      await list.search(perm.pName);
      const row = list.rowFor(perm.pName);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await list.openDeleteConfirm(perm.pName);
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Eliminar permiso', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Aceptar' }).click();

      await expect(list.rowFor(perm.pName)).toHaveCount(0, { timeout: DATA_TIMEOUT });
    } finally {
      await deletePermissionDirect(perm.id).catch(() => undefined);
    }
  });

  test('Eliminar: un permiso asignado a un rol muestra el error del backend', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const perm = await createDisposablePermission();
    const role = await createDisposableRole(uniqueRoleName(), [perm.id]);
    try {
      const list = new PermissionsListPage(page);
      await list.goto();
      await list.search(perm.pName);
      const row = list.rowFor(perm.pName);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await list.openDeleteConfirm(perm.pName);
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Eliminar permiso', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Aceptar' }).click();

      // El backend responde 400 (permiso en uso) y el frontend muestra el
      // banner genérico de error; la fila permanece en el listado.
      await expect(page.locator('.lp-error')).toContainText(
        'Error al eliminar permiso del servidor',
        { timeout: DATA_TIMEOUT },
      );
      await expect(list.rowFor(perm.pName)).toHaveCount(1);
    } finally {
      await deleteRoleDirect(role.id).catch(() => undefined);
      await deletePermissionDirect(perm.id).catch(() => undefined);
    }
  });

  test('Eliminar: un permiso deshabilitado no muestra el botón de eliminar', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const perm = await createDisposablePermission({ pEnabled: false });
    try {
      const list = new PermissionsListPage(page);
      await list.goto();
      await list.search(perm.pName);
      const row = list.rowFor(perm.pName);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await expect(row.getByText('Inactivo', { exact: true })).toBeVisible();
      await expect(row.getByTitle('Ver detalles')).toHaveCount(1);
      await expect(row.getByTitle('Editar')).toHaveCount(1);
      // La UI oculta el botón "Eliminar" para permisos deshabilitados.
      await expect(row.getByTitle('Eliminar')).toHaveCount(0);
    } finally {
      await deletePermissionDirect(perm.id).catch(() => undefined);
    }
  });
});

test.describe('Permisos (/permissions) — Búsqueda', () => {
  test.describe.configure({ mode: 'serial' });

  test('Búsqueda: filtrar por nombre muestra solo coincidencias', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const permA = await createDisposablePermission();
    const permB = await createDisposablePermission();
    try {
      const list = new PermissionsListPage(page);
      await list.goto();
      await expect(list.loading).toHaveCount(0, { timeout: DATA_TIMEOUT });

      await list.search(permA.pName);
      await expect(list.rowFor(permA.pName)).toHaveCount(1);
      await expect(list.rowFor(permB.pName)).toHaveCount(0);
    } finally {
      await deletePermissionDirect(permA.id).catch(() => undefined);
      await deletePermissionDirect(permB.id).catch(() => undefined);
    }
  });

  test('Búsqueda: sin coincidencias muestra el estado vacío', async ({ page }) => {
    const list = new PermissionsListPage(page);
    await list.goto();
    await expect(list.loading).toHaveCount(0, { timeout: DATA_TIMEOUT });

    await list.search('zzzz-permiso-que-no-existe');
    await expect(list.noResults).toBeVisible();
  });

  test('Búsqueda: limpiar la búsqueda restaura la lista completa', async ({ page }) => {
    const list = new PermissionsListPage(page);
    await list.goto();
    await expect(list.loading).toHaveCount(0, { timeout: DATA_TIMEOUT });

    await list.search('zzzz-permiso-que-no-existe');
    await expect(list.noResults).toBeVisible();

    await list.clearSearch();
    await expect(list.searchInput).toHaveValue('');
    await expect(list.noResults).toHaveCount(0);
  });
});
