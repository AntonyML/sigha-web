# Legacy TAREAS.md archive

> **DO NOT use these files for new work.** They are kept only for historical reference. The single source of truth for planned work is the **root** `TareasPendientes.md` (`E:\Dev\TCU\TareasPendientes.md`). The catalogs for the codebase live in:
>
> - `E:\Dev\TCU\frontend_proton_react_hogar_de_ancianos\docs\pages-catalog.md`
> - `E:\Dev\TCU\frontend_proton_react_hogar_de_ancianos\docs\flows-catalog.md`
> - `E:\Dev\TCU\frontend_proton_react_hogar_de_ancianos\docs\services-catalog.md`
> - `E:\Dev\TCU\frontend_proton_react_hogar_de_ancianos\docs\routes-map.md`
> - `E:\Dev\TCU\backend_nest_js_hogar_de_ancianos\docs\api-endpoints.md`
> - `E:\Dev\TCU\backend_nest_js_hogar_de_ancianos\docs\modules.md`
> - `E:\Dev\TCU\backend_nest_js_hogar_de_ancianos\docs\entities.md`
> - `E:\Dev\TCU\database_mysql_hogar_de_ancianos\docs\tables-catalog.md`

---

## Why these files were archived

Before 2026-06-10, the frontend repo had **22 `TAREAS.md` files** scattered through `src/` and `tests/`, plus a `tareas.md` at the frontend root and a `TAREAS.md` at the frontend `docs/` level. These were per-page / per-flow / per-service checklists that became:

- **Stale** — most checkboxes were still unchecked ("No iniciado") even when the corresponding code was actually complete.
- **Duplicated** — the same status info appeared in the root `TareasPendientes.md` and in these per-area files.
- **Confusing for AI agents** — when an agent searched for "what's pending?", it could pick up contradictory information from any of 22 files.

To fix this, on 2026-06-10 we:

1. Created accurate catalogs (`pages-catalog.md`, `flows-catalog.md`, `services-catalog.md`, `routes-map.md`) under `frontend/docs/`.
2. Moved all 22+ `TAREAS.md` files (and the legacy `tareas.md`/`docs/TAREAS.md`) into this `_legacy/` folder.
3. Renamed them with a `<parent-dir-name>__TAREAS.md` pattern so the original context is preserved.
4. Updated `TareasPendientes.md` and `frontend/AGENTS.md` to point at the new system.

---

## Index of archived files

| Archive name | Original location | Topic |
|---|---|---|
| `00__root__tareas.md` | `frontend_proton_react_hogar_de_ancianos/tareas.md` | CI/CD pipeline history (Jenkins + Selenium + JMeter) |
| `docs__TAREAS.md` | `frontend_proton_react_hogar_de_ancianos/docs/TAREAS.md` | (frontend-level doc tasks — see content) |
| `flows__TAREAS.md` | `src/infrastructure/flows/TAREAS.md` | Status of all 22 flows (most complete consolidation) |
| `components__TAREAS.md` | `src/presentation/components/TAREAS.md` | Atomic / molecular / organism component status |
| `context__TAREAS.md` | `src/presentation/context/TAREAS.md` | React context providers status |
| `hooks__TAREAS.md` | `src/presentation/hooks/TAREAS.md` | Custom hooks status |
| `services__TAREAS.md` | `src/services/TAREAS.md` | Status of all 17 services + missing 11 |
| `types__TAREAS.md` | `src/types/TAREAS.md` | TypeScript types status |
| `tests__TAREAS.md` | `tests/TAREAS.md` | e2e tests status |
| `clinical-history__TAREAS.md` | `src/presentation/pages/clinical-history/TAREAS.md` | Clinical history page status |
| `clinical-medication__TAREAS.md` | `src/presentation/pages/clinical-medication/TAREAS.md` | Clinical medication page status |
| `dashboard__TAREAS.md` | `src/presentation/pages/dashboard/TAREAS.md` | Dashboard widgets (extensive, ~120 lines) |
| `emergency-contacts__TAREAS.md` | `src/presentation/pages/emergency-contacts/TAREAS.md` | Emergency contacts page status |
| `medical-records__TAREAS.md` | `src/presentation/pages/medical-records/TAREAS.md` | Medical records page status |
| `nursing__TAREAS.md` | `src/presentation/pages/nursing/TAREAS.md` | Nursing records page status |
| `older-adult-family__TAREAS.md` | `src/presentation/pages/older-adult-family/TAREAS.md` | Older adult family page status |
| `older-adult-updates__TAREAS.md` | `src/presentation/pages/older-adult-updates/TAREAS.md` | Older adult updates page status |
| `older-adults__TAREAS.md` | `src/presentation/pages/older-adults/TAREAS.md` | Virtual file (older adult) page status |
| `physiotherapy__TAREAS.md` | `src/presentation/pages/physiotherapy/TAREAS.md` | Physiotherapy page status |
| `psychology__TAREAS.md` | `src/presentation/pages/psychology/TAREAS.md` | Psychology page status |
| `social-work__TAREAS.md` | `src/presentation/pages/social-work/TAREAS.md` | Social work page status |
| `specialized-appointments__TAREAS.md` | `src/presentation/pages/specialized-appointments/TAREAS.md` | Specialized appointments page status |
| `specialized-areas__TAREAS.md` | `src/presentation/pages/specialized-areas/TAREAS.md` | Specialized areas page status |

---

## What to do if you want to revive a checklist

1. The information in these files has been **superseded** by the catalogs in `frontend/docs/` and the root `TareasPendientes.md`.
2. If you find something missing in the catalogs, **add it to the catalog**, not to a new `TAREAS.md` file.
3. If you find a discrepancy, **update the catalog** (or `TareasPendientes.md`) and delete this archive.

---

## Status of the original 22+1+1 files

- **22 `TAREAS.md`** moved here on 2026-06-10.
- **1 `tareas.md`** (CI/CD history) moved here on 2026-06-10.
- **1 `docs/TAREAS.md`** (frontend-level doc) moved here on 2026-06-10.

Total: **24 files** archived.
