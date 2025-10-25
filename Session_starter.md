# ASOPOGUA - Frontend

**Proyecto:** Sistema gestión hogar de ancianos  
**Tipo:** React + TypeScript + Electron Desktop App  
**Estado:** ✅ Activo - Arquitectura modular  
**Módulos:** 🔐 Login/Usuarios + 📊 Auditoría (solo estos)

## Stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind + shadcn/ui
- **Desktop:** Electron 38 (fullscreen, sin menú)
- **Backend:** NestJS API @ 192.168.1.2:3000 (JWT + 2FA)

## Arquitectura
```
src/
├── services/     # authService, twoFactorService, auditService, userManagementService
├── flows/        # authFlow, userManagementFlow, auditFlow
├── types/        # auth, user, audit, twoFactor
└── presentation/ # components + pages (solo login/usuarios/auditoría)
```

## Comandos
```bash
npm run dev              # Web dev
npm run dev:electron     # Desktop dev
npm run build            # Production build
```

## Reglas
- ✅ Solo trabajar con módulos de autenticación y auditoría
- 🚫 Ignorar otros módulos (programas, vacunas, etc.)
- 🔧 Usar configuración centralizada (app.config.ts)

## Update Log
**2025-01-XX:** Alcance definido - Solo Login/Usuarios + Auditoría
**2025-01-XX:** APIs centralizadas @ 192.168.1.2:3000
**2025-01-XX:** Arquitectura modular implementada
