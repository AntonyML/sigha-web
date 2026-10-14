# AGENTS.md — Frontend (sigha-web/)

> Instrucciones locales para agentes que trabajan en el frontend Next.js de SIGHA.

## 0. Alcance y Git

- Trabaja solo en el repositorio sigha-web; coordina trabajo de API o base de datos como tareas en su propio repositorio.
- No hagas push ni amend de commits publicados. El humano revisa y publica `dev` y `main`.
- No confirmes secretos, .env, node_modules, artefactos de build ni release.
- `dev` es la rama de integración. Trabaja en un worktree `_wt\sigha-web\<taskId>` y una rama `task/<taskId>` creada desde `origin/dev`; `main` queda reservada.
- La identidad de la tarea es el `taskId` (`sigha-web-<yyyymmdd>-<rand4>`), no el nombre de la herramienta. No compartas worktree, rama ni sesión de edición. Ejecuta como máximo un comando Git a la vez por worktree.
- La integración a `dev` la hace el propio agente bajo el lock `dev-sigha-web` (merge, re-verificación en `dev` y limpieza). El humano solo hace `push`.
- El agente actualiza `CHANGELOG.md` al integrar (dentro del lock) y usa el formato `YYYY-MM-DD | <taskId> | tipo: resumen | verificación: resultado`.

### CodeGraph

- Para mapas de repositorio, arquitectura, flujos, dependencias, referencias e impacto, consulta CodeGraph antes de búsquedas amplias.
- Cada worktree debe tener su propio .codegraph/. Si falta y CodeGraph está disponible, ejecuta gentle-ai codegraph init --cwd <raíz-del-worktree>.
- No copies, enlaces ni reutilices índices de otro checkout. Después de cambios, deja que el watcher actualice el índice; usa codegraph sync solo si está apagado o informa archivos obsoletos.
- Nunca ejecutes codegraph uninit, install, uninstall ni upgrade. Usa codegraph index solo para recuperar un índice corrupto.


## Coordinación y Git (protocolo multi-agente)

> Protocolo maestro: `C:\DEV\sigha\AGENTS.md` — **manda sobre esta sección**.
> Registro: `C:\DEV\sigha\_wt\_registry\sigha-web.jsonl` (formato en `_wt\_registry\README.md`).

### Identidad y alcance

Al iniciar, identifícate con:

```
Agente: <herramienta>/<modelo> | repo: sigha-web | taskId: <taskId o "(por reclamar)">
| rama: task/<taskId> | worktree: C:\DEV\sigha\_wt\sigha-web\<taskId>
| archivos: <alcance> | base: <sha de dev>
```

La identidad es el **`taskId`** (`sigha-web-<yyyymmdd>-<rand4>`), no la herramienta. La herramienta/modelo se registran solo como `actor`. Contratos compartidos con api/db (endpoints/DTOs ↔ `services/` ↔ esquema) se acuerdan **antes** de trabajar en paralelo, no durante. `App.tsx` (rutas), `services/http*.ts` y `flows/index.ts` son archivos calientes: una tarea a la vez sobre cada uno.

### Checkout principal: solo se integra

- `C:\DEV\sigha\sigha-web` **siempre está en `dev`, siempre está limpio.** No se edita a mano: solo se integra ahí una rama terminada, bajo el lock `dev-sigha-web`.
- Prohibido para agentes: editarlo directamente, hacer `checkout`/`switch` en él, commitear secretos, `.env`, `node_modules/`, `dist/`, `release/`.

### Tu worktree (uno por tarea)

- Ruta canónica: `C:\DEV\sigha\_wt\sigha-web\<taskId>`, rama `task/<taskId>` creada desde `origin/dev` recién traído. ⛔ Ruta vieja `~/worktrees/...` deprecada: no crear nada ahí.
- Si no existe `origin/dev` ni `dev`, STOP y pide al humano que fije `dev`. `main` queda reservada: no basar ramas en ella ni integrarle nada.
- Secuencia obligatoria (una operación Git a la vez; con lock: esperar, nunca borrar `.lock` con proceso vivo):
  1. `git -C C:\DEV\sigha\sigha-web worktree list` + `status --short --branch` + `log --oneline -5` (solo lectura).
  2. Preflight (§6 del protocolo): lee los tres ledgers; si hay solape de archivos o tarea `blocked` con pregunta abierta → HARD STOP.
  3. Bajo `registry-sigha-web.lock`: si ningún claim abierto cubre tus archivos → appendea tu `claim` (`status: in_progress`) con un `taskId` único.
  4. `git -C C:\DEV\sigha\sigha-web fetch origin dev` y `worktree add "C:\DEV\sigha\_wt\sigha-web\<taskId>" -b "task/<taskId>" origin/dev`.
  5. `bun install --cwd <tu-worktree>`; copia `.env.example` → `.env` (nunca se commitea; recuerda que `NEXT_PUBLIC_*` se hornea en build).
- No compartas worktree, rama ni sesión de edición. No hagas `push` ni `rebase` por tu cuenta ni `amend` de commits publicados.
- CodeGraph: cada worktree usa su propio `.codegraph/` (`gentle-ai codegraph init --cwd <tu-worktree>` si falta); no copiar ni compartir índices.

### Regla STOP ante diffs ajenos

Si `status`/`diff` muestra código que no escribiste, otro proceso tocó tu archivo o un `log` trae commits inesperados: **para de editar, no sobrescribas, no hagas commit "para salvar lo tuyo"**. Diagnostica en solo lectura (`status`, `diff --stat`, `log --oneline -5` en tu worktree, relee el archivo, compara con tu claim y con los ledgers) y reporta al humano archivo + símbolo inesperado + tu `baseSha` vs `HEAD` + `taskId`/rama sospechosa. **"Releer y seguir" sin atribuir el cambio está prohibido.** Detalle en `C:\DEV\sigha\AGENTS.md` §7.

### Verificación (en tu worktree)

```powershell
bun run test:run --cwd "C:\DEV\sigha\_wt\sigha-web\<taskId>"
bun run build --cwd "C:\DEV\sigha\_wt\sigha-web\<taskId>"
bun run lint --cwd "C:\DEV\sigha\_wt\sigha-web\<taskId>"
```

No levantes dos `bun run dev` en el puerto `3001`; si necesitas dev server, usa un puerto distinto por worktree.

### Entrega e integración (tú integras; el humano solo hace `push`)

1. Commit en tu rama, `git status` limpio, y appendea `event: "done"` con `branch`, `worktree`, `baseSha`, `git diff --stat`, archivos y verificaciones con resultado.
2. Bajo el lock `dev-sigha-web`: con el checkout principal en `dev` y limpio, `fetch origin dev` y `merge --no-ff "task/<taskId>"`. Si hay conflicto → `merge --abort`, marca `blocked`, conserva el worktree, HARD STOP.
3. **Re-verifica en `dev`** (test:run, build, lint y una comprobación funcional del flujo afectado). Que pase en el worktree no basta.
4. Si pasa: actualiza `CHANGELOG.md`, commitea en `dev`, appendea `event: "integrated"` con `mergeSha`/`devSha`, y limpia worktree + rama (`worktree remove`, `branch -d`, `worktree prune`).
5. Si falla la re-verificación: `git revert -m 1 <mergeSha>`, marca `blocked`, conserva el worktree y HARD STOP.
6. **No hagas `push`.** El humano revisa `dev` y publica `dev` y `main`.

Formato de la línea de `CHANGELOG.md`: `YYYY-MM-DD | <taskId> | tipo: resumen | verificación: resultado`.

---


## 1. Stack

- Gestor: Bun 1.3+.
- Web: Next.js 16 App Router, React 19 y TypeScript.
- Puerto web: 3001. NestJS usa 3000 por defecto.
- Bootstrap 5 y Tailwind se mantienen durante la transición de pantallas.
- HTTP: Axios en adaptadores de src/infrastructure/api.
- Pruebas: Vitest y Playwright. Vite permanece como dependencia interna de Vitest; ya no sirve ni empaqueta la web.

## 2. Estructura

    src/
    ├── app/                         rutas, layouts, metadata y composición
    │   ├── (marketing)/             superficies públicas y SEO
    │   ├── (auth)/                  login y recuperación
    │   └── (workspace)/             producto, sesión, permisos y 2FA
    ├── modules/<domain>/
    │   ├── application/flows/       casos de uso y validaciones actuales
    │   └── presentation/pages/      pantallas del dominio
    ├── application/                 fachada de casos de uso compartidos
    ├── infrastructure/              API y almacenamiento
    └── shared/                      UI, hooks, tipos, config, estilos y utilidades

Agrega domain/, application/, infrastructure/ y presentation/ dentro de un módulo cuando haya código real para esas capas. No crees carpetas vacías. Los servicios API siguen temporalmente centralizados en src/infrastructure/api/services.

## 3. Dependencias y SOLID

Dirección objetivo: presentation → application → domain. Infrastructure implementa los puertos de application/domain; app compone módulos, layouts y adaptadores.

- Las páginas presentan datos e interacción; no agregues Axios ni reglas de negocio a pantallas nuevas.
- Los casos de uso coordinan operaciones; no importan Next.js, React, Axios ni almacenamiento del navegador.
- Define puertos pequeños en los límites de API, almacenamiento e integración. Implementa los puertos en infrastructure y compón adaptadores en app.
- Mantén responsabilidades pequeñas, contratos sustituibles e interfaces enfocadas. No añadas abstracciones sin una frontera o consumidor concreto.
- Mapea DTO de NestJS en infraestructura. El dominio no depende del formato HTTP.
- Usa contratos públicos entre módulos; evita imports a archivos internos de otro dominio.

Las pantallas migradas aún tienen imports directos a servicios y algunos flujos usan adaptadores concretos. Refactoriza por dominio según docs/architecture/sigha-nextjs-implementation-plan.md; no declares terminada la inversión de dependencias hasta retirar esos imports.

## 4. Next.js y rutas

- Las rutas viven en src/app; los grupos entre paréntesis cambian layouts sin cambiar la URL.
- / es marketing. /login y /auth/* pertenecen a autenticación. Las rutas de producto viven en (workspace).
- Las pantallas viven en src/modules/<domain>/presentation/pages; page.tsx selecciona y envuelve la pantalla, no concentra lógica de negocio.
- Usa segmentos [id] de Next para parámetros y conserva URLs del producto durante la migración.
- Mantén marketing como Server Components. Añade "use client" solo por estado, eventos, APIs del navegador o hooks cliente.
- Usa next/link y next/navigation para código nuevo. src/shared/navigation.ts es un adaptador temporal para pantallas existentes.
- useSearchParams en componentes cliente prerenderizados requiere Suspense.
- Los guards del navegador son UX. NestJS sigue siendo autoridad para permisos, sesión y aislamiento.

## 5. Sesión y SaaS

- El contrato actual mantiene tokens en localStorage por compatibilidad. No agregues tokens duraderos nuevos ahí; acuerda cookies HttpOnly, Secure y SameSite con el backend antes de cambiar el contrato.
- No uses un tenant ID del navegador como autorización. El servidor debe resolver tenant desde una sesión validada y limitar cada operación y trabajo asíncrono.
- No inventes URL o selector de tenant hasta acordar identidad, selección, cambio y scoping con NestJS.
- No registres tokens, datos clínicos, información identificable de residentes ni códigos de recuperación.
- Mantén providers de marketing, auth y workspace en sus route groups salvo que el estado sea transversal.

## 6. API y entorno

- URL del navegador: NEXT_PUBLIC_API_URL, normalmente /api/backend.
- Origen privado NestJS: BACKEND_API_URL, por defecto http://localhost:3000. No lo expongas con NEXT_PUBLIC_.
- El proxy está en next.config.ts. Conserva contratos NestJS salvo coordinación explícita en ambos repositorios.
- Lee variables desde src/shared/config/app.config.ts. No hardcodees orígenes.
- Infrastructure contiene HTTP/DTO; application contiene orquestación y reglas de aplicación.

## 7. UI y estilos

- UI en español salvo requerimiento de localización.
- No reintroduzcas Atomic Design (atoms, molecules, organisms). Organiza src/shared/ui por función: forms, navigation, feedback, overlays, data display e icons.
- UI compartido no conoce reglas de negocio; UI de dominio pertenece al módulo.
- Importa CSS global solo desde src/app/layout.tsx. Para código nuevo, prefiere CSS Modules o estilos acotados.
- Elimina legacy-pages.css pantalla por pantalla cuando deje de usarse.
- Conserva teclado, foco visible, semántica, mensajes accesibles y responsividad.

## 8. Comandos

    bun install
    bun run dev       # Next.js, http://localhost:3001
    bun run build     # producción y TypeScript
    bun run start     # producción, puerto 3001
    bun run lint
    bun run test:run
    bun run test:e2e

Playwright usa E2E_WEB_URL=http://localhost:3001 y E2E_API_URL=http://localhost:3000.

## 9. Verificación

- Ejecuta bun run build cuando se cambien rutas, configuración Next o prerender y sea necesario verificar compilación.
- Ejecuta pruebas puntuales solo cuando se soliciten o sean requeridas expresamente; no ejecutes la suite completa por defecto.
- Distingue build, lint, unitarias y e2e en la entrega. No reportes pruebas que no se ejecutaron.

## 10. Documentación

- README.md: instalación y resumen arquitectónico.
- docs/routes-map.md: inventario público, auth y workspace.
- docs/architecture/sigha-nextjs-implementation-plan.md: estado de migración, SOLID, auth, tenancy y despliegue.
- Actualiza el plan y el mapa cuando cambien route groups o límites de módulos.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
