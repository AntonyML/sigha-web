# AGENTS.md — Frontend (`sigha-web/`)

> **You are an AI agent working on the React web frontend of the Hogar de Ancianos platform.**
> This file contains the frontend-specific rules and the shared Git workflow for this repository.

---

## 0. Scope and authority

- **Work only in the `sigha-web` repository.** Cross-repository work is assigned to a separate agent and worktree for each repository.
- **You do not push** to the remote. The user reviews and pushes.
- **You do not amend** published commits.
- **You do not** commit secrets, `.env`, `node_modules/`, `dist/`, `release/`.

## Coordinación de agentes y Git (protocolo multi-agente)

> Protocolo maestro: `C:\DEV\sigha\AGENTS.md` — **manda sobre esta sección**.
> Lo de abajo es el resumen operativo para `sigha-web`; claims, regla STOP y
> limpieza se definen ahí.

### Identidad y alcance

Al iniciar, identifícate con: `Agente: <id/rol> | repo: sigha-web | rama: agent/<id>/<tarea> | worktree: C:\DEV\sigha\_wt\sigha-web\<id>-<tarea> | archivos: <alcance> | base: <sha de dev>`. El coordinador (por defecto: el usuario) asigna archivos; **dos agentes nunca reclaman el mismo archivo**. Contratos compartidos con api/db (endpoints/DTOs ↔ `services/` ↔ esquema) se acuerdan **antes** de trabajar en paralelo, no durante. `App.tsx` (rutas), `services/http*.ts` y `flows/index.ts` son archivos calientes: un solo agente a la vez sobre cada uno.

### Checkout principal: intocable

- `C:\DEV\sigha\sigha-web` **siempre está en `dev`, siempre está limpio y NO se edita.** Solo el coordinador lo toca, y solo para integrar ramas terminadas una por una.
- Prohibido para agentes: editarlo, hacer `checkout`/`switch` en él, commitear secretos, `.env`, `node_modules/`, `dist/`, `release/`.

### Tu worktree (uno por agente × tarea)

- Ruta canónica: `C:\DEV\sigha\_wt\sigha-web\<id>-<tarea>`, rama `agent/<id>/<tarea>` creada desde `origin/dev` recién traído. ⛔ Ruta vieja `~/worktrees/...` deprecada: no crear nada ahí (el worktree existente `codex-nextjs-migration` se termina y se elimina, no se replica).
- Si no existe `origin/dev` ni `dev`, STOP y pide al mantenedor que fije `dev`. `main` queda reservada: no basar ramas en ella ni integrarle nada.
- Secuencia obligatoria (una operación Git a la vez; con lock: esperar, nunca borrar `.lock` con proceso vivo):
  1. `git -C C:\DEV\sigha\sigha-web worktree list` + `status --short --branch` + `log --oneline -5` (solo lectura).
  2. Leer `C:\DEV\sigha\_wt\_claims\sigha-web.json`: si un claim `active` cubre tus archivos → STOP, pide reasignación. Si libre → registra el tuyo **antes** de crear la rama.
  3. `git -C C:\DEV\sigha\sigha-web fetch origin dev` y `worktree add "C:\DEV\sigha\_wt\sigha-web\<id>-<tarea>" -b "agent/<id>/<tarea>" origin/dev`.
  4. `bun install --cwd <tu-worktree>`; copia `.env.example` → `.env` (nunca se commitea; recuerda que `VITE_*` se hornea en build).
- No compartas worktree, rama ni sesión de edición. No hagas `merge` a `dev`, `push`, `rebase` por tu cuenta ni `amend` de commits publicados.
- CodeGraph: cada worktree usa su propio `.codegraph/` (`gentle-ai codegraph init --cwd <tu-worktree>` si falta); no copiar ni compartir índices.

### Regla STOP ante diffs ajenos

Si `status`/`diff` muestra código que no escribiste, otro agente tocó tu archivo o un `log` trae commits inesperados: **para de editar, no sobrescribas, no hagas commit "para salvar lo tuyo"**. Diagnostica en solo lectura (`status`, `diff --stat`, `log --oneline -5` en tu worktree, relee el archivo, compara claims) y reporta al coordinador archivo + símbolo inesperado + tu `baseSha` vs `HEAD` + rama sospechosa. **"Releer y seguir" sin atribuir el cambio está prohibido.** Detalle en `C:\DEV\sigha\AGENTS.md` §5.

### Verificación (en tu worktree)

```powershell
bun run test:run --cwd "C:\DEV\sigha\_wt\sigha-web\<id>-<tarea>"
bun run build --cwd "C:\DEV\sigha\_wt\sigha-web\<id>-<tarea>"
bun run lint --cwd "C:\DEV\sigha\_wt\sigha-web\<id>-<tarea>"
```

No levantes dos `bun run dev` en el puerto `5173`; si necesitas dev server, pide al coordinador un puerto distinto.

### Entrega al coordinador (no integras tú)

Commit en tu rama, `git status` limpio, marca tu claim `done`/`blocked` y entrega: rama, worktree, `baseSha`, `git diff --stat`, archivos tocados, verificaciones con resultado y nota lista para `CHANGELOG.md` (`YYYY-MM-DD | agent/<id>/<tarea> | tipo: resumen | verificación: resultado`). **No edites `CHANGELOG.md`**: solo el coordinador lo actualiza tras integrar.

---

## 1. Stack

- **Runtime / Package Manager:** Bun (v1.3+)
- **Framework:** React 18 + TypeScript
- **Build:** Vite 5 (dev server on port 5173, web build)
- **Styling:** Bootstrap 5 (no inline styles), Tailwind sparingly (legacy)
- **Routing:** React Router v6 (in `App.tsx`)
- **State:** React Context (`NotificationProvider`, `TwoFactorProvider`)
- **HTTP:** Axios with interceptors for JWT
- **UI primitives:** Radix UI for some components
- **Forms:** controlled-component pattern + per-flow validation
- **Tests:** Vitest (unit), Playwright (e2e), legacy Selenium

---

## 2. Folder map (this repo)

```
sigha-web/
├── AGENTS.md                                # this file
├── docs/                                    # AI-facing reference docs
│   ├── pages-catalog.md                     # all 26 pages
│   ├── flows-catalog.md                     # all 22 flows (10 exported)
│   ├── services-catalog.md                  # 17 services + missing
│   ├── routes-map.md                        # App.tsx routes
│   ├── flow-pattern.md                      # the mandatory pattern in detail
│   └── _legacy/                             # archived TAREAS.md (after cleanup)
├── src/
│   ├── App.tsx                              # routes
│   ├── main.tsx                             # entry
│   ├── presentation/
│   │   ├── pages/                           # one folder per page route
│   │   │   ├── login/                       # Login, password recovery, 2FA verify, create-user
│   │   │   ├── main-menu/                   # MainMenuPage
│   │   │   ├── dashboard/                   # DashboardPage
│   │   │   ├── older-adults/                # virtual files (legacy name)
│   │   │   ├── users/
│   │   │   ├── profile/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── programs/
│   │   │   ├── sub-programs/
│   │   │   ├── vaccines/
│   │   │   ├── two-factor/
│   │   │   ├── entrance-exit/
│   │   │   ├── nursing/                     # appointments, dashboard, complete
│   │   │   ├── audit/                       # menu, list, view, dashboard
│   │   │   ├── clinical-history/            # 🟡 partial
│   │   │   ├── clinical-medication/         # 🟡 partial
│   │   │   ├── emergency-contacts/          # 🟡 partial
│   │   │   ├── medical-records/             # 🟡 partial
│   │   │   ├── older-adult-family/          # 🟡 partial
│   │   │   ├── older-adult-updates/         # 🟡 partial
│   │   │   ├── physiotherapy/               # 🟡 partial
│   │   │   ├── psychology/                  # 🟡 partial
│   │   │   ├── social-work/                 # 🟡 partial
│   │   │   ├── specialized-appointments/    # 🟡 partial
│   │   │   └── specialized-areas/           # 🟡 partial
│   │   ├── components/
│   │   │   ├── atoms/                       # small UI primitives
│   │   │   ├── molecules/                   # composed UI
│   │   │   └── organisms/                   # AppLayout, NotificationCenter
│   │   ├── context/                         # global state
│   │   └── hooks/                           # reusable hooks
│   ├── infrastructure/
│   │   ├── flows/                           # ★ business logic (10 exported)
│   │   │   ├── auth/
│   │   │   ├── userManagement/
│   │   │   ├── role/
│   │   │   ├── audit/
│   │   │   ├── twoFactor/
│   │   │   ├── profile/
│   │   │   ├── permission/
│   │   │   ├── passwordRecovery/
│   │   │   ├── notifuse/                    # being replaced by email/
│   │   │   ├── virtualFile/                 # commented out
│   │   │   ├── clinical-history/            # 🟡 not exported
│   │   │   ├── clinical-medication/         # 🟡 not exported
│   │   │   ├── emergency-contact/           # 🟡 not exported
│   │   │   ├── medical-record/              # 🟡 not exported
│   │   │   ├── nursing/                     # 🟡 not exported
│   │   │   ├── older-adult-family/          # 🟡 not exported
│   │   │   ├── older-adult-update/          # 🟡 not exported
│   │   │   ├── physiotherapy/               # 🟡 not exported
│   │   │   ├── psychology/                  # 🟡 not exported
│   │   │   ├── social-work/                 # 🟡 not exported
│   │   │   ├── specialized-appointment/     # 🟡 not exported
│   │   │   ├── specialized-area/            # 🟡 not exported
│   │   │   └── role-changes/                # 🟡 not exported
│   │   ├── storage/                         # localStorage / IndexedDB wrappers
│   │   └── utils/                           # pure utility functions
│   ├── services/                            # ★ HTTP services (17 currently, 11 missing)
│   │   ├── http.ts (or httpClient.ts)       # base Axios instance with interceptors
│   │   ├── authService.ts
│   │   ├── userManagementService.ts
│   │   ├── roleService.ts
│   │   ├── permissionService.ts
│   │   ├── permissionEntityService.ts
│   │   ├── profileService.ts
│   │   ├── twoFactorService.ts
│   │   ├── notifuseService.ts               # 🟡 deprecated
│   │   ├── virtualFileService.ts
│   │   ├── nursingService.ts
│   │   ├── vaccineService.ts
│   │   ├── programService.ts
│   │   ├── subProgramService.ts
│   │   ├── clinicalConditionService.ts
│   │   ├── entranceExitService.ts
│   │   ├── auditService.ts
│   │   └── roleChangesService.ts
│   ├── types/                               # shared TypeScript types
│   ├── assets/                              # icons, images, styles
│   ├── config/
│   ├── test/
│   ├── tests/
│   └── utils/
├── public/
├── tests/                                   # legacy e2e (Selenium/JMeter)
├── docs/                                    # (also holds _legacy/ after cleanup)
├── package.json
├── tareas.md                                # (legacy, Spanish, CI/CD history)
└── tsconfig.json
```

---

## 3. Routing (from `App.tsx`)

Two zones:

1. **No-layout routes** (no `AppLayout`):
   - `/` and `/login` → `LoginPage`
   - `/auth/forgot-password`
   - `/auth/recovery/verify`
   - `/auth/recovery/reset`
   - `/auth/verify-2fa`
   - `/auth/create-user`

2. **Layout routes** (wrapped in `AppLayout`):
   - `main-menu`, `dashboard`
   - `virtualFiles`, `virtualFiles/create`, `virtualFiles/edit/:id`, `virtualFiles/view/:id`
   - `users`, `users/create`, `users/view/:id`, `users/edit/:id`, `users/deleted`
   - `profile`, `profile/edit`
   - `roles`, `roles/create`, `roles/view/:id`, `roles/edit/:id`
   - `permissions`, `permissions/create`, `permissions/view/:id`, `permissions/edit/:id`
   - `programs`, `programs/create`
   - `vaccines`, `vaccines/create`
   - `sub-programs`, `sub-programs/create`
   - `two-factor`
   - `entrance-exit`, `entrance-exit/register`, `entrance-exit/history`
   - `nursing`, `nursing/appointments/new`, `nursing/appointments/history`, `nursing/appointments/:id/view`, `nursing/appointments/:id/results`, `nursing/appointments/:id/complete`, `nursing/patients/:patientId/appointments`
   - `audits`, `audits/list`, `audits/view/:id`, `audits/dashboard`

For the full routes map see `docs/routes-map.md`.

> 🚨 **Missing routes** (no `<Route>` declared, but the backend has the endpoints): `physiotherapy`, `psychology`, `social-work`, `clinical-history`, `clinical-medication`, `medical-records`, `emergency-contacts`, `older-adult-family`, `older-adult-updates`, `specialized-appointments`, `specialized-areas`. See TareasPendientes §ÉPICA 3.

---

## 4. The Flow pattern (mandatory)

`Page → Flow → Service → HTTP` — see `docs/flow-pattern.md` for the full guide.

**Why this matters:**
- UI logic in pages stays minimal.
- Validation and error wrapping live in flows.
- Services are pure HTTP and easy to mock.
- Swapping the HTTP client, adding retry, caching, optimistic updates, etc. all live in the service.

---

## 5. Flows (currently)

10 exported, 12 not yet exported (see `docs/flows-catalog.md`).

To add a new flow:
1. Create `src/infrastructure/flows/<feature>/main.ts` exporting `<feature>Flow` (object with async methods).
2. Create `src/infrastructure/flows/<feature>/validation/<feature>Validations.ts`.
3. Add the export in `src/infrastructure/flows/index.ts`.
4. Update `docs/flows-catalog.md`.

---

## 6. Services

17 implemented, 11 missing (see `docs/services-catalog.md`).

To add a new service:
1. Create `src/services/<feature>Service.ts` exporting a `<feature>Service` object with HTTP methods.
2. Reuse the shared Axios instance (set up JWT interceptor and error normalization).
3. Update `docs/services-catalog.md`.

---

## 7. Pages

26 pages total. See `docs/pages-catalog.md`.

To add a new page:
1. Create the page component in `src/presentation/pages/<feature>/<Name>Page.tsx`.
2. Add the route in `src/App.tsx` (inside the layout `/*` block).
3. Update `docs/pages-catalog.md` and `docs/routes-map.md`.
4. Wire the page to a flow (and ensure the flow + service exist).

---

## 8. UI conventions

- **UI strings in Spanish** ("Iniciar sesión", "Crear usuario", etc.).
- **No inline styles.** Use Bootstrap 5 classes or component-scoped CSS.
- **Bootstrap 5 first.** Tailwind is allowed for utilities but not for full layouts.
- **Use atomic components:** atoms → molecules → organisms.
- **Confirm destructive actions** (sweetalert2 is installed).
- **Use toasts** via the `NotificationProvider` for success/error feedback.

---

## 9. Forms

- Controlled components (`useState` for each field, or a single `useState({ ... })`).
- Validate with the flow's `validation/<feature>Validations.ts` before submission.
- Show field errors near the field (Bootstrap `is-invalid` + `invalid-feedback`).
- Disable submit button while pending.
- Show server errors via the `NotificationProvider` toast.

---

## 10. Auth state in the frontend

- On successful login, store the access token + refresh token in `localStorage` (or `sessionStorage`).
- Add the access token to every request via an Axios request interceptor.
- On 401, attempt a refresh, then retry. If refresh fails, redirect to `/login`.
- Wrap the layout routes with a `<RequireAuth>` component (or similar) that redirects to `/login` if no token.
- 2FA flow: if `/auth/login` returns `requires2fa: true`, redirect to `/auth/verify-2fa` with the `tempToken`.

---

## 11. Env variables

Frontend env vars are prefixed with `VITE_` and baked at build time.

| Var | Example | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Backend base URL |
| `VITE_ENABLE_2FA` | `false` | Dev shortcut: skip real 2FA |
| `VITE_*` | — | Add as needed; document in `.env.example` |

---

## 12. Running locally

```bash
cd sigha-web
bun install
bun run dev              # web (Vite, http://localhost:5173)
bun run build            # production web build
bun run test:run         # Vitest
bun run test:e2e         # Playwright
bun run lint
```

---

## 13. Testing

- **Unit (Vitest):** `*.test.ts` or `*.spec.ts` next to the code.
- **E2E (Playwright):** `tests/e2e/` or `src/tests/`.
- **Legacy E2E (Selenium):** `tests/` — keep for Jenkins pipeline parity.

For a new feature:
- Add unit tests for any new validation / transformation logic (in flow).
- Add a unit test for the service (mock the HTTP client).
- Add at least one happy-path e2e test if the feature is user-facing.

---

## 14. Common pitfalls

- ❌ `axios` import in a page or component.
- ❌ Business logic in a service.
- ❌ `any` left in the code (ESLint will flag it).
- ❌ Inline `style={{ ... }}` (use Bootstrap or component CSS).
- ❌ Calling `notifuseService` — it's deprecated. Use `emailService` after ÉPICA 1.
- ❌ Forgetting to add a `<Route>` in `App.tsx` after creating a page.
- ❌ Hardcoding the API URL — use `import.meta.env.VITE_API_URL` or the shared `httpClient`.

---

## 15. Documentation in this repo

| File | Purpose |
|---|---|
| `AGENTS.md` | This file |
| `docs/pages-catalog.md` | All 26 pages |
| `docs/flows-catalog.md` | All 22 flows |
| `docs/services-catalog.md` | All 17 services + missing 11 |
| `docs/routes-map.md` | Routes from `App.tsx` |
| `docs/flow-pattern.md` | `Page → Flow → Service → HTTP` in detail |
| `docs/_legacy/` | Archived `TAREAS.md` (after cleanup) |
| `tareas.md` | Legacy Spanish doc (CI/CD history) — keep for reference |

---
