AI Session Starter: frontend_proton_react_hogar_de_ancianos

Project memory file for AI assistant session continuity. Auto-referenced by custom instructions.
This file should be added to .gitignore to avoid committing session-specific data.

---

## Project Context

**Project:** frontend_proton_react_hogar_de_ancianos
**Type:** React Frontend (Vite + TypeScript)
**Purpose:** Frontend client for elderly care home management system with authentication and 2FA support
**Status:** Active development - authentication flows configured
**Core Technologies:**
- React 18+ with TypeScript
- Vite build system
- React Router for navigation
- Axios HTTP client with interceptors
- Bootstrap UI framework
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

---

## Active Priorities

- [x] ✅ Extract backend DTOs from NestJS repository
- [x] ✅ Synchronize frontend types with backend DTOs (u-prefixed fields)
- [x] ✅ Update all user pages to use correct field names
- [x] ✅ Fix userFlow validation logic to match backend requirements
- [x] ✅ Eliminate all TypeScript compilation errors
- [ ] 🔄 Test complete frontend-backend integration (login → 2FA → dashboard)
- [ ] 🔄 Test user management CRUD operations with backend
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

---

## Development Environment

**Common Commands:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm install` - Install dependencies
- `npm run type-check` - TypeScript type checking

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