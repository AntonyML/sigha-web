# Frontend routes — reference

> All routes declared in `src/App.tsx`. Two zones: **no-layout** (auth) and **layout** (everything inside `AppLayout`).
>
> Run `npm run dev` and check the browser address bar; or use React Router DevTools.

---

## No-layout routes (no `AppLayout`)

Mounted directly under `<Routes>` (before the `/*` layout route).

| Path | Page | Component | Status |
|---|---|---|---|
| `/` | Login | `LoginForm` (alias of `LoginPage`) | ✅ |
| `/login` | Login | same | ✅ |
| `/auth/forgot-password` | Password Recovery Request | `PasswordRecoveryRequestPage` | ✅ |
| `/auth/recovery/verify` | Password Recovery Verify | `PasswordRecoveryVerifyPage` | ✅ |
| `/auth/recovery/reset` | Password Recovery Reset | `PasswordRecoveryResetPage` | ✅ |
| `/auth/verify-2fa` | Two-Factor Verification | `TwoFactorVerificationPage` | ✅ |
| `/auth/create-user` | Create User (initial setup) | `CreateUserPage` | ✅ |

> All auth routes are public — no JWT required. The `authFlow` and `passwordRecoveryFlow` manage the local state.

---

## Layout routes (wrapped in `AppLayout`)

Mounted under `<Route path="/*" element={<AppLayout>...</AppLayout>} />`.

### Main

| Path | Page |
|---|---|
| `/main-menu` | `MainMenuPage` |
| `/dashboard` | `DashboardPage` |

### Older adults (a.k.a. virtual files)

| Path | Page |
|---|---|
| `/virtualFiles` | `OlderAdultsListPage` (`ListVirtualFile`) |
| `/virtualFiles/create` | `CreateVirtualRecordPage` |
| `/virtualFiles/edit/:id` | `EditVirtualRecordPage` |
| `/virtualFiles/view/:id` | `ViewAdultsPage` |

### Users

| Path | Page |
|---|---|
| `/users` | `UserListPage` |
| `/users/create` | `CreateUserPage` |
| `/users/view/:id` | `ViewUserPage` |
| `/users/edit/:id` | `EditUserPage` |
| `/users/deleted` | `DeletedUsersPage` |

### Profile

| Path | Page |
|---|---|
| `/profile` | `ProfilePage` |
| `/profile/edit` | `EditProfilePage` |

### Roles

| Path | Page |
|---|---|
| `/roles` | `RoleListPage` |
| `/roles/create` | `CreateRolePage` |
| `/roles/view/:id` | `ViewRolePage` |
| `/roles/edit/:id` | `EditRolePage` |

### Permissions

| Path | Page |
|---|---|
| `/permissions` | `PermissionListPage` |
| `/permissions/create` | `CreatePermissionPage` |
| `/permissions/view/:id` | `ViewPermissionPage` |
| `/permissions/edit/:id` | `EditPermissionPage` |

### Programs and sub-programs

| Path | Page |
|---|---|
| `/programs` | `ProgramListPage` |
| `/programs/create` | `CreateProgramPage` |
| `/sub-programs` | `SubProgramListPage` |
| `/sub-programs/create` | `CreateSubProgramPage` |

### Vaccines

| Path | Page |
|---|---|
| `/vaccines` | `VaccineListPage` |
| `/vaccines/create` | `CreateVaccinePage` |

### Two-factor

| Path | Page |
|---|---|
| `/two-factor` | `TwoFactorPage` |

### Entrance / exit

| Path | Page |
|---|---|
| `/entrance-exit` | `EntranceExitDashboard` |
| `/entrance-exit/register` | `RegisterEntranceExit` |
| `/entrance-exit/history` | `EntranceExitHistory` |

### Nursing

| Path | Page |
|---|---|
| `/nursing` | `NursingDashboard` |
| `/nursing/appointments/new` | `ScheduleAppointment` |
| `/nursing/appointments/history` | `AppointmentHistory` |
| `/nursing/appointments/:id/view` | `AppointmentDetail` |
| `/nursing/appointments/:id/results` | `AppointmentResults` |
| `/nursing/appointments/:id/complete` | `CompleteAppointment` |
| `/nursing/patients/:patientId/appointments` | `PatientAppointments` |

### Audits

| Path | Page |
|---|---|
| `/audits` | `AuditMenuPage` |
| `/audits/list` | `AuditListPage` |
| `/audits/view/:id` | `ViewAuditPage` |
| `/audits/dashboard` | `AuditDashboardPage` |

---

## Routes NOT yet declared (TODO per TareasPendientes §ÉPICA 3.4-3.5)

> The corresponding backend endpoints exist; the frontend page folder exists but the route is missing.

| Planned path | Page folder | Status |
|---|---|---|
| `/clinical-history` | `pages/clinical-history/` | 🟡 |
| `/clinical-medication` | `pages/clinical-medication/` | 🟡 |
| `/medical-records` | `pages/medical-records/` | 🟡 |
| `/emergency-contacts` | `pages/emergency-contacts/` | 🟡 |
| `/older-adult-family` | `pages/older-adult-family/` | 🟡 |
| `/older-adult-updates` | `pages/older-adult-updates/` | 🟡 |
| `/physiotherapy` | `pages/physiotherapy/` | 🟡 |
| `/psychology` | `pages/psychology/` | 🟡 |
| `/social-work` | `pages/social-work/` | 🟡 |
| `/specialized-appointments` | `pages/specialized-appointments/` | 🟡 |
| `/specialized-areas` | `pages/specialized-areas/` | 🟡 |

> ✅ **2026-06-10 — EPICA 3:** All 22 routes (11 list + 11 create) are declared in `App.tsx`. Pages use a shared `ModulePlaceholder` component and call the corresponding flow. The flows still return errors until the real services are wired in.

---

## Trash to remove

- `pages/nursing/holaMunco.tsx` — placeholder (TareasPendientes §ÉPICA 3.5). ✅ removed 2026-06-10.

---

## Adding a new route — checklist

1. Create the page component in `src/presentation/pages/<feature>/<Name>Page.tsx`.
2. Import the page at the top of `src/App.tsx`.
3. Add `<Route path="<path>" element={<PageComponent />} />` inside the layout `<Routes>`.
4. If the route is **public** (rare), add it in the no-layout `<Routes>` block instead.
5. Add a row to this file and to `docs/pages-catalog.md`.
6. Verify by `npm run dev` and navigating.
