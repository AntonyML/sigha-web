# The Flow pattern

> The mandatory `Page → Flow → Service → HTTP` pattern in the Hogar de Ancianos frontend. This is the single most important convention in the frontend codebase.
>
> If you find yourself violating it, stop and refactor.

---

## 1. Why

The system has three layers, each with a single responsibility:

| Layer | Responsibility | What it imports | What it must NOT do |
|---|---|---|---|
| **Page** (React component) | Render UI, capture user input, call a flow, show errors. | `infrastructure/flows`, `presentation/components`, `presentation/hooks`, `presentation/context` | direct HTTP, business logic, validation, transformation |
| **Flow** (`src/infrastructure/flows/<feature>/main.ts`) | Validate inputs, call services, transform responses, wrap errors. | `infrastructure/utils`, `services/<feature>Service`, `types/<feature>`, `flow/validation/*` | JSX, direct UI imports, side-effects on render |
| **Service** (`src/services/<feature>Service.ts`) | Make HTTP calls. | `services/httpClient` (Axios), `types/<feature>` | business logic, validation, user-facing error messages |

The benefit: swapping the HTTP client, adding retry, caching, optimistic updates, mocking for tests — all live in the service. UI-facing logic (errors, transformations) lives in the flow. The page stays dumb.

---

## 2. The data flow

```
┌────────────────────────────────────────────────────────────┐
│  Page  (src/presentation/pages/<feature>/<Name>Page.tsx)   │
│                                                            │
│  const handleSubmit = async (values) => {                  │
│    try {                                                   │
│      setLoading(true);                                     │
│      const result = await <feature>Flow.create(values);    │
│      toast.success('Creado correctamente');                │
│      navigate('/<feature>');                               │
│    } catch (err) {                                         │
│      if (err instanceof FlowError) {                       │
│        toast.error(err.message);  // Spanish              │
│      } else {                                              │
│        toast.error('Error inesperado');                    │
│      }                                                     │
│    } finally {                                             │
│      setLoading(false);                                    │
│    }                                                       │
│  };                                                        │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│  Flow  (src/infrastructure/flows/<feature>/main.ts)        │
│                                                            │
│  export const <feature>Flow = {                            │
│    async create(input) {                                   │
│      validateCreateInput(input);  // throws on invalid     │
│      const data = await <feature>Service.create(input);    │
│      return mapFromApi(data);      // transform → UI       │
│    },                                                      │
│  };                                                        │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│  Service  (src/services/<feature>Service.ts)               │
│                                                            │
│  export const <feature>Service = {                         │
│    create: (data) =>                                       │
│      httpClient.post('/<feature>', data).then(r => r.data),│
│  };                                                        │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼  Axios (with JWT interceptor)
┌────────────────────────────────────────────────────────────┐
│  Backend                                                   │
└────────────────────────────────────────────────────────────┘
```

---

## 3. File layout per flow

```
src/infrastructure/flows/<feature>/
├── main.ts                                # the flow object
├── validation/
│   └── <feature>Validations.ts            # validate<Op>Input functions
└── types.ts (optional)                    # flow-specific types
```

Then export the flow from `src/infrastructure/flows/index.ts`:

```ts
export { <feature>Flow } from './<feature>';
```

---

## 4. Concrete example

### 4.1 Service

```ts
// src/services/clinicalHistoryService.ts
import { httpClient } from './httpClient';
import { ClinicalHistory } from '../types/clinicalHistory';

export const clinicalHistoryService = {
  getAll: () =>
    httpClient.get<ClinicalHistory[]>('/clinical-histories').then((r) => r.data),

  getById: (id: number) =>
    httpClient.get<ClinicalHistory>(`/clinical-histories/${id}`).then((r) => r.data),

  create: (data: Partial<ClinicalHistory>) =>
    httpClient.post<ClinicalHistory>('/clinical-histories', data).then((r) => r.data),

  update: (id: number, data: Partial<ClinicalHistory>) =>
    httpClient.patch<ClinicalHistory>(`/clinical-histories/${id}`, data).then((r) => r.data),

  remove: (id: number) =>
    httpClient.delete(`/clinical-histories/${id}`),
};
```

### 4.2 Flow

```ts
// src/infrastructure/flows/clinical-history/main.ts
import { clinicalHistoryService } from '../../../services/clinicalHistoryService';
import { validateCreateInput, validateUpdateInput } from './validation/clinicalHistoryValidations';
import { FlowError } from '../../utils/flowError';

const mapFromApi = (row: any) => ({
  id: row.id,
  // ... transform backend shape to UI shape
});

export const clinicalHistoryFlow = {
  async getAll() {
    const rows = await clinicalHistoryService.getAll();
    return rows.map(mapFromApi);
  },

  async getById(id: number) {
    if (!id) throw new FlowError('ID requerido', 'INVALID_ID');
    const row = await clinicalHistoryService.getById(id);
    return mapFromApi(row);
  },

  async create(input: any) {
    validateCreateInput(input);
    const row = await clinicalHistoryService.create(input);
    return mapFromApi(row);
  },

  async update(id: number, input: any) {
    if (!id) throw new FlowError('ID requerido', 'INVALID_ID');
    validateUpdateInput(input);
    const row = await clinicalHistoryService.update(id, input);
    return mapFromApi(row);
  },

  async remove(id: number) {
    if (!id) throw new FlowError('ID requerido', 'INVALID_ID');
    await clinicalHistoryService.remove(id);
  },
};
```

### 4.3 Validation

```ts
// src/infrastructure/flows/clinical-history/validation/clinicalHistoryValidations.ts
import { FlowError } from '../../../utils/flowError';

export const validateCreateInput = (input: any) => {
  if (!input || typeof input !== 'object') {
    throw new FlowError('Datos inválidos', 'INVALID_INPUT');
  }
  if (!input.patientId) {
    throw new FlowError('El paciente es obligatorio', 'MISSING_PATIENT');
  }
  // ... more checks
};

export const validateUpdateInput = (input: any) => {
  // ... similar
};
```

### 4.4 Page

```tsx
// src/presentation/pages/clinical-history/CreateClinicalHistoryPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicalHistoryFlow } from '../../../infrastructure/flows';
import { useNotification } from '../../context/NotificationContext';

export default function CreateClinicalHistoryPage() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [form, setForm] = useState({ patientId: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await clinicalHistoryFlow.create(form);
      showToast({ type: 'success', message: 'Historial clínico creado' });
      navigate('/clinical-history');
    } catch (err: any) {
      showToast({ type: 'error', message: err.message ?? 'Error al crear' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Bootstrap form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}
```

---

## 5. Error handling

Use a `FlowError` class so the page can distinguish flow errors from other exceptions:

```ts
// src/infrastructure/utils/flowError.ts
export class FlowError extends Error {
  constructor(public message: string, public code: string, public cause?: unknown) {
    super(message);
    this.name = 'FlowError';
  }
}
```

The flow wraps service errors:

```ts
try {
  return await someService.create(input);
} catch (err) {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 409) {
      throw new FlowError('El recurso ya existe', 'CONFLICT', err);
    }
    if (err.response?.status === 404) {
      throw new FlowError('Recurso no encontrado', 'NOT_FOUND', err);
    }
    throw new FlowError('Error del servidor', 'SERVER_ERROR', err);
  }
  throw new FlowError('Error desconocido', 'UNKNOWN', err);
}
```

The page handles `FlowError` (user-facing) and falls back to a generic message for anything else.

---

## 6. Anti-patterns (DON'T)

- ❌ `import axios from 'axios';` in a page or component.
- ❌ `await axios.get(...)` in a flow without going through a service.
- ❌ `if (response.status === 200) ...` in a page — let the flow translate HTTP into domain.
- ❌ `localStorage.setItem(...)` for auth state outside the auth flow.
- ❌ Validation in a page (e.g. `if (!email) setError(...)`) instead of in the flow.
- ❌ Direct imports of services from pages (e.g. `import { userService } from '../../services/userService';` in a page).
- ❌ Using `any` to bypass the type checker.

---

## 7. Testing the flow

The flow is the easiest layer to test because it has no JSX and no HTTP.

```ts
// src/infrastructure/flows/clinical-history/__tests__/main.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clinicalHistoryFlow } from '../main';
import { clinicalHistoryService } from '../../../../services/clinicalHistoryService';

vi.mock('../../../../services/clinicalHistoryService');

describe('clinicalHistoryFlow.create', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws on missing patientId', async () => {
    await expect(clinicalHistoryFlow.create({})).rejects.toThrow('paciente');
  });

  it('returns the created clinical history', async () => {
    vi.mocked(clinicalHistoryService.create).mockResolvedValue({ id: 1, patientId: 7 });
    const result = await clinicalHistoryFlow.create({ patientId: 7 });
    expect(result.id).toBe(1);
  });
});
```
