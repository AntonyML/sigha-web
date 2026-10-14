# SIGHA Web

Frontend del Sistema Integral de Gestión Holística y de Asistencia (SIGHA) para coordinar la gestión y la atención. Está construido con **Next.js App Router**, **React**, **TypeScript** y **Bun**.

## Empezar

Requisitos: Bun 1.3 o posterior y una instancia de la API NestJS.

```bash
bun install
Copy-Item .env.example .env.local
bun run dev
```

La web queda en `http://localhost:3001`; la API local usa `http://localhost:3000`. La interfaz llama directamente al backend. El rewrite opcional `/api/backend` se conserva solo para desarrollo local.

Comandos disponibles:

```bash
bun run dev       # Next.js, puerto 3001
bun run build     # build de producción
bun run start     # servidor de producción, puerto 3001
bun run lint      # ESLint
bun run test:run  # Vitest
bun run test:e2e  # Playwright
```

## Configuración

| Variable | Dónde | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | navegador | URL base pública de NestJS; por defecto `http://localhost:3000` |
| `BACKEND_API_URL` | servidor local | Destino del rewrite opcional de desarrollo; por defecto `http://localhost:3000` |
| `NEXT_PUBLIC_APP_ENV` | navegador | Entorno de la aplicación |
| `NEXT_PUBLIC_ENABLE_2FA` | navegador | Configuración de la interfaz 2FA |

En producción configura `NEXT_PUBLIC_API_URL` en el entorno del build y permite el origen de Pages en CORS del backend. El export estático no ejecuta un servidor Next ni usa rewrites.

Para Playwright, copia `.env.e2e.example` a `.env.e2e`; la URL web es `http://localhost:3001` y `E2E_API_URL` apunta directamente a NestJS.

## Arquitectura

```text
src/
├── app/                         # rutas, route groups, layouts, metadata y composition root
│   ├── (marketing)/             # sitio público
│   ├── (auth)/                  # inicio de sesión y recuperación
│   └── (workspace)/             # producto autenticado, permisos y 2FA
├── modules/                     # módulos organizados por capacidad de negocio
│   └── <domain>/
│       ├── application/flows/   # casos de uso y validaciones
│       └── presentation/pages/  # pantallas del dominio
├── application/                 # fachada de casos de uso compartidos
├── infrastructure/
│   ├── api/                     # cliente HTTP y adaptadores de NestJS
│   └── storage/                 # persistencia del navegador existente
└── shared/
    ├── ui/                      # componentes organizados por función
    ├── hooks/                   # hooks transversales
    ├── lib/                     # utilidades puras y permisos
    ├── config/                  # configuración de frontend
    ├── types/                   # contratos compartidos
    └── styles/                  # estilos globales y compatibilidad visual
```

Los grupos de rutas de Next no cambian la URL pública. La landing ocupa `/`; el acceso al producto se mantiene en `/login`.

### Reglas de dependencias

- `app` se limita a composición, rutas, layouts, metadata y límites de seguridad de interfaz.
- La presentación de un módulo coordina la interacción y consume sus casos de uso.
- Los casos de uso concentran reglas de aplicación; no deben importar Next.js, React ni Axios.
- La infraestructura implementa contratos de persistencia y comunicación con la API.
- `shared` contiene piezas realmente reutilizables, sin reglas exclusivas de un dominio.
- Las dependencias entre módulos se declaran por contratos públicos; se evitan imports desde carpetas internas de otro módulo.
- Se aplican SRP, OCP, LSP, ISP y DIP cuando hay una razón de dominio concreta; no se añaden abstracciones sin consumidores distintos.

Las pantallas que provienen de la SPA se conservan como componentes cliente para reducir el riesgo funcional de la migración. El plan documenta su conversión progresiva a casos de uso y contratos de dominio, además del cambio de autenticación del almacenamiento local a cookies seguras cuando la API soporte el contrato.

## Superficies y rutas

- **Marketing:** `/`, `/funcionalidades`, `/como-funciona`, `/planes`, `/nosotros`, `/contacto`.
- **Autenticación:** `/login` y `/auth/*`.
- **Producto:** `/dashboard`, `/users/*`, `/roles/*`, `/virtualFiles/*`, `/nursing/*`, registros clínicos, auditoría, configuración y módulos de atención.

Las rutas existentes del producto se representan mediante archivos `page.tsx` del App Router. Las vistas que antes incluían IDs usan rutas estáticas; la selección se conserva en Context respaldado por `sessionStorage`.

## Implementación y siguientes pasos

La migración del framework, el enrutamiento, los grupos públicos/privados y la estructura por capas están descritos en [el plan de arquitectura y migración](docs/architecture/sigha-nextjs-implementation-plan.md). Ese plan incluye endurecimiento de autenticación, tenancy SaaS, inversión de dependencias, retirada de compatibilidad y criterios de salida.

Para compilar y publicar la exportación estática en Cloudflare Pages, consulta la [guía de Pages y GitHub Actions](docs/cloudflare-pages.md).

## Contribución (multi-agente con worktrees)

`dev` es la rama de integración y el checkout principal `C:\DEV\sigha\sigha-web` no se edita. Cada tarea usa un worktree aislado bajo `C:\DEV\sigha\_wt\sigha-web\<id>-<tarea>` y una rama `agent/<id>/<tarea>` basada en `origin/dev`, con archivos reclamados en `C:\DEV\sigha\_wt\_claims\sigha-web.json`. Solo el coordinador integra a `dev` y actualiza `CHANGELOG.md`; el usuario realiza el push remoto. El protocolo está en `C:\DEV\sigha\AGENTS.md` y `AGENTS.md`.

1. Reclamar los archivos, crear worktree/rama y verificar en ese worktree (`bun run test:run`, `bun run build`, `bun run lint`).
2. Crear un commit en la rama y entregar resumen, verificaciones y nota de changelog al coordinador.
3. El coordinador integra a `dev`; el usuario publica al remoto.
