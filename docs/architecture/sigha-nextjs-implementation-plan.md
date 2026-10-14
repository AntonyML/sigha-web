# Plan de implementación: SIGHA SaaS con Next.js

## Objetivo

Consolidar el frontend en Next.js App Router, separar las superficies públicas del producto autenticado y evolucionar hacia un SaaS modular con capas explícitas, inversión de dependencias y límites claros entre tenants.

## Estado actual de esta migración

### Entregado

- Next.js 16 y React 19 son el runtime y el build de la web.
- Las 95 rutas existentes se trasladaron a archivos `page.tsx` nativos; los parámetros dinámicos usan segmentos como `[id]`.
- `/` ahora es la landing pública. `/login` y los flujos `/auth/*` permanecen públicos.
- Se añadieron las superficies `/funcionalidades`, `/como-funciona`, `/planes`, `/nosotros` y `/contacto`.
- Se separaron layouts para marketing, autenticación y espacio de trabajo.
- Se conservaron las rutas y pantallas existentes del producto, incluidas las protecciones de permisos y 2FA.
- El código se reorganizó en `app`, `modules`, `application`, `infrastructure` y `shared`; desaparecieron las carpetas `atoms`, `molecules` y `organisms`.
- Se retiraron React Router, Vite como servidor/build de la aplicación, `App.tsx`, `main.tsx` e `index.html`.
- `/api/backend/*` se reescribe desde Next hacia `BACKEND_API_URL`; la API NestJS actual no requiere CORS desde el navegador.
- `bun run build` completa compilación, TypeScript y prerender de las rutas.

Vitest conserva Vite como dependencia interna de su propio runner. Ya no existe configuración ni ejecución de Vite para servir o empaquetar la aplicación web.

### Compatibilidad pendiente de reducir

- Las pantallas del producto siguen siendo componentes cliente para mantener su interacción y estado durante el cambio de framework.
- Existe `src/shared/navigation.ts` como adaptador temporal entre las pantallas y `next/navigation`.
- Algunas pantallas aún invocan servicios HTTP directamente y varios flujos de aplicación importan adaptadores concretos. La estructura ya distingue capas, pero la regla de inversión de dependencias se completa por módulo en la fase 3.
- El token de sesión existente sigue en `localStorage`. El layout valida la sesión en el navegador; esa validación solo mejora la navegación y no sustituye la autorización de NestJS.
- La superficie de marketing presenta la plataforma. La solicitud de demo abre el canal de contacto disponible; no existe todavía un formulario conectado a un CRM.

## Arquitectura objetivo

```text
Next App Router
  ├── (marketing)   páginas públicas y SEO
  ├── (auth)        login, recuperación y verificación
  └── (workspace)   sesión, tenant, permisos, 2FA y navegación del producto

modules/<domain>
  ├── domain        entidades, reglas e invariantes propias
  ├── application   casos de uso y puertos requeridos
  ├── infrastructure adaptadores para los puertos del módulo
  └── presentation  componentes y páginas del dominio

shared             primitivas transversales con contratos pequeños
infrastructure     HTTP, almacenamiento y adaptadores verdaderamente comunes
```

La regla de dependencias objetivo apunta hacia las reglas del dominio:

```text
presentation → application → domain
infrastructure → implementa puertos de application/domain
app → compone módulos, layouts y adaptadores
```

React, Next.js, Axios, `localStorage` y los detalles de NestJS no deben filtrarse al núcleo de reglas del dominio. Se usa una interfaz cuando permite sustituir un adaptador, aislar una regla o probar un caso de uso; se evita crear capas vacías o interfaces que solo renombran una clase.

## Fases de trabajo

| Fase | Trabajo | Criterio de salida | Estado |
|---|---|---|---|
| 0. Migración del framework | App Router, route groups, proxy a API, retiro de Vite y React Router | `next build` genera todas las rutas y el frontend no importa React Router | Hecha |
| 1. Cierre funcional | Revisar flujos con usuario, recuperación, 2FA, permisos, deep links y navegación atrás/adelante | Cada ruta vieja abre la misma pantalla; los flujos conservan su contrato con Nest | Siguiente |
| 2. Autenticación de servidor | Definir con Nest el intercambio y refresh de sesión con cookie `HttpOnly`, `Secure`, `SameSite`; mover mutaciones sensibles a Route Handlers/BFF y tratar CSRF | La autorización se valida en servidor/API; ningún token duradero se expone a JavaScript | Pendiente de contrato con API |
| 3. Módulos y SOLID | Para cada dominio, definir tipos de dominio y puertos; implementar adaptadores HTTP; hacer que casos de uso reciban puertos; retirar servicios directos de las pantallas | Presentación → caso de uso → puerto; infraestructura implementa contratos; módulo verificable aislado | Pendiente por dominio |
| 4. Tenancy SaaS | Acordar creación/selección de organización, contexto de tenant, claims/headers y políticas de datos con Nest y persistencia | El servidor valida tenant en cada solicitud y evita acceso cruzado; frontend solo cambia el contexto visible | Pendiente de contrato de backend |
| 5. Next nativo | Convertir gradualmente pantallas cliente a Server Components donde no requieran estado del navegador; reducir el adaptador de navegación; separar formularios e interacciones cliente | Marketing se sirve estáticamente/SSR; las páginas del producto envían al cliente solo lo necesario | Pendiente por dominio |
| 6. UI y estilos | Sustituir componentes Bootstrap y estilos globales de compatibilidad por componentes semánticos del sistema visual; eliminar CSS antiguo solo cuando la página ya no lo use | No hay dependencia de `legacy-pages.css`; componentes accesibles y consistentes | Pendiente por dominio |
| 7. Operación de producción | Configurar env server-only, headers/cookies, logs sin datos clínicos, observabilidad, límites de caché y pipeline de despliegue | Deploy reproducible y aislamiento verificado por tenant | Pendiente de plataforma |

## Orden recomendado para las fases 1 a 6

1. **Acceso y usuarios:** login, recuperación, 2FA, perfiles, usuarios, roles y permisos. Aquí se define el contrato de identidad, la sesión y la autorización.
2. **Residentes:** expediente, familia, contactos de emergencia y actividad del residente.
3. **Atención clínica:** enfermería, historial, medicamentos, fisioterapia, psicología y trabajo social.
4. **Operación:** programas, vacunas, entrada/salida, notificaciones y auditoría.
5. **Configuración y administración:** preferencias, seguridad y controles de auditoría.
6. Al terminar cada módulo, borrar sus imports antiguos y estilos de compatibilidad; no mantener dos caminos de escritura en paralelo.

## Decisiones que deben tomarse con el backend

- ¿La API emitirá cookies de sesión/refresh o Next será el único punto que las administra?
- ¿Cómo se crea, selecciona y cambia una organización por usuario?
- ¿El tenant viaja como claim firmado, cabecera derivada de sesión o subdominio? La API debe comprobarlo; un valor enviado por el navegador no es autoridad.
- ¿Qué garantía de aislamiento aplicará la persistencia y cómo se validará entre consultas, trabajos en segundo plano y auditoría?
- ¿Qué entorno recibe solicitudes de demo y qué dirección de contacto sustituye al correo actual del repositorio?

No se debe publicar un selector multi-tenant ni asumir rutas como `/t/:tenant` hasta cerrar estos contratos.

## Criterios generales de aceptación

- `bun run build` termina sin errores y la tabla de Next contiene rutas públicas, auth y producto.
- Las rutas antiguas mantienen su URL y comportamiento; `/` deja de ser login y pasa a marketing.
- Los grupos públicos nunca montan la navegación ni la autorización del workspace.
- La API y la persistencia aplican los permisos y el aislamiento multi-tenant; las guardas del navegador solo son UX.
- Las reglas de aplicación no importan Next, React, Axios, almacenamiento del navegador ni servicios concretos.
- Las interfaces se crean en límites con más de una implementación, dependencia externa o necesidad real de aislamiento.
- Los flujos con datos personales o clínicos no registran valores sensibles en logs, URLs, cachés públicas ni analítica de marketing.
- Las pruebas de ruta, sesión, permisos, 2FA y aislamiento se ejecutan antes de desplegar cada fase.

## Verificación de esta entrega

- Build de producción: `bun run build` — correcto.
- Suites unitarias y e2e: no ejecutadas en esta entrega.
