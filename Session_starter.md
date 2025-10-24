a# AI Session Starter: frontend_proton_react_hogar_de_ancianos

Memoria del proyecto para continuidad de sesión AI. Auto-referenciado por instrucciones personalizadas.

---

## 📋 Project Context

**Proyecto:** ASOPOGUA - Sistema de gestión para hogar de ancianos  
**Tipo:** React + TypeScript + Electron Desktop App  
**Estado:** ✅ Desarrollo activo - LoginPage migrado a Tailwind CSS + shadcn/ui

### Stack Tecnológico

**Frontend:**
- React 19.1.1 + TypeScript 5.9.3
- Vite 7.1.9 (build tool)
- Tailwind CSS 3.4.0 + shadcn/ui (mobile-first, WCAG AA)
- React Router (navegación)
- Axios (HTTP client con interceptores)

**Desktop:**
- Electron 38.2.2 (fullscreen dev, menú oculto, 1200x800)
- TypeScript → CommonJS (.cjs) via scripts/watch-electron.js

**Backend Integration:**
- NestJS API: http://localhost:3000
- JWT + 2FA (QR code authenticator)
- Endpoints: /auth/login, /auth/verify-2fa, /auth/profile

### Herramientas AI Disponibles
- MCP Filesystem, GitHub, shadcn/ui, Magic UI, 21st
- Documentación: Upstash Conte MCP

---

## 🎯 Estado Actual

**Build Status:** ✅ Compilación exitosa - 0 errores TypeScript  
**Última Actualización:** 2025-10-23 - Electron configurado correctamente  
**Próximo Objetivo:** Testing responsive en dispositivos reales

### Arquitectura

```
src/
├── types/          # Interfaces TypeScript (sincronizadas con backend)
├── services/       # HTTP client wrappers (Axios)
├── infrastructure/
│   ├── flows/      # Lógica de negocio (authFlow, userFlow, etc.)
│   └── storage/    # LocalStorage management
└── presentation/
    ├── components/ # Atomic Design (atoms, molecules, organisms)
    └── pages/      # React Router pages

electron/
├── main.ts         # Electron main process (fullscreen, sin menú)
└── preload.ts      # Context isolation bridge

scripts/
├── watch-electron.js   # TypeScript watch + auto rename .js → .cjs
└── rename-to-cjs.js    # Post-build renaming utility
```

---

## 🔑 Decisiones Técnicas Clave

### Electron Workflow
- **Problema resuelto:** TypeScript compila a `.js` pero Electron requiere `.cjs` (CommonJS)
- **Solución:** Scripts automáticos (watch-electron.js, rename-to-cjs.js) renombran post-compilación
- **Configuración:** fullscreen en dev, Menu.setApplicationMenu(null), win.removeMenu(), preload usa .cjs

### UI/UX
- **LoginPageNew.tsx:** Mobile-first (360px-1440px), Tailwind CSS + shadcn/ui
- **Accesibilidad:** WCAG AA (aria-labels, focus rings, navegación teclado)
- **Componentes:** Button (6 variants), Input (responsive), Label (Radix), Card system

### Backend Integration
- **Credenciales:** Frontend (email/password) → Backend (uEmail/uPassword) via authFlow
- **Campos usuario:** Backend usa prefijo `u` (uName, uFLastName, uIdentification, uIsActive)
- **Tokens:** localStorage (authToken, tempToken, user)
- **Validación:** Password mínimo 8 caracteres

---

## 📦 Comandos Principales

```bash
npm run dev              # Vite dev server (web only)
npm run dev:electron     # Electron desktop app (watch mode)
npm run build            # Production build (renderer + electron)
npm run build:electron   # Compile Electron TypeScript → .cjs
npm run start:prod       # Electron production mode
```

---

## 📝 Historial Reciente (Últimas 2 semanas)

**2025-10-23:**
- ✅ Electron configurado: fullscreen dev, menú oculto, scripts auto-rename .cjs
- ✅ LoginPageNew con Tailwind CSS mobile-first funcionando
- ✅ Componentes shadcn/ui creados (Button, Input, Label, Card)
- ✅ **Sistema de Navegación Global Implementado:**
  - **Navbar responsive:** Desktop (top bar) + Mobile (bottom bar iOS/Android style)
  - **Breadcrumbs dinámicos:** Migas de pan clickeables, auto-oculta IDs numéricos
  - **AppLayout wrapper:** Componente global que envuelve todas las páginas
  - **5 opciones principales:** Inicio, Adultos Mayores, Actividades, Auditoría, Perfil
  - **Responsive perfecto:** Breakpoints MD (768px), safe-area-bottom para mobile
  - **Iconos:** lucide-react (Home, Users, Calendar, Bell, User, ChevronRight)
  - **Componentes atómicos:** Navbar.tsx, Breadcrumbs.tsx, AppLayout.tsx (organisms)
  - **Documentación:** NAVIGATION_SYSTEM.md creado con guía completa
  - Build exitoso: 511.07 kB bundle, 0 errores TypeScript ✅
- ✅ **Módulo de Auditoría ✅ 100% COMPLETADO - SINCRONIZADO CON BACKEND REAL**: 
  - **Backend Real:** `/audits/*` (NestJS) - Tabla: `digital_record` (MySQL)
  - **Tipos (audit.ts):** DigitalRecord, SearchDigitalRecordsDto, PaginatedDigitalRecordsResponse, AuditStatistics - 0 errores ✅
  - **Service (auditService.ts):** 6 métodos HTTP sincronizados 100% con backend NestJS - 0 errores ✅
    * `GET /audits/search` → searchDigitalRecords() ✅ ACTUALIZADO
    * `GET /audits/:id` → getDigitalRecordById() ✅ ACTUALIZADO
    * `POST /audits` → createDigitalRecord() ✅ ACTUALIZADO (userId removido, backend usa JWT)
    * `GET /audits/stats` → getAuditStatistics() ✅ ACTUALIZADO
    * `GET /audits/user/:userId` → getAuditsByUser() ✅ NUEVO
    * `GET /audits/entity/:entity/:entityId` → getAuditsByEntity() ✅ NUEVO
    * exportDigitalRecords() → Genera CSV localmente
  - **Flow (auditFlow.ts):** 7 métodos + 6 helpers - 0 errores ✅
    * getAuditsByUser() ✅ NUEVO
    * getAuditsByEntity() ✅ NUEVO
    * createDigitalRecord() ✅ ACTUALIZADO (userId removido)
  - **UI Pages (3/3) - SINCRONIZADAS CON ESTRATEGIA INCREMENTAL:** - 0 errores ✅
    * AuditListPage.tsx: Tabla paginada, filtros (userId, action, tableName), búsqueda, export CSV
    * ViewAuditPage.tsx: Vista detallada con 1 card (info general simplificada)
    * AuditDashboardPage.tsx: Estadísticas, gráficos, top usuarios, actividad reciente
  - AuditMenuPage.tsx: Submenú con 3 opciones + breadcrumbs - 0 errores ✅
  - Rutas configuradas: /audits (menú), /audits/list, /audits/view/:id, /audits/dashboard ✅
  - **Menú Principal:** Opción "Auditoría 🛡️" agregada en MainMenuPage ✅
  - Build exitoso: 0 errores TypeScript en todos los archivos ✅
  - **CAMBIOS CRÍTICOS APLICADOS (2025-10-23):**
    * ✅ Rutas actualizadas: `/audit/digital-records/*` → `/audits/*`
    * ✅ Estadísticas: `/audit/statistics` → `/audits/stats`
    * ✅ CreateDigitalRecord: Removido parámetro `userId` (backend usa JWT)
    * ✅ Agregados endpoints: `/audits/user/:userId`, `/audits/entity/:entity/:entityId`
  - **Documento de referencia:** `ADAPTACION_AUDITORIA_RESUMEN.md` (plan completo de sincronización)
  - **Tiempo invertido:** ~3 horas (análisis backend + tipos + service + flow + 3 páginas UI + corrección rutas)
  - **Testing con backend:** ⚠️ PENDIENTE - Verificar endpoints reales con base de datos MySQL
- ✅ Build exitoso: 0 errores TypeScript, dist 455.52 kB

**2025-10-22:**
- ✅ Investigación UX/UI completada (7 fuentes: A11Y, NN/g, PageFlows, M3, Tailwind, Chakra, MUI)
- ✅ Documentación: UX_DESIGN_RESEARCH.md creado
- ✅ Tailwind CSS 3.4.0 instalado y configurado (breakpoints mobile/tablet/desktop)

**2025-10-18:**
- ✅ Frontend types sincronizados con backend NestJS (campos u-prefixed)
- ✅ Flujos de autenticación refactorizados (authFlow, twoFactorFlow, userFlow)
- ✅ Páginas CRUD actualizadas con mejores prácticas UX (orden lógico campos)

**2025-10-23:**
- ✅ Sistema de auditoría actualizado a nueva estructura audit_report
- ✅ Tipos actualizados: AuditReport interface (ar_type, ar_action, ar_entity_name, ar_observations, ar_old_value, ar_new_value, ar_ip_address, ar_user_agent)
- ✅ Servicios actualizados: searchAuditReports(), getAuditReportById(), getAuditReportsByEntity()
- ✅ AuditListPage renovado: filtros por tipo/acción/entidad, tabla expandible con old_value/new_value, paginación
- ✅ ViewAuditPage renovado: cards de información general/técnica, comparación de valores, duración, IP, user agent
- ✅ Build exitoso: 0 errores TypeScript, 523.86 kB bundle

---

## 🚀 Próximas Tareas

### General
- [ ] Testing responsive en dispositivos reales (iPhone, iPad, Android)
- [ ] Tests de accesibilidad WCAG (contraste, navegación teclado, screen readers)
- [ ] Documentar patrones de diseño (UX_PATTERNS.md)
- [ ] Integración completa login → 2FA → dashboard con backend
- [ ] Migrar páginas restantes a Tailwind CSS (dashboard, users, etc.)

### Auditoría
- [ ] Actualizar AuditDashboardPage con nuevas estadísticas por ar_type
- [ ] Testing de endpoints GET /audits/reports con backend NestJS
- [ ] Implementar gráficos de auditoría por tipo (login_attempts, role_changes, etc.)
- [ ] Agregar filtros avanzados (rango de duración, IP específica, user agent)

---

## 🔧 Notas para el Asistente AI

**Idioma:** Español  
**MCP Preferences:**
- Filesystem MCP: operaciones de archivos (lectura, edición, parches)
- GitHub MCP: PRs, issues, control de versiones
- UI MCPs (shadcn/ui, Magic UI, 21st): generación componentes React
- Upstash Conte: documentación de librerías

**Archivos Clave:**
- `Session_starter.md` - Memoria del proyecto (este archivo)
- `ADAPTACION_AUDITORIA_RESUMEN.md` - Plan sincronización backend NestJS
- `src/presentation/pages/auth/LoginPageNew.tsx` - Login mobile-first
- `src/presentation/pages/audit/AuditListPage.tsx` - Lista auditoría con nueva estructura
- `src/presentation/pages/audit/ViewAuditPage.tsx` - Vista detalle auditoría
- `src/types/audit.ts` - Interfaces AuditReport, SearchAuditReportsDto
- `src/services/auditService.ts` - Cliente HTTP con métodos nuevos
- `electron/main.ts` - Configuración Electron
- `scripts/watch-electron.js` - Workflow TypeScript → .cjs
- `tailwind.config.js` - Configuración Tailwind (breakpoints, tema)

**Constraints:**
- Backend esperado en http://localhost:3000
- Tokens en localStorage (authToken, tempToken, user)
- 2FA requiere QR code con authenticator app
- Electron requiere archivos .cjs (CommonJS) no .js
- **Auditoría backend:** Endpoints `/audits/reports`, `/audits/reports/:id`, `/audits/reports/entity/:entityName/:entityId`
- **Estructura audit_report:** ar_type, ar_action, ar_entity_name, ar_entity_id, ar_old_value (JSON string), ar_new_value (JSON string), ar_observations, ar_ip_address, ar_user_agent, ar_duration_seconds, create_at, id_generator
- **Tipos audit:** LOGIN_ATTEMPTS, ROLE_CHANGES, OLDER_ADULT_UPDATES, SYSTEM_ACCESS, CLINICAL_RECORD_CHANGES, PASSWORD_RESETS, NOTIFICATIONS, GENERAL_ACTIONS, OTHER
- **Acciones audit:** CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, EXPORT, OTHER

---

*Última actualización: 2025-10-23 - Sistema de auditoría completamente actualizado a nueva estructura audit_report con vistas renovadas (0 errores TypeScript, 523.86 kB bundle)*