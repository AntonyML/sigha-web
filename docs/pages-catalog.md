# Frontend pages — reference

> All page components in `src/presentation/pages/`. Updated whenever a page is added, removed, or its route changes.
>
> See `docs/routes-map.md` for the URL each page is mounted at.

| # | Page (component) | Folder | Route(s) | Wired to flow | Status |
|---|---|---|---|---|---|
| 1 | `LoginPage` (`LoginForm`) | `pages/login/` | `/`, `/login` | `authFlow` | ✅ |
| 2 | `PasswordRecoveryRequestPage` | `pages/login/` | `/auth/forgot-password` | `passwordRecoveryFlow` | ✅ |
| 3 | `PasswordRecoveryVerifyPage` | `pages/login/` | `/auth/recovery/verify` | `passwordRecoveryFlow` | ✅ |
| 4 | `PasswordRecoveryResetPage` | `pages/login/` | `/auth/recovery/reset` | `passwordRecoveryFlow` | ✅ |
| 5 | `TwoFactorVerificationPage` | `pages/login/` | `/auth/verify-2fa` | `twoFactorFlow` | ✅ |
| 6 | `CreateUserPage` | `pages/login/` | `/auth/create-user` | `userManagementFlow` | ✅ |
| 7 | `MainMenuPage` | `pages/main-menu/` | `/main-menu` | (router) | ✅ |
| 8 | `DashboardPage` | `pages/dashboard/` | `/dashboard` | (mixed) | ✅ basic; widgets per role in TareasPendientes §ÉPICA 3 |
| 9 | `OlderAdultsListPage` (`ListVirtualFile`) | `pages/older-adults/` | `/virtualFiles` | `virtualFileFlow` (to be implemented) | 🟡 |
| 10 | `CreateVirtualRecordPage` | `pages/older-adults/` | `/virtualFiles/create` | `virtualFileFlow` | 🟡 |
| 11 | `EditVirtualRecordPage` | `pages/older-adults/` | `/virtualFiles/edit/:id` | `virtualFileFlow` | 🟡 |
| 12 | `ViewAdultsPage` | `pages/older-adults/` | `/virtualFiles/view/:id` | `virtualFileFlow` | 🟡 |
| 13 | `UserListPage` | `pages/users/` | `/users` | `userManagementFlow` | ✅ |
| 14 | `CreateUserPage` | `pages/users/` | `/users/create` | `userManagementFlow` | ✅ |
| 15 | `ViewUserPage` | `pages/users/` | `/users/view/:id` | `userManagementFlow` | ✅ |
| 16 | `EditUserPage` | `pages/users/` | `/users/edit/:id` | `userManagementFlow` | ✅ |
| 17 | `DeletedUsersPage` | `pages/users/` | `/users/deleted` | `userManagementFlow` | ✅ |
| 18 | `ProfilePage` | `pages/profile/` | `/profile` | `profileFlow` | ✅ |
| 19 | `EditProfilePage` | `pages/profile/` | `/profile/edit` | `profileFlow` | ✅ |
| 20 | `RoleListPage` | `pages/roles/` | `/roles` | `roleFlow` | ✅ |
| 21 | `CreateRolePage` | `pages/roles/` | `/roles/create` | `roleFlow` | ✅ |
| 22 | `ViewRolePage` | `pages/roles/` | `/roles/view/:id` | `roleFlow` | ✅ |
| 23 | `EditRolePage` | `pages/roles/` | `/roles/edit/:id` | `roleFlow` | ✅ |
| 24 | `PermissionListPage` | `pages/permissions/` | `/permissions` | `permissionFlow` | ✅ |
| 25 | `CreatePermissionPage` | `pages/permissions/` | `/permissions/create` | `permissionFlow` | ✅ |
| 26 | `ViewPermissionPage` | `pages/permissions/` | `/permissions/view/:id` | `permissionFlow` | ✅ |
| 27 | `EditPermissionPage` | `pages/permissions/` | `/permissions/edit/:id` | `permissionFlow` | ✅ |
| 28 | `ProgramListPage` | `pages/programs/` | `/programs` | `programFlow` (via service) | ✅ |
| 29 | `CreateProgramPage` | `pages/programs/` | `/programs/create` | (direct) | ✅ |
| 30 | `VaccineListPage` | `pages/vaccines/` | `/vaccines` | `vaccineFlow` (via service) | ✅ |
| 31 | `CreateVaccinePage` | `pages/vaccines/` | `/vaccines/create` | (direct) | ✅ |
| 32 | `SubProgramListPage` | `pages/sub-programs/` | `/sub-programs` | (direct) | ✅ |
| 33 | `CreateSubProgramPage` | `pages/sub-programs/` | `/sub-programs/create` | (direct) | ✅ |
| 34 | `TwoFactorPage` | `pages/two-factor/` | `/two-factor` | `twoFactorFlow` | ✅ |
| 35 | `EntranceExitDashboard` | `pages/entrance-exit/` | `/entrance-exit` | `entranceExitFlow` | ✅ |
| 36 | `RegisterEntranceExit` | `pages/entrance-exit/` | `/entrance-exit/register` | `entranceExitFlow` | ✅ |
| 37 | `EntranceExitHistory` | `pages/entrance-exit/` | `/entrance-exit/history` | `entranceExitFlow` | ✅ |
| 38 | `NursingDashboard` | `pages/nursing/` | `/nursing` | `nursingFlow` | ✅ |
| 39 | `ScheduleAppointment` | `pages/nursing/` | `/nursing/appointments/new` | `nursingFlow` | ✅ |
| 40 | `AppointmentHistory` | `pages/nursing/` | `/nursing/appointments/history` | `nursingFlow` | ✅ |
| 41 | `AppointmentDetail` | `pages/nursing/` | `/nursing/appointments/:id/view` | `nursingFlow` | ✅ |
| 42 | `AppointmentResults` | `pages/nursing/` | `/nursing/appointments/:id/results` | `nursingFlow` | ✅ |
| 43 | `CompleteAppointment` | `pages/nursing/` | `/nursing/appointments/:id/complete` | `nursingFlow` | ✅ |
| 44 | `PatientAppointments` | `pages/nursing/` | `/nursing/patients/:patientId/appointments` | `nursingFlow` | ✅ |
| 45 | `AuditMenuPage` | `pages/audit/` | `/audits` | `auditFlow` | ✅ |
| 46 | `AuditListPage` | `pages/audit/` | `/audits/list` | `auditFlow` | ✅ |
| 47 | `ViewAuditPage` | `pages/audit/` | `/audits/view/:id` | `auditFlow` | ✅ |
| 48 | `AuditDashboardPage` | `pages/audit/` | `/audits/dashboard` | `auditFlow` | ✅ |

---

## Pages with stubs but no route (TareasPendientes §ÉPICA 3)

> Backend has the endpoints. Frontend folder exists but no `<Route>` is declared in `App.tsx`.

| Page folder | Status | Backend service to add |
|---|---|---|
| `pages/clinical-history/` | 🟡 partial | `clinicalHistoryService` |
| `pages/clinical-medication/` | 🟡 partial | `clinicalMedicationService` |
| `pages/emergency-contacts/` | 🟡 partial | `emergencyContactService` |
| `pages/medical-records/` | 🟡 partial | `medicalRecordService` |
| `pages/older-adult-family/` | 🟡 partial | `olderAdultFamilyService` |
| `pages/older-adult-updates/` | 🟡 partial | `olderAdultUpdateService` |
| `pages/physiotherapy/` | 🟡 partial | `physiotherapyService` |
| `pages/psychology/` | 🟡 partial | `psychologyService` |
| `pages/social-work/` | 🟡 partial | `socialWorkService` |
| `pages/specialized-appointments/` | 🟡 partial | `specializedAppointmentService` |
| `pages/specialized-areas/` | 🟡 partial | `specializedAreaService` |

---

## Legacy / trash

- `pages/nursing/holaMunco.tsx` — placeholder, **delete** (TareasPendientes §ÉPICA 3.5).

---

## Adding a new page — checklist

1. Create `src/presentation/pages/<feature>/<Name>Page.tsx`.
2. Hook the page to a flow (if it doesn't exist, add it; see `docs/flows-catalog.md`).
3. Add the route in `src/App.tsx` (inside the layout `/*` block).
4. Add a row to the table above.
5. Add a row to `docs/routes-map.md`.
6. Add unit test for any new validation/transformation logic in the flow.
7. Add an e2e test for happy path.
