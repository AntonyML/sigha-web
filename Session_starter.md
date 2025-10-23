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
- ✅ **Módulo de Auditoría COMPLETO**: 
  - audit.ts (109 líneas): Audit, AuditAction (12 tipos), AuditEntity (9 tipos), AuditStats
  - auditService.ts (127 líneas): 9 métodos HTTP con axios (getAllAudits, getAuditById, searchAudits, getAuditsByUser, getAuditsByEntity, getAuditStats, exportAudits)
  - auditFlow.ts (465 líneas): 6 métodos principales + 6 helpers (formatAuditDate, getActionLabel, getEntityLabel, getActionBadgeClass, getChangeSummary, isCriticalAudit)
  - AuditMenuPage.tsx: menú principal de auditoría con 3 opciones + accesos rápidos (creaciones, eliminaciones, logins, intentos fallidos) + breadcrumbs
  - AuditListPage.tsx: tabla paginada, filtros (acción, entidad, fechas), búsqueda, exportar CSV, breadcrumbs
  - ViewAuditPage.tsx: 5 cards (info general, metadata técnica, valores antiguos/nuevos, comparación de cambios)
  - AuditDashboardPage.tsx: cards de resumen, gráficos con progress bars, top usuarios, actividad reciente, breadcrumbs
  - Rutas configuradas: /audits (menú), /audits/list, /audits/view/:id, /audits/dashboard
  - Integración con MainMenuPage: nueva opción "Auditoría 🛡️"
- ✅ Build exitoso: 0 errores TypeScript, dist 455.52 kB

**2025-10-22:**
- ✅ Investigación UX/UI completada (7 fuentes: A11Y, NN/g, PageFlows, M3, Tailwind, Chakra, MUI)
- ✅ Documentación: UX_DESIGN_RESEARCH.md creado
- ✅ Tailwind CSS 3.4.0 instalado y configurado (breakpoints mobile/tablet/desktop)

**2025-10-18:**
- ✅ Frontend types sincronizados con backend NestJS (campos u-prefixed)
- ✅ Flujos de autenticación refactorizados (authFlow, twoFactorFlow, userFlow)
- ✅ Páginas CRUD actualizadas con mejores prácticas UX (orden lógico campos)

---

## 🚀 Próximas Tareas

### Módulo de Auditoría ✅ COMPLETADO
- [x] ✅ Tipos, servicio y flow (audit.ts, auditService.ts, auditFlow.ts)
- [x] ✅ **AuditListPage.tsx** - Tabla paginada con filtros (acción, entidad, fechas), búsqueda, exportar CSV
- [x] ✅ **ViewAuditPage.tsx** - Vista detallada con 5 cards (info general, metadata, valores antiguos/nuevos, comparación de cambios)
- [x] ✅ **AuditDashboardPage.tsx** - Dashboard con cards de resumen, gráficos por tipo/entidad, top usuarios, actividad reciente
- [x] ✅ Rutas configuradas en App.tsx (/audits, /audits/view/:id, /audits/dashboard)
- [x] ✅ Build verificado: 0 errores TypeScript, dist 455.52 kB

**Módulo completo y listo para integración con backend en http://localhost:3000/audits**

### General
- [ ] Testing responsive en dispositivos reales (iPhone, iPad, Android)
- [ ] Tests de accesibilidad WCAG (contraste, navegación teclado, screen readers)
- [ ] Documentar patrones de diseño (UX_PATTERNS.md)
- [ ] Integración completa login → 2FA → dashboard con backend
- [ ] Migrar páginas restantes a Tailwind CSS (dashboard, users, etc.)

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
- `src/presentation/pages/auth/LoginPageNew.tsx` - Login mobile-first
- `electron/main.ts` - Configuración Electron
- `scripts/watch-electron.js` - Workflow TypeScript → .cjs
- `tailwind.config.js` - Configuración Tailwind (breakpoints, tema)

**Constraints:**
- Backend esperado en http://localhost:3000
- Tokens en localStorage (authToken, tempToken, user)
- 2FA requiere QR code con authenticator app
- Electron requiere archivos .cjs (CommonJS) no .js

---

*Última actualización: 2025-10-23 - Session_starter.md optimizado y limpiado*