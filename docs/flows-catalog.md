# Frontend flows — reference

> All flow modules in `src/infrastructure/flows/`. A flow is a pure TypeScript module that wraps a service with validation, transformation, and error handling. **Pages must call flows, never services directly.**
>
> Exports are listed from `src/infrastructure/flows/index.ts`.

---

## Currently exported (10)

| # | Flow | Folder | Purpose | Pages that consume it |
|---|---|---|---|---|
| 1 | `authFlow` | `flows/auth/` | Login, password recovery orchestration | LoginPage, PasswordRecoveryRequestPage, PasswordRecoveryVerifyPage, PasswordRecoveryResetPage |
| 2 | `userManagementFlow` | `flows/userManagement/` | User CRUD, soft delete, restore | users/* pages, CreateUserPage in login |
| 3 | `roleFlow` | `flows/role/` | Role CRUD | roles/* pages |
| 4 | `auditFlow` | `flows/audit/` | Audit reports listing + detail | audits/* pages |
| 5 | `twoFactorFlow` | `flows/twoFactor/` | 2FA enable/disable/regenerate/verify | TwoFactorPage, TwoFactorVerificationPage |
| 6 | `profileFlow` | `flows/profile/` | User profile fetch/update | ProfilePage, EditProfilePage |
| 7 | `permissionFlow` | `flows/permission/` | Permission CRUD | permissions/* pages |
| 8 | `passwordRecoveryFlow` | `flows/passwordRecovery/` | Recovery request/verify/reset | login/recovery pages |
| 9 | `emailFlow` | `flows/email/` | Resend-backed transactional email (password-reset + 2FA backup codes) | (replaces legacy `notifuseFlow`) | ✅ (ÉPICA 1) |
| 10 | `virtualFileFlow` | `flows/virtualFile/` | **Commented out** in `flows/index.ts` | older-adults/* pages (need to wire) |

---

## NOT yet exported (12) — TODO per TareasPendientes §ÉPICA 3.2

| # | Flow | Folder | Notes | Backend service needed |
|---|---|---|---|---|
| 11 | `clinicalHistoryFlow` | `flows/clinical-history/` | `main.ts` exists; `validation/clinicalHistoryValidations.ts` mentioned; **not exported in `flows/index.ts`** | `clinicalHistoryService` (missing) |
| 12 | `medicalRecordFlow` | `flows/medical-record/` | `main.ts` exists; not exported | `medicalRecordService` (missing) |
| 13 | `clinicalMedicationFlow` | `flows/clinical-medication/` | `main.ts` exists; not exported | `clinicalMedicationService` (missing) |
| 14 | `specializedAreaFlow` | `flows/specialized-area/` | `main.ts` exists; `validation/areaValidations.ts` missing; not exported | `specializedAreaService` (missing) |
| 15 | `specializedAppointmentFlow` | `flows/specialized-appointment/` | `main.ts` exists; not exported | `specializedAppointmentService` (missing) |
| 16 | `physiotherapyFlow` | `flows/physiotherapy/` | `main.ts` exists; not exported | `physiotherapyService` (missing) |
| 17 | `psychologyFlow` | `flows/psychology/` | `main.ts` exists; not exported | `psychologyService` (missing) |
| 18 | `socialWorkFlow` | `flows/social-work/` | `main.ts` exists; not exported | `socialWorkService` (missing) |
| 19 | `nursingFlow` | `flows/nursing/` | `main.ts` exists; not exported | `nursingService` (exists — wire it) |
| 20 | `emergencyContactFlow` | `flows/emergency-contact/` | `main.ts` exists; not exported | `emergencyContactService` (missing) |
| 21 | `olderAdultUpdateFlow` | `flows/older-adult-update/` | `main.ts` exists; not exported | `olderAdultUpdateService` (missing) |
| 22 | `olderAdultFamilyFlow` | `flows/older-adult-family/` | `main.ts` exists; not exported | `olderAdultFamilyService` (missing) |

> ✅ **2026-06-10 — EPICA 3:** All 12 flows are now exported from `flows/index.ts`. Each `main.ts` has an `index.ts` re-export. The flows still use stub implementations; the new `*Service.ts` files provide the real HTTP layer. Follow-up commits should wire each flow to its service.

---

## Pattern reminder (see `flow-pattern.md` for the full guide)

```
Page (React)
   │ const result = await someFlow.doSomething(input);
   ▼
Flow (e.g. clinicalHistoryFlow)
   │  1. validateInput(input)        // throws on invalid
   │  2. const data = await someService.someMethod(input)
   │  3. return transform(data)      // map backend → UI shape
   ▼
Service (pure HTTP)
   │  httpClient.get('/clinical-histories/123')
   ▼
Backend
```

Each flow exports a single object:

```ts
export const clinicalHistoryFlow = {
  async getAll(): Promise<ClinicalHistory[]> { /* ... */ },
  async getById(id: number): Promise<ClinicalHistory> { /* ... */ },
  async create(payload: CreateClinicalHistoryInput): Promise<ClinicalHistory> { /* ... */ },
  async update(id: number, payload: UpdateClinicalHistoryInput): Promise<ClinicalHistory> { /* ... */ },
  async remove(id: number): Promise<void> { /* ... */ },
};
```

---

## Adding a new flow — checklist

1. Create the folder `src/infrastructure/flows/<feature>/`.
2. Create `main.ts` exporting the flow object.
3. Create `validation/<feature>Validations.ts` with `validate<Op>` functions that throw.
4. Add the export in `src/infrastructure/flows/index.ts`.
5. Add a row to the table above (move it from "not exported" to "exported").
6. Make sure the service exists; if not, add it first.

---

## Wiring an existing-but-not-exported flow

```ts
// src/infrastructure/flows/index.ts
export { clinicalHistoryFlow } from './clinical-history';
// ... etc.
```

Then ensure the consuming page imports from `flows` (not from a relative path):

```ts
import { clinicalHistoryFlow } from '../../infrastructure/flows';
```
