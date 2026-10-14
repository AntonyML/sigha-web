import { test, expect } from '@playwright/test';
import { RolesListPage } from '../../pages/RolesListPage';
import { CreateRolePage } from '../../pages/CreateRolePage';
import { EditRolePage } from '../../pages/EditRolePage';
import { ViewRolePage } from '../../pages/ViewRolePage';
import {
  createDisposableRole,
  deleteRoleDirect,
  findRoleIdByName,
  getPermissionCatalog,
  getRolePermissionIds,
} from '../../support/api';
import { uniqueRoleName } from '../../support/factories';
import { RUN_DELETE_TESTS } from '../../support/config';

/**
 * CRUD del módulo Roles.
 * Rutas reales: /roles (listado), /roles/create, /roles/view/:id, /roles/edit/:id
 * y /role-changes (historial). No existen /roles/new ni /roles/[id]/edit.
 *
 * Los tests que tocan filas crean su PROPIO rol vía API (y lo limpian al
 * final), para no depender de datos preexistentes ni de otros tests. Se corren
 * en modo serial para no saturar la API (throttler global de 100 req/min).
 *
 * Requisitos del entorno:
 *  - La cuenta e2e (E2E_ADMIN_EMAIL) debe tener rol "super admin": los
 *    POST/PATCH/DELETE /roles exigen @Roles(SUPER_ADMIN) + 2FA (el
 *    global-setup ya completa el 2FA si está habilitado).
 *  - El catálogo de permisos (GET /permissions) debe tener al menos un permiso
 *    habilitado; si está vacío, los tests de permisos se saltan.
 *
 * Discrepancias con la descripción de la tarea (comportamiento real):
 *  - Nombre duplicado: el backend devuelve 400 BadRequest con el mensaje
 *    "Ya existe un rol con ese nombre" (NO 409). El frontend lo muestra en un
 *    alert inline (.alert-danger), no en window.alert.
 *  - Los errores de validación del formulario son inline (alert-danger),
 *    nunca window.alert.
 *  - No hay campo descripción ni estado activo/inactivo: el formulario solo
 *    tiene el nombre del rol + permisos por módulo.
 *  - Los permisos son opcionales al crear: NO existe validación de "sin
 *    permisos seleccionados"; el rol se crea sin permisos.
 *  - Eliminar un rol con usuarios asignados NO produce error de integridad:
 *    la tabla user_roles tiene FK ON DELETE CASCADE y users.role_id
 *    ON DELETE SET NULL. El único rol protegido es el del sistema (el botón
 *    "Eliminar" ni siquiera se renderiza y el backend responde 400
 *    "No se puede eliminar un rol del sistema").
 *  - La suite de Permisos (acceso a rutas protegidas por permisos del rol)
 *    NO aplica aquí: requiere una segunda cuenta con un rol de prueba para
 *    verificar redirecciones, y la infraestructura e2e actual solo autentica
 *    al admin (ver e2e/support/auth.ts y global-setup.ts).
 */
const DATA_TIMEOUT = 45_000;
const TEST_TIMEOUT = 120_000;

/**
 * Labels amigables de módulos (espejo de ViewRolePage.tsx) para localizar la
 * card de un módulo en el detalle del rol.
 */
const MODULE_LABELS: Record<string, string> = {
  users: 'Usuarios',
  roles: 'Roles',
  permissions: 'Permisos',
  audits: 'Auditoría',
  programs: 'Programas',
  'sub-programs': 'Subprogramas',
  vaccines: 'Vacunas',
  notifications: 'Notificaciones',
  virtualFiles: 'Residentes',
  'entrance-exit': 'Entradas y Salidas',
  nursing: 'Enfermería',
  'older-adult-family': 'Familiares',
  'older-adult-updates': 'Actualizaciones',
  'emergency-contacts': 'Contactos de Emergencia',
  'medical-records': 'Expedientes Médicos',
  'clinical-medication': 'Medicamentos',
  'clinical-history': 'Condiciones Clínicas',
  'specialized-appointments': 'Citas Especializadas',
  'specialized-areas': 'Áreas Especializadas',
  'two-factor': '2FA',
  dashboard: 'Dashboard',
  profile: 'Perfil',
};

test.describe('Roles (/roles) — Navegación y estructura', () => {
  test('Lista: renderiza la página con sus controles principales', async ({ page }) => {
    const list = new RolesListPage(page);
    await list.goto();

    await expect(list.title).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(list.newRoleButton).toBeVisible();
    await expect(list.historyButton).toBeVisible();
    await expect(list.searchInput).toBeVisible();

    // Espera a que termine la carga para validar la tabla (con sus headers).
    await expect(list.loading).toHaveCount(0, { timeout: DATA_TIMEOUT });
    await expect(page.getByText('Nombre del Rol', { exact: true })).toBeVisible();
    await expect(page.getByText('Acciones', { exact: true })).toBeVisible();
  });

  test('Navegación: el botón "Historial de cambios" enruta a /role-changes', async ({ page }) => {
    const list = new RolesListPage(page);
    await list.goto();

    await list.historyButton.click();
    await expect(page).toHaveURL(/\/role-changes$/);
    await expect(page.getByRole('heading', { name: 'Historial de Cambios de Roles' })).toBeVisible(
      { timeout: DATA_TIMEOUT },
    );
  });
});

test.describe('Roles (/roles) — CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  test('Crear: navega al formulario desde el botón "Nuevo Rol"', async ({ page }) => {
    const list = new RolesListPage(page);
    await list.goto();

    await list.newRoleButton.click();
    await expect(page).toHaveURL(/\/roles\/create$/);
    const create = new CreateRolePage(page);
    await expect(create.title).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(create.nameInput).toBeVisible();
  });

  test('Crear: validación con nombre vacío muestra el error de la app', async ({ page }) => {
    const create = new CreateRolePage(page);
    await create.goto();
    await expect(create.title).toBeVisible({ timeout: DATA_TIMEOUT });

    // Desactiva la validación nativa (required + minLength) para llegar a la
    // validación de la app, que muestra un alert inline (.alert-danger).
    await create.page.locator('form').evaluate((form) => form.setAttribute('novalidate', ''));

    await create.submit();
    await expect(create.errorAlert).toContainText('Por favor ingresa el nombre del rol');
  });

  test('Crear: un nombre duplicado muestra el error del backend (400)', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const { id } = await createDisposableRole(name);
    try {
      const create = new CreateRolePage(page);
      await create.goto();
      await create.fillName(name);
      await create.submit();

      // El backend responde 400 BadRequest con ese mensaje (NO 409 como en
      // programas): el frontend lo pinta en el alert inline.
      await expect(create.errorAlert).toContainText('Ya existe un rol con ese nombre', {
        timeout: DATA_TIMEOUT,
      });
    } finally {
      await deleteRoleDirect(id).catch(() => undefined);
    }
  });

  test('Crear: crea un rol con un permiso y lo muestra en el listado', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const catalog = await getPermissionCatalog();
    const permissionModule = catalog.find((p) => p.pEnabled)?.pModule;
    test.skip(!permissionModule, 'Catálogo de permisos vacío en este entorno');

    const create = new CreateRolePage(page);
    await create.goto();
    await create.fillName(name);
    await create.selectModule(permissionModule!);
    await create.submit();

    await expect(page).toHaveURL(/\/roles$/, { timeout: DATA_TIMEOUT });
    const list = new RolesListPage(page);
    await list.search(name);
    await expect(list.rowFor(name)).toHaveCount(1, { timeout: DATA_TIMEOUT });

    // Limpieza: el id no se ve en la UI, se resuelve por nombre vía API.
    const id = await findRoleIdByName(name);
    if (id) await deleteRoleDirect(id).catch(() => undefined);
  });

  test('Crear: con todos los permisos marcados los guarda en el detalle', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const catalog = await getPermissionCatalog();
    test.skip(catalog.length === 0, 'Catálogo de permisos vacío en este entorno');

    const create = new CreateRolePage(page);
    await create.goto();
    await create.fillName(name);
    await create.selectAllModules();
    await create.submit();

    await expect(page).toHaveURL(/\/roles$/, { timeout: DATA_TIMEOUT });

    // Verificación de persistencia por API: todos los permisos del catálogo otorgados.
    const roleId = await findRoleIdByName(name);
    expect(roleId).not.toBeNull();
    const granted = await getRolePermissionIds(roleId!);
    expect([...granted].sort((a, b) => a - b)).toEqual(
      catalog.map((p) => p.id).sort((a, b) => a - b),
    );

    // El detalle muestra el rol con el total de permisos en las estadísticas.
    // Los stats dependen de un segundo efecto (GET /permissions + role/:id),
    // así que usan DATA_TIMEOUT igual que el título.
    await page.goto(`/roles/view/${roleId}`);
    const view = new ViewRolePage(page);
    await expect(view.title).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(view.roleName(name)).toBeVisible({ timeout: DATA_TIMEOUT });
    await expect(view.grantedStat).toHaveText(String(catalog.length), { timeout: DATA_TIMEOUT });

    await deleteRoleDirect(roleId!).catch(() => undefined);
  });

  test('Ver: abre el detalle del rol creado y muestra sus permisos', async ({ page }) => {
    test.setTimeout(180_000);
    const name = uniqueRoleName();
    const catalog = await getPermissionCatalog();
    const enabledPerm = catalog.find((p) => p.pEnabled);
    test.skip(!enabledPerm, 'Catálogo de permisos vacío en este entorno');

    // Otorga todos los permisos habilitados del primer módulo del catálogo
    // (set determinista para verificar el badge "n/n" y el contador de stats).
    const permissionModule = enabledPerm!.pModule;
    const modulePerms = catalog.filter((p) => p.pModule === permissionModule && p.pEnabled);
    const { id } = await createDisposableRole(
      name,
      modulePerms.map((p) => p.id),
    );
    try {
      const list = new RolesListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Ver detalles').click();
      await expect(page).toHaveURL(/\/roles\/view\/\d+$/);

      const view = new ViewRolePage(page);
      await expect(view.title).toBeVisible({ timeout: DATA_TIMEOUT });
      await expect(view.roleName(name)).toBeVisible({ timeout: DATA_TIMEOUT });
      await expect(view.idBadge(id)).toBeVisible({ timeout: DATA_TIMEOUT });
      await expect(view.grantedStat).toHaveText(String(modulePerms.length), {
        timeout: DATA_TIMEOUT,
      });

      const label = MODULE_LABELS[permissionModule] ?? permissionModule;
      const card = view.moduleCard(label);
      await expect(card).toBeVisible();
      await expect(
        card.getByText(`${modulePerms.length}/${modulePerms.length}`, { exact: true }),
      ).toBeVisible();
    } finally {
      await deleteRoleDirect(id).catch(() => undefined);
    }
  });

  test('Editar: carga los datos, renombra el rol y lo refleja en el listado', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const newName = `${uniqueRoleName()} Renombrado`;
    const { id } = await createDisposableRole(name);
    try {
      const list = new RolesListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await row.getByTitle('Editar').click();
      await expect(page).toHaveURL(/\/roles\/edit\/\d+$/);
      const edit = new EditRolePage(page);
      await expect(edit.nameInput).toHaveValue(name, { timeout: DATA_TIMEOUT });

      await edit.fillName(newName);
      await edit.submit();

      // Tras guardar, el formulario redirige al detalle del rol.
      await expect(page).toHaveURL(/\/roles\/view\/\d+$/, { timeout: DATA_TIMEOUT });
      const view = new ViewRolePage(page);
      await expect(view.roleName(newName)).toBeVisible({ timeout: DATA_TIMEOUT });

      // El nuevo nombre aparece en el listado; el anterior ya no.
      await list.goto();
      await list.search(newName);
      await expect(list.rowFor(newName)).toHaveCount(1, { timeout: DATA_TIMEOUT });
      await list.search(name);
      await expect(list.noResults).toBeVisible();
    } finally {
      await deleteRoleDirect(id).catch(() => undefined);
    }
  });

  test('Editar: agrega un permiso y se persiste', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const catalog = await getPermissionCatalog();
    const perm = catalog.find((p) => p.pEnabled);
    test.skip(!perm, 'Catálogo de permisos vacío en este entorno');

    const { id } = await createDisposableRole(name);
    try {
      const edit = new EditRolePage(page);
      await page.goto(`/roles/edit/${id}`);
      await expect(edit.nameInput).toHaveValue(name, { timeout: DATA_TIMEOUT });

      await edit.permissionCheckbox(perm!.id).check();
      await edit.submit();

      await expect(page).toHaveURL(/\/roles\/view\/\d+$/, { timeout: DATA_TIMEOUT });
      const granted = await getRolePermissionIds(id);
      expect(granted).toContain(perm!.id);
    } finally {
      await deleteRoleDirect(id).catch(() => undefined);
    }
  });

  test('Editar: quita un permiso y se persiste', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const catalog = await getPermissionCatalog();
    const perm = catalog.find((p) => p.pEnabled);
    test.skip(!perm, 'Catálogo de permisos vacío en este entorno');

    const { id } = await createDisposableRole(name, [perm!.id]);
    try {
      const edit = new EditRolePage(page);
      await page.goto(`/roles/edit/${id}`);
      await expect(edit.nameInput).toHaveValue(name, { timeout: DATA_TIMEOUT });

      await edit.permissionCheckbox(perm!.id).uncheck();
      await edit.submit();

      await expect(page).toHaveURL(/\/roles\/view\/\d+$/, { timeout: DATA_TIMEOUT });
      const granted = await getRolePermissionIds(id);
      expect(granted).not.toContain(perm!.id);
    } finally {
      await deleteRoleDirect(id).catch(() => undefined);
    }
  });

  test('Editar: cancelar el diálogo de salida mantiene la edición en curso', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const { id } = await createDisposableRole(name);
    try {
      const edit = new EditRolePage(page);
      await page.goto(`/roles/edit/${id}`);
      await expect(edit.nameInput).toHaveValue(name, { timeout: DATA_TIMEOUT });

      await edit.fillName(`${name} NO GUARDADO`);
      await expect(edit.unsavedWarning).toBeVisible();

      // "Cancelar" con cambios abre el modal de confirmación de salida.
      await edit.cancelButton.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Salir sin guardar', { exact: true })).toBeVisible();

      // Confirmar "Cancelar" en el diálogo descarta la salida: el usuario se
      // queda en el formulario y los cambios sin guardar se conservan.
      await dialog.getByRole('button', { name: 'Cancelar' }).click();

      await expect(edit.nameInput).toHaveValue(`${name} NO GUARDADO`);
      await expect(edit.unsavedWarning).toBeVisible();
    } finally {
      await deleteRoleDirect(id).catch(() => undefined);
    }
  });

  test('Eliminar: cancelar la confirmación mantiene el rol', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const { id } = await createDisposableRole(name);
    try {
      const list = new RolesListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await list.openDeleteConfirm(name);
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Eliminar rol', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Cancelar' }).click();

      await expect(list.rowFor(name)).toHaveCount(1);
    } finally {
      await deleteRoleDirect(id).catch(() => undefined);
    }
  });

  test('Eliminar: confirma y elimina el rol creado por el test', async ({ page }) => {
    test.skip(
      !RUN_DELETE_TESTS,
      'Habilita E2E_RUN_DELETE=1 en .env.e2e para ejecutar la prueba destructiva',
    );
    test.setTimeout(TEST_TIMEOUT);
    const name = uniqueRoleName();
    const { id } = await createDisposableRole(name);
    try {
      const list = new RolesListPage(page);
      await list.goto();
      await list.search(name);
      const row = list.rowFor(name);
      await expect(row).toHaveCount(1, { timeout: DATA_TIMEOUT });

      await list.openDeleteConfirm(name);
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Eliminar rol', { exact: true })).toBeVisible();
      await dialog.getByRole('button', { name: 'Aceptar' }).click();

      await expect(list.rowFor(name)).toHaveCount(0, { timeout: DATA_TIMEOUT });
    } finally {
      await deleteRoleDirect(id).catch(() => undefined);
    }
  });

  // TODO: "Eliminar un rol con usuarios asignados muestra error de integridad".
  // No aplica en este sistema: la migración 012_user_roles_foundation.sql define
  // user_roles.role_id con ON DELETE CASCADE y users.role_id con ON DELETE SET NULL,
  // así que el borrado de un rol nunca falla por integridad referencial (no hay
  // mensaje de error del backend que documentar). El único freno es el de los
  // roles del sistema: la UI oculta el botón "Eliminar" y el backend responde 400
  // con "No se puede eliminar un rol del sistema".
});

test.describe('Roles (/roles) — Búsqueda y filtros', () => {
  test.describe.configure({ mode: 'serial' });

  test('Búsqueda: filtrar por nombre muestra solo coincidencias', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);
    const nameA = uniqueRoleName();
    const nameB = uniqueRoleName();
    const roleA = await createDisposableRole(nameA);
    const roleB = await createDisposableRole(nameB);
    try {
      const list = new RolesListPage(page);
      await list.goto();
      await expect(list.loading).toHaveCount(0, { timeout: DATA_TIMEOUT });

      await list.search(nameA);
      await expect(list.rowFor(nameA)).toHaveCount(1);
      await expect(list.rowFor(nameB)).toHaveCount(0);
    } finally {
      await deleteRoleDirect(roleA.id).catch(() => undefined);
      await deleteRoleDirect(roleB.id).catch(() => undefined);
    }
  });

  test('Búsqueda: sin coincidencias muestra el estado vacío', async ({ page }) => {
    const list = new RolesListPage(page);
    await list.goto();
    await expect(list.loading).toHaveCount(0, { timeout: DATA_TIMEOUT });

    await list.search('zzzz-rol-que-no-existe');
    await expect(list.noResults).toBeVisible();
  });

  test('Búsqueda: limpiar la búsqueda restaura la lista completa', async ({ page }) => {
    const list = new RolesListPage(page);
    await list.goto();
    await expect(list.loading).toHaveCount(0, { timeout: DATA_TIMEOUT });

    await list.search('zzzz-rol-que-no-existe');
    await expect(list.noResults).toBeVisible();

    await list.clearSearch();
    await expect(list.searchInput).toHaveValue('');
    await expect(list.noResults).toHaveCount(0);
  });
});
