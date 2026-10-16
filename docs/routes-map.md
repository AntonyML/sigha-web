# Rutas Next.js

Las rutas se definen con archivos `page.tsx` bajo `src/app`. Los route groups entre paréntesis separan layouts sin alterar las URLs.

## Superficie pública

| URL | Contenido |
|---|---|
| `/` | Landing de SIGHA |
| `/funcionalidades` | Capacidades de la plataforma |
| `/como-funciona` | Flujo de uso |
| `/planes` | Implementación y conversación comercial, sin precios inventados |
| `/nosotros` | Propósito y principios |
| `/contacto` | Formulario que prepara un correo para revisión y envío |
| `/privacidad` | Información de controles y canal para consultas de privacidad |
| `/accesibilidad` | Prácticas de accesibilidad y canal para reportar barreras |

## Autenticación

| URL | Pantalla |
|---|---|
| `/login` | Inicio de sesión |
| `/auth/forgot-password` | Solicitud de recuperación |
| `/auth/recovery/verify` | Verificación de código |
| `/auth/recovery/reset` | Cambio de contraseña |
| `/auth/verify-2fa` | Verificación de segundo factor |
| `/auth/create-user` | Solicitud de alta |

## Plataforma (SaaS)

| URL | Pantalla |
|---|---|
| `/platform` | Inicio del plano de plataforma |
| `/platform/organizations` | Gestión de organizaciones (listar, crear, estado y plan) |

El plano de plataforma vive en su propio route group `(platform)`, separado del shell de workspace y de sus providers de organización. El acceso lo controla `src/app/platform-gate.tsx` exigiendo un rol `PLATFORM_OWNER` o `PLATFORM_SUPPORT`; la autorización real la sigue imponiendo la API.

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

Las pantallas migradas se mantienen como clientes durante la fase de compatibilidad. Para comprender la separación de autorización, consulta `src/app/(workspace)/layout.tsx`, `src/app/permission-gate.tsx`, `src/app/platform-gate.tsx` y `src/app/(workspace)/users/page.tsx`.
