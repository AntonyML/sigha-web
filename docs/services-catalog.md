# Frontend services — reference

> All HTTP services in `src/services/`. A service is a **pure HTTP** module — no validation, no error wrapping, no business logic. Flow modules wrap services with those concerns.
>
> **Pages must not import services directly.** Always go through a flow.

---

## Currently implemented (17)

| # | Service | File | Backend resource |
|---|---|---|---|
| 1 | `auditService` | `services/auditService.ts` | `/audits/*` |
| 2 | `authService` | `services/authService.ts` | `/auth/*` |
| 3 | `clinicalConditionService` | `services/clinicalConditionService.ts` | `/clinical-conditions/*` |
| 4 | `entranceExitService` | `services/entranceExitService.ts` | `/entrances-exits/*` |
| 5 | `emailService` | `services/emailService.ts` | `/email/*` (Resend) | (replaces legacy `notifuseService`) | ✅ (ÉPICA 1) |
| 6 | `nursingService` | `services/nursingService.ts` | `/nursing/*`, `/specialized-appointments/*`, `/specialized-areas/*` |
| 7 | `permissionEntityService` | `services/permissionEntityService.ts` | (entity lookup for permissions) |
| 8 | `permissionService` | `services/permissionService.ts` | `/permissions/*` |
| 9 | `profileService` | `services/profileService.ts` | `/users/profile` |
| 10 | `programService` | `services/programService.ts` | `/programs/*` |
| 11 | `roleChangesService` | `services/roleChangesService.ts` | `/role-changes/*` |
| 12 | `roleService` | `services/roleService.ts` | `/roles/*` |
| 13 | `subProgramService` | `services/subProgramService.ts` | `/sub-programs/*` |
| 14 | `twoFactorService` | `services/twoFactorService.ts` | `/auth/2fa/*` |
| 15 | `userManagementService` | `services/userManagementService.ts` | `/users/*` |
| 16 | `vaccineService` | `services/vaccineService.ts` | `/vaccines/*` |
| 17 | `virtualFileService` | `services/virtualFileService.ts` | `/virtual-records/*` |

---

## Missing (11) — TODO per TareasPendientes §ÉPICA 3.1

| # | Service to create | Backend resource | Used by flow |
|---|---|---|---|
| 1 | `clinicalHistoryService.ts` | `/clinical-history*` (under `/virtual-records/:id/clinical-history` or own controller) | `clinicalHistoryFlow` |
| 2 | `medicalRecordService.ts` | `/medical-records*` (verify exact path) | `medicalRecordFlow` |
| 3 | `clinicalMedicationService.ts` | `/clinical-medications*` (verify) | `clinicalMedicationFlow` |
| 4 | `specializedAreaService.ts` | `/specialized-areas/*` (currently served by `nursingService`) | `specializedAreaFlow` |
| 5 | `specializedAppointmentService.ts` | `/specialized-appointments/*` (currently served by `nursingService`) | `specializedAppointmentFlow` |
| 6 | `physiotherapyService.ts` | (TBD — physiotherapy sessions) | `physiotherapyFlow` |
| 7 | `psychologyService.ts` | (TBD) | `psychologyFlow` |
| 8 | `socialWorkService.ts` | (TBD) | `socialWorkFlow` |
| 9 | `emergencyContactService.ts` | `/emergency-contacts*` (under virtual-records) | `emergencyContactFlow` |
| 10 | `olderAdultFamilyService.ts` | `/older-adult-family*` | `olderAdultFamilyFlow` |
| 11 | `olderAdultUpdateService.ts` | `/older-adult-updates*` | `olderAdultUpdateFlow` |

---

## Pattern — copy from `vaccineService.ts` or `nursingService.ts`

```ts
// src/services/<feature>Service.ts
import { httpClient } from './httpClient';   // or './http' — verify in repo
import { <Feature> } from '../types/<feature>';

export const <feature>Service = {
  getAll: () =>
    httpClient.get<<Feature>[]>('/<feature-plural>').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<<Feature>>(`/<feature-plural>/${id}`).then((r) => r.data),

  create: (data: Partial<<Feature>>) =>
    httpClient.post<<Feature>>('/<feature-plural>', data).then((r) => r.data),

  update: (id: number, data: Partial<<Feature>>) =>
    httpClient.patch<<Feature>>(`/<feature-plural>/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/<feature-plural>/${id}`),
};
```

---

## Shared HTTP client

A base `httpClient` (or `http.ts`) configures:

- **Base URL** from `VITE_API_URL`.
- **Request interceptor** that adds `Authorization: Bearer <token>` from `localStorage`.
- **Response interceptor** that catches 401, attempts refresh, retries, otherwise redirects to `/login`.
- **Error normalization** (optional) — but flow-level error handling is preferred.

Find the existing file: `src/services/http.ts` or `src/services/httpClient.ts`. If neither exists, create one as part of the first new service.

---

## Deprecations

- `notifuseService.ts` → will be removed in ÉPICA 1. Replace with `emailService.ts` (`/email/password-reset`, `/email/backup-codes`).

---

## Adding a new service — checklist

1. Create `src/services/<feature>Service.ts`.
2. Implement the methods using the shared `httpClient`.
3. Add a row to the "Currently implemented" table above.
4. Add a row to the "Missing" table only after the service is created (move it).
5. If a flow depends on this service but doesn't exist yet, add the flow too.
6. Commit: `feat(<feature>): add <feature>Service`.
