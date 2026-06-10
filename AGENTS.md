# AGENTS.md — Frontend (`sigha-web/`)

> **You are an AI agent working on the React/Electron frontend of the Hogar de Ancianos platform.**
> Read the root `AGENTS.md` first, then this file. This file is the source of truth for frontend-specific rules.

---

## 0. Scope and authority

- **You work only inside `E:\Dev\TCU\sigha-web\`.**
- **You do not edit** `backend/`, `database/`, or root files (except with explicit permission).
- **You do not push** to the remote. The user reviews and pushes.
- **You do not amend** published commits.
- **You do not** commit secrets, `.env`, `node_modules/`, `dist/`, `release/`.

---

## 1. Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 5 (dev server on port 5173, web build)
- **Desktop:** Electron 28 (Windows packaging)
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
├── electron/                                # Electron main process
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
npm install
npm run dev              # web (Vite, http://localhost:5173)
npm run dev:electron     # Electron desktop in dev
npm run build            # production web build
npm run test:run         # Vitest
npm run test:e2e         # Playwright
npm run lint
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

## 16. Escalating to the coordinator

If a task touches more than this repo (e.g. needs backend changes too), **stop and tell the user**, or invoke the `fullstack-coordinator` agent from the root `.opencode/agents/`.
