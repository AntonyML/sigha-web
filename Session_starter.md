AI Session Starter: frontend_proton_react_hogar_de_ancianos

Project memory file for AI assistant session continuity. Auto-referenced by custom instructions.
This file should be added to .gitignore to avoid committing session-specific data.

---

## Project Context

**Project:** frontend_proton_react_hogar_de_ancianos
**Type:** React Frontend (Vite + TypeScript)
**Purpose:** Frontend client for elderly care home management system with authentication and 2FA support
**Status:** Active development - UI migration to Tailwind CSS + shadcn/ui in progress
**Core Technologies:**
- React 19.1.1 with TypeScript 5.9.3
- Vite 7.1.9 build system
- React Router for navigation
- Axios HTTP client with interceptors
- Tailwind CSS v3.4.0 + shadcn/ui (NEW - mobile-first adaptive UI)
- Bootstrap 5.3.8 (gradual migration in progress)
- LocalStorage for token management

**Backend Integration:**
- NestJS backend on http://localhost:3000
- JWT authentication + Two-Factor Authentication
- REST API endpoints: /auth/login, /auth/verify-2fa, /auth/profile
- 2FA endpoints: /auth/setup-2fa, /auth/enable-2fa, /auth/disable-2fa

**Available AI Capabilities:**
- MCP Servers: Filesystem MCP (active), GitHub MCP (active)
- UI Components: 21st, Magic UI, shadcn/ui available
- Documentation: Upstash Conte MCP for library documentation

---

## Current State

**Build Status:** Ready for backend integration testing
**Key Achievement:** Frontend types completely synchronized with NestJS backend DTOs
**Active Issue:** None - all TypeScript compilation errors resolved
**AI Enhancement:** MCP filesystem and GitHub tools active for enhanced development workflow

**Architecture Highlights:**
- Clean Architecture: domain → services → flows → pages separation
- Type-safe interfaces matching backend API contracts
- Layered authentication with JWT + 2FA support
- Atomic Design components structure (atoms, molecules, organisms)
- Centralized HTTP client with automatic token management
- Error handling and user feedback integrated

---

## Technical Memory

**Critical Discoveries:**
- React frontend with Vite + TypeScript for modern development
- Authentication flows properly layered: types → services → flows → pages
- Frontend credentials (email/password) converted to backend format (uEmail/uPassword) in authFlow
- Backend uses u-prefixed camelCase for all user fields (uEmail, uPassword, uName, uFLastName, uSLastName, uIdentification, uIsActive)
- Password minimum length: 8 characters (enforced in backend DTOs)
- UpdateUserData does not include password field - use dedicated changePassword endpoint
- ChangePasswordData only has currentPassword and newPassword (no confirmPassword in backend)
- Token management via localStorage (authToken, tempToken, user)
- Bootstrap UI with custom styling and responsive design
- MCP filesystem tools provide enhanced file management capabilities
- Backend NestJS repository: AntonyML/backend_nest_hogar_de_ancianos_api

**Performance Insights:**
- Axios interceptors for automatic token attachment and 401 handling
- React Router for client-side navigation without page reloads
- LocalStorage for persistent authentication state
- Atomic Design component structure for reusability
- Type-safe API contracts prevent runtime errors

**Known Constraints:**
- Frontend expects backend running on localhost:3000
- Token expiration redirects to login page automatically
- 2FA requires QR code scanning with authenticator app
- Bootstrap framework limits custom styling flexibility
- MCP filesystem tools limited to allowed directories only

---

## Recent Achievements

**Date** | **Achievement**
---------|----------------
2025-10-18 | Frontend authentication architecture established with React + TypeScript
2025-10-18 | Type definitions aligned with NestJS backend API contracts
2025-10-18 | Authentication services rewritten to use correct /auth/* endpoints
2025-10-18 | AuthFlow business logic updated for credential conversion and 2FA
2025-10-18 | LoginPage fixed to remove deprecated authStorage dependencies
2025-10-18 | TwoFactorFlow enhanced with regenerateBackupCodes method
2025-10-18 | All frontend authentication flows verified and ready for testing
2025-10-18 | Session continuity established with comprehensive project context
2025-10-18 | MCP filesystem tools activated for enhanced development workflow
2025-10-18 | Session file reviewed by AI assistant and automated todo tracking started (Session_starter.md updated)
2025-10-18 | Todo list created and initial tasks marked (read session file, prepare updates)
2025-10-18 | Applied session-startup.prompt.md policies: todo tracking, MCP preferences noted, and session update written by assistant
2025-10-18 | Backend DTOs extracted from NestJS repository (auth and users modules)
2025-10-18 | Frontend types fully synchronized with backend DTOs (u-prefixed camelCase fields)
2025-10-18 | All user pages updated to use correct field names (uIdentification, uName, uFLastName, uEmail, etc.)
2025-10-18 | userFlow validation logic aligned with backend requirements (8-char password min, no confirmPassword)
2025-10-18 | Type-safe integration complete: 0 TypeScript compilation errors across entire project
2025-10-22 | Investigación UX/UI completada: 7 fuentes consultadas (A11Y Project, NN/g, PageFlows, M3, Tailwind, Chakra, MUI)
2025-10-22 | Documento UX_DESIGN_RESEARCH.md creado con hallazgos, patrones y checklist WCAG AA
2025-10-22 | Decisión: Tailwind CSS + shadcn/ui seleccionados para diseño adaptativo mobile-first
2025-10-22 | Instalación completada: Tailwind CSS v3.4.0, @tailwindcss/forms, Radix UI, CVA, clsx, tailwind-merge
2025-10-22 | Configuración establecida: tailwind.config.js (breakpoints mobile/tablet/desktop), postcss.config.js, global.css con CSS variables
2025-10-22 | Path alias @/* configurado en tsconfig.app.json y vite.config.ts
2025-10-22 | Componentes shadcn/ui creados: ButtonNew (6 variants), InputNew (responsive), Label (Radix), Card system
2025-10-22 | Build exitoso: compilación con Tailwind CSS integrado sin errores (dist 414.25 kB, CSS 327.57 kB gzip 49.02 kB)
2025-10-22 | **LoginPageNew.tsx creado**: diseño mobile-first, accesibilidad WCAG AA, transiciones animadas login ↔ 2FA, responsive 360px-1440px
2025-10-22 | App.tsx actualizado para usar LoginPageNew como página de login principal
2025-10-23 | **Electron main.ts configurado**: pantalla completa en dev (fullscreen: isDev), menú superior oculto (setMenuBarVisibility(false)), dimensiones adaptativas (1200x800, minWidth 360px, minHeight 640px)

---

## Active Priorities

- [x] ✅ Extract backend DTOs from NestJS repository
- [x] ✅ Synchronize frontend types with backend DTOs (u-prefixed fields)
- [x] ✅ Update all user pages to use correct field names
- [x] ✅ Fix userFlow validation logic to match backend requirements
- [x] ✅ Eliminate all TypeScript compilation errors
- [x] ✅ Aplicar mejores prácticas CRUD (orden lógico de campos según Growform)
- [x] ✅ Repositor email ANTES de contraseñas en formulario Create
- [x] ✅ Refactorizar EditUserPage con 5 cards full-width (uniforme con Create)
- [x] ✅ Refactorizar ViewUserPage con 5 cards full-width (elimina sidebar + redundancia)
- [ ] 🔄 Test complete frontend-backend integration (login → 2FA → dashboard)
- [ ] 🔄 Test user management CRUD operations with backend (Create → Read → Update → Delete)
- [ ] 🔄 Testing mobile responsive en dispositivos reales (iPhone, iPad)
- [ ] Verify role management integration
- [ ] Add comprehensive error handling and user feedback
- [ ] Implement password change page (currentPassword + newPassword only)
- [ ] Add loading states and skeleton screens
- [ ] Implement proper form validation with visual feedback
- [ ] Add comprehensive component testing with Jest
- [ ] Mobile responsiveness improvements and PWA features

## AI Actions & Notes

- Session startup prompt (`.github/prompts/session-startup.prompt.md`) followed and applied to session behavior.
- MCP tool preferences for this session: UI component MCPs (21st, Magic UI, shadcn/ui) as primary for component work; Filesystem MCP as primary for file ops; GitHub MCP available for repo actions.
- Assumptions: Backend remains at http://localhost:3000; Node/npm versions per README are available on developer machine.

### Preferencia de idioma

Todas las respuestas y notas generadas por el asistente durante esta sesión deberán estar en español.

### Update Log

Date | Summary
-----|--------
2025-10-18 | Session-startup prompt applied; session todo list created and session starter updated by AI assistant.
2025-10-18 | Scope limited to auth/users/roles modules; Spanish language preference added; .env.example removed
2025-10-18 | Backend DTOs extracted and mapped to frontend types; complete type alignment achieved
2025-10-18 | All user management pages and flows updated with u-prefixed field names
2025-10-18 | Validation logic updated: 8-char password minimum, confirmPassword removed from backend flow
2025-10-18 | TypeScript compilation successful: 0 errors across entire frontend codebase
2025-10-22 | Aplicadas mejores prácticas CRUD según Growform: orden lógico de campos en CreateUserPage
2025-10-22 | Email movido ANTES de contraseñas (correo necesario para recuperación, menos sensible)
2025-10-22 | Orden correcto: Identificación → Personales → Contacto → Rol → Seguridad
2025-10-22 | Archivo CRUD_BEST_PRACTICES.md creado con referencias de 5 fuentes UX/UI
2025-10-22 | Build exitoso: npm run build compiló sin errores tras cambios de reordenamiento
2025-10-22 | EditUserPage.tsx refactorizada: 8+4 layout → 5 cards full-width, elimina duplicación datos
2025-10-22 | Estructura uniforme en Create/Edit: Personales → Contacto → Rol → Seguridad → Acciones
2025-10-22 | ViewUserPage.tsx refactorizada: sidebar 8+4 → 5 cards full-width, cero redundancia
2025-10-22 | Implementadas 5 cards en ViewUserPage: Personal, Contacto, Rol, Permisos, Información Adicional
2025-10-22 | Build exitoso tras refactorización de ViewUserPage: 0 errores, dist 364.10 kB (gzip 101.94 kB)
2025-10-22 | Documentación: VIEWPAGE_REFACTOR_REPORT.md creado con comparativa antes/después
2025-10-22 | Sesión iniciada: se aplicaron las instrucciones de `session-startup.prompt.md`, se creó la lista de tareas del asistente y se leyeron `Session_starter.md` y `README.md` (tareas registradas).
2025-10-22 | Investigación UX/UI completada: consultadas 7 fuentes (A11Y Project, Nielsen Norman, PageFlows, Material Design 3, Tailwind CSS, Chakra UI, MUI) para diseño adaptativo y accesibilidad
2025-10-22 | Documentación creada: UX_DESIGN_RESEARCH.md con hallazgos clave, patrones de diseño, y plan de implementación de login adaptativo mobile-first
2025-10-22 | Decisión técnica: Tailwind CSS + shadcn/ui seleccionados para refactorización de LoginPage (mobile-first, WCAG AA, TypeScript)
2025-10-22 | Instalación completada: Tailwind CSS v3.4, @tailwindcss/forms, Radix UI primitives, class-variance-authority, clsx, tailwind-merge, lucide-react
2025-10-22 | Configuración: tailwind.config.js (breakpoints mobile/tablet/desktop, variables CSS, animaciones), postcss.config.js, path alias @/* en tsconfig y vite.config
2025-10-22 | Componentes shadcn/ui creados: Button, Input, Label, Card (con variantes y accesibilidad Radix UI) en src/presentation/components/atoms/
2025-10-22 | Build exitoso: compilación con Tailwind CSS integrado sin errores (dist 414.25 kB, CSS 327.57 kB gzip 49.02 kB)

---

## Development Environment

**Common Commands:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm install` - Install dependencies
- `npm run type-check` - TypeScript type checking

## Workspace scan (2025-10-22)

- Top-level files and folders detected: `.chatcatalyst/`, `.git/`, `.github/`, `.gitignore`, `.vscode/`, `dist/`, `dist-electron/`, `electron/`, `eslint.config.js`, `index.html`, `LICENSE`, `node_modules/`, `package-lock.json`, `package.json`, `public/`, `README.md`, `Session_starter.md`, `src/`, `tests/`, `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`.

- `package.json` highlights:
	- name: `asopogua`, private: `true`, type: `module`, main: `dist-electron/main.cjs`.
	- scripts: `dev` (vite), `dev:electron` (concurrently runs renderer + main + electron-wait), `build` (renderer + electron), `start:prod` (electron production), `lint`, `preview`.
	- runtime dependencies: `react` ^19.1.1, `react-dom` ^19.1.1, `react-router-dom`, `axios`, `bootstrap`, `bootstrap-icons`, `sweetalert2`.
	- devDependencies: `vite`, `typescript` ~5.9.3, `@vitejs/plugin-react`, `electron`, `electron-builder`, `concurrently`, `cross-env`, `wait-on`, `eslint` and plugins.

Notes: Electron build tooling is present; project supports both web (Vite) and Electron desktop builds.

## Cierre de sesión (2025-10-22)

Resumen de acciones:

- Se creó y gestionó el todo list de la sesión.
- Se leyeron y analizaron `Session_starter.md` y `README.md` para obtener contexto del proyecto.
- Se actualizó `Session_starter.md` con un registro de inicio de sesión y con los resultados del escaneo del workspace (`package.json`, scripts, dependencias).
- Se añadió la sección "Plan MCP / herramientas" especificando qué MCPs usar y para qué propósitos.

Verificaciones realizadas:

- Confirmé la existencia de scripts clave en `package.json` (dev, dev:electron, build, build:renderer, build:electron, start:prod, preview).
- Verifiqué que las dependencias y devDependencies necesarias para Vite y Electron están presentes (`react`, `vite`, `electron`, `electron-builder`, `typescript`, etc.).
- Revisé la estructura de carpetas y archivos top-level del repositorio (`src/`, `electron/`, `public/`, `tests/`, `dist-electron/`, etc.).

Observación sobre ejecución local:

- Nota: el intento anterior de ejecutar `npm run dev:electron` devolvió exit code 1 (ver contexto). Flujo recomendado para desarrollo con Electron:

1) En una terminal (desarrollador web) arrancar Vite:

```pwsh
npm run dev
```

2) En otra terminal arrancar el proceso Electron en modo development (el script `dev:electron` usa concurrently y espera a que Vite esté listo):

```pwsh
npm run dev:electron
```

Si `npm run dev:electron` falla, pasos de diagnóstico rápidos:

- Asegurarse de que `npm run dev` esté corriendo y accesible en `http://localhost:5173`.
- Ejecutar `npm run build:electron` para compilar `dist-electron/main.cjs` y comprobar errores de TypeScript en la carpeta `electron/`:

```pwsh
npm run build:electron
```

- Revisar la salida completa del comando fallido para localizar el error (dependencias faltantes, permisos, o rutas incorrectas).

Próximos pasos recomendados:

- Ejecutar pruebas de integración del flujo de autenticación (login → 2FA → dashboard) contra el backend local en `http://localhost:3000`.
- Añadir tests unitarios mínimos para `authFlow` y `userFlow` si aún no existen.
- Si quieres, puedo abrir PRs con cambios propuestos o crear issues que documenten tareas pendientes (p. ej. pruebas e2e, mobile responsive, mejoras de accesibilidad).

Cierre y estado de la sesión:

- Tareas del todo list completadas. `Session_starter.md` actualizado con la información solicitada y el plan MCP.
- Paso siguiente: esperar indicaciones tuyas para implementar cambios de código, crear componentes UI o abrir PRs.

## Plan MCP / herramientas (2025-10-22)

Se seguirá la política del `session-startup.prompt.md` de priorizar MCPs cuando correspondan. Plan de uso concreto:

- Filesystem MCP: operación principal para leer/editar archivos del repositorio (`Session_starter.md`, código fuente, tests, generación de parches). Se usará para aplicar cambios seguros y rastreables en el proyecto.
- GitHub MCP: operaciones de repositorio (crear issues/PRs, revisar cambios, obtener información del repo) cuando sea necesario coordinar con control de versiones o abrir PRs con cambios propuestos.
- UI component MCPs (21st, Magic UI, shadcn/ui): generación e inspiración de componentes UI cuando necesitemos crear o rediseñar componentes React (atoms/molecules). Priorizaré estos para propuestas de UI que encajen con la arquitectura Atomic Design existente.
- Upstash/Documentation MCP (Upstash Conte): referencia y búsqueda de documentación para librerías y APIs cuando se necesite confirmar APIs públicas, hooks o patrones de integración.
- Knowledge graph / Memory MCP: registrar decisiones arquitectónicas y cambios importantes en la memoria de la sesión para mantener continuidad entre sesiones posteriores.
- Puppeteer MCP: automatización y scraping para pruebas de e2e o captura de pantallas si se requiere automatizar flujos en la UI (solo si el escenario lo amerita).

Notas de comportamiento:
- Nunca exfiltrar secretos ni ejecutar llamadas de red externas no autorizadas.
- Preferir operaciones locales primero; usar GitHub MCP sólo para acciones que impliquen PR/issue o revisión remota.
- Mantener las notas de sesión en español y actualizar el `Session_starter.md` después de cambios mayores.

**Key Files:**
- src/main.tsx - Application entry point
- src/App.tsx - Root component with routing
- src/types/ - TypeScript interfaces matching backend
- src/services/ - HTTP client wrappers for API endpoints
- src/infrastructure/flows/ - Business logic layer
- src/presentation/pages/ - React page components
- Session_starter.md - Project context and continuity

**Setup Requirements:**
- Node.js 18+ and npm
- Backend running on http://localhost:3000
- Modern browser with JavaScript enabled
- Authenticator app for 2FA testing

**AI Tools:**
- MCP Filesystem tools for file operations and project management
- MCP GitHub tools for repository management and version control
- UI component MCPs (21st, Magic UI, shadcn/ui) for component generation

---

## Code Architecture Status

**✅ COMPLETED Components:**

**Types Layer (`src/types/`):**
- `auth.ts` - LoginCredentials (uEmail/uPassword), AuthUser, LoginResponse
- `twoFactor.ts` - Setup2FAResponse, Enable2FARequest/Response, TwoFactorVerificationRequest
- `user.ts` - User management interfaces
- `virtualFile.ts` - Virtual file management interfaces

**Services Layer (`src/services/`):**
- `authService.ts` - login(), verify2FA(), getProfile(), logout() using /auth/* endpoints
- `twoFactorService.ts` - setup2FA(), enable2FA(), disable2FA() with validation helpers
- `userService.ts` - User CRUD operations
- `virtualFileService.ts` - File management operations

**Flows Layer (`src/infrastructure/flows/`):**
- `authFlow.ts` - login(), verify2FA() with credential conversion and error handling
- `twoFactorFlow.ts` - generate2FA(), enable2FA(), disable2FA(), regenerateBackupCodes(), get2FAStatus()
- `userFlow.ts` - User management business logic
- `virtualFileFlow.ts` - File operations business logic

**Pages Layer (`src/presentation/pages/`):**
- `auth/LoginPage.tsx` - ✅ Uses authFlow.login() and authFlow.verify2FA() correctly
- `auth/LoginPageNew.tsx` - ✅ **NUEVO**: Versión mobile-first con Tailwind CSS + shadcn/ui, accesibilidad WCAG AA, transiciones animadas entre login y 2FA
- `two-factor/TwoFactorPage.tsx` - ✅ Uses twoFactorFlow methods correctly
- `dashboard/DashboardPage.tsx` - Main dashboard after authentication
- `users/` - User management pages (CreateUserPage, EditUserPage, UserListPage, ViewUserPage)

**🔄 NEXT PHASE:**
- Integration testing of complete authentication flow
- Verification of user management pages using correct userFlow methods
- Testing 2FA setup, enable, disable, and backup codes regeneration

---

## Gitignore Configuration

Ensure .chatcatalyst/ is added to .gitignore to keep session data local.
If .gitignore does not exist, create it with: .chatcatalyst/

---

This file serves as persistent project memory for enhanced AI assistant session continuity with MCP server integration.