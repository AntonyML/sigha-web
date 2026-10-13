# Rutas Next.js

Las rutas se definen con archivos `page.tsx` bajo `src/app`. Los route groups entre paréntesis separan layouts sin alterar las URLs.

## Superficie pública

| URL | Contenido |
|---|---|
| `/` | Landing de SIGHa |
| `/funcionalidades` | Capacidades de la plataforma |
| `/como-funciona` | Flujo de uso |
| `/planes` | Implementación y conversación comercial, sin precios inventados |
| `/nosotros` | Propósito y principios |
| `/contacto` | Canal de contacto existente |

## Autenticación

| URL | Pantalla |
|---|---|
| `/login` | Inicio de sesión |
| `/auth/forgot-password` | Solicitud de recuperación |
| `/auth/recovery/verify` | Verificación de código |
| `/auth/recovery/reset` | Cambio de contraseña |
| `/auth/verify-2fa` | Verificación de segundo factor |
| `/auth/create-user` | Solicitud de alta |

## Workspace

| Módulo | Rutas conservadas |
|---|---|
| Inicio y administración | `/dashboard`, `/admin`, `/settings/*` |
| Residentes | `/virtualFiles/*`, `/older-adult-family/*`, `/older-adult-updates`, `/emergency-contacts/*` |
| Identidad | `/users/*`, `/roles/*`, `/permissions/*`, `/role-changes` |
| Atención programada | `/programs/*`, `/vaccines/*`, `/sub-programs/*`, `/nursing/*`, `/specialized-appointments/*`, `/specialized-areas/*` |
| Atención clínica | `/medical-records/*`, `/clinical-history/*`, `/clinical-medication/*`, `/physiotherapy/*`, `/psychology/*`, `/social-work/*` |
| Operación y seguridad | `/entrance-exit/*`, `/notifications/*`, `/audits/*`, `/two-factor`, `/profile/*` |

Las páginas con parámetros usan segmentos dinámicos de Next, por ejemplo `/users/view/[id]`, `/nursing/appointments/[id]/results` y `/nursing/patients/[patientId]/appointments`.

Las pantallas migradas se mantienen como clientes durante la fase de compatibilidad. Para comprender la separación de autorización, consulta `src/app/(workspace)/layout.tsx`, `src/app/permission-gate.tsx` y `src/app/(workspace)/users/page.tsx`.
